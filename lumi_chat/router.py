# -*- coding: utf-8 -*-
"""Lumi Chat API endpoint'leri (/api/chat/*)."""

import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from google import genai
from google.genai import types
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth_utils import COOKIE_NAME, get_session_user
from database import Session_, TestResult, get_db

from . import guard
from .config import CONFIG, PKG_DIR, get_api_key
from .models import ChatMessage
from .prompt import build_system_prompt

router = APIRouter(prefix="/api/chat", tags=["Lumi Chat"])

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        key = get_api_key()
        if not key:
            raise HTTPException(status_code=503, detail="Lumi şu an kullanılamıyor (API anahtarı yok).")
        _client = genai.Client(api_key=key)
    return _client


def _require_user(request: Request, db: Session):
    user = get_session_user(db, request.cookies.get(COOKIE_NAME))
    if not user:
        raise HTTPException(status_code=401, detail="Lumi ile konuşmak için giriş yapmalısın.")
    return user


def _latest_result(db: Session, user_id: int):
    return (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(TestResult.created_at.desc())
        .first()
    )


class ChatIn(BaseModel):
    message: str


# ---------------------------------------------------------------------
# Widget dosyaları (Lumina'nın static klasörüne kopyalamaya gerek yok)
# ---------------------------------------------------------------------
@router.get("/widget.js", include_in_schema=False)
def widget_js():
    return FileResponse(PKG_DIR / "static" / "lumi-chat.js", media_type="application/javascript")


@router.get("/widget.css", include_in_schema=False)
def widget_css():
    return FileResponse(PKG_DIR / "static" / "lumi-chat.css", media_type="text/css")


# ---------------------------------------------------------------------
# Durum / geçmiş
# ---------------------------------------------------------------------
@router.get("/init")
def chat_init(request: Request, db: Session = Depends(get_db)):
    """Widget açılışında: geçmiş, limitler, hızlı butonlar, test durumu."""
    user = get_session_user(db, request.cookies.get(COOKIE_NAME))
    if not user:
        guest_used = request.cookies.get("lumi_guest_used") == "1"
        return {
            "bot_name": CONFIG["bot_name"],
            "username": "Misafir",
            "is_guest": True,
            "guest_used": guest_used,
            "has_test": False,
            "quick_prompts": ["Nasıl çalışmalıyım?", "Lumina nedir?"],
            "max_input_chars": CONFIG["max_input_chars"],
            "usage": {"minute_used": 1 if guest_used else 0, "day_used": 1 if guest_used else 0,
                      "minute_limit": 1, "day_limit": 1},
            "history": [],
        }

    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )
    return {
        "bot_name": CONFIG["bot_name"],
        "username": user.username,
        "is_guest": False,
        "guest_used": False,
        "has_test": _latest_result(db, user.id) is not None,
        "quick_prompts": CONFIG["quick_prompts"],
        "max_input_chars": CONFIG["max_input_chars"],
        "usage": guard.usage(db, user.id),
        "history": [m.to_dict() for m in msgs],
    }


# ---------------------------------------------------------------------
# Mesaj gönder (akışlı cevap)
# ---------------------------------------------------------------------
@router.post("/send")
async def chat_send(payload: ChatIn, request: Request, db: Session = Depends(get_db)):
    user = get_session_user(db, request.cookies.get(COOKIE_NAME))
    text = payload.message.strip()

    # 1) İçerik filtresi -> engellenen mesaj da kaydedilir ama API'ye gitmez
    violation = guard.check_content(text)
    if violation:
        code, msg = violation
        if user and code != "empty":
            db.add(ChatMessage(user_id=user.id, role="user", content=text[:2000],
                               blocked=True, block_reason=code))
            db.commit()
        return JSONResponse(status_code=400, content={"error": code, "detail": msg})

    # Misafir kontrolü (1 soru hakkı)
    if not user:
        if request.cookies.get("lumi_guest_used") == "1":
            return JSONResponse(status_code=403, content={
                "error": "guest_limit",
                "detail": "Kayıt olursan veya hesabın varsa giriş yaparsan seni daha iyi tanıyıp daha iyi yardımcı olabilirim! ✨",
                "show_auth_buttons": True
            })

    # 2) Kayıtlı kullanıcı Hız limiti
    if user:
        rate_msg = guard.check_rate(db, user.id)
        if rate_msg:
            return JSONResponse(status_code=429, content={"error": "rate_limit", "detail": rate_msg,
                                                          "usage": guard.usage(db, user.id)})

    client = _get_client()

    # 3) Bağlam ve Prompt hazırlığı
    if user:
        n = CONFIG["history_turns_to_model"] * 2
        recent = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == user.id, ChatMessage.blocked.is_(False))
            .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
            .limit(n)
            .all()
        )[::-1]
        contents = [types.Content(role=m.role, parts=[types.Part(text=m.content)]) for m in recent]
        contents.append(types.Content(role="user", parts=[types.Part(text=text)]))

        result = _latest_result(db, user.id)
        system_instruction = build_system_prompt(user.username, result, is_guest=False)
        user_msg = ChatMessage(user_id=user.id, role="user", content=text,
                               test_result_id=result.id if result else None)
        db.add(user_msg)
        db.commit()
        user_id, result_id = user.id, (result.id if result else None)
    else:
        # Misafir kullanıcı: doğrudan tanışma prompt'u
        contents = [types.Content(role="user", parts=[types.Part(text=text)])]
        system_instruction = build_system_prompt("Misafir", None, is_guest=True)
        user_id, result_id = None, None

    gen_cfg = types.GenerateContentConfig(
        system_instruction=system_instruction,
        max_output_tokens=CONFIG["max_output_tokens"],
        temperature=CONFIG["temperature"],
        thinking_config=types.ThinkingConfig(thinking_budget=256),
    )

    async def stream():
        reply = ""
        try:
            models_to_try = [CONFIG["model"]]
            for fb in ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash"]:
                if fb not in models_to_try:
                    models_to_try.append(fb)

            success = False
            last_error = None
            for m_name in models_to_try:
                try:
                    stream_call = await client.aio.models.generate_content_stream(
                        model=m_name, contents=contents, config=gen_cfg
                    )
                    async for chunk in stream_call:
                        if chunk.text:
                            reply += chunk.text
                            yield chunk.text
                    success = True
                    break
                except Exception as e:
                    last_error = e
                    print(f"[lumi_chat] Model {m_name} hatası: {e}")
                    if reply:
                        break
                    continue

            if not success and not reply:
                print(f"[lumi_chat] Tüm modeller başarısız oldu. Son hata: {last_error}")
                err = "\n\n⚠️ Şu an cevap veremiyorum, biraz sonra tekrar dener misin?"
                reply += err
                yield err
        finally:
            if user_id:
                s = Session_()
                try:
                    s.add(ChatMessage(user_id=user_id, role="model",
                                      content=reply or "(boş cevap)", test_result_id=result_id,
                                      created_at=datetime.datetime.utcnow()))
                    s.commit()
                finally:
                    s.close()

    res = StreamingResponse(stream(), media_type="text/plain; charset=utf-8",
                            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
    if not user:
        res.set_cookie("lumi_guest_used", "1", max_age=86400, httponly=False, samesite="lax")
    return res
