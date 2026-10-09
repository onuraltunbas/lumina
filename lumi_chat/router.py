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
    user = _require_user(request, db)
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )
    return {
        "bot_name": CONFIG["bot_name"],
        "username": user.username,
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
    user = _require_user(request, db)
    text = payload.message.strip()

    # 1) İçerik filtresi -> engellenen mesaj da kaydedilir ama API'ye gitmez
    violation = guard.check_content(text)
    if violation:
        code, msg = violation
        if code != "empty":
            db.add(ChatMessage(user_id=user.id, role="user", content=text[:2000],
                               blocked=True, block_reason=code))
            db.commit()
        return JSONResponse(status_code=400, content={"error": code, "detail": msg})

    # 2) Hız limiti
    rate_msg = guard.check_rate(db, user.id)
    if rate_msg:
        return JSONResponse(status_code=429, content={"error": "rate_limit", "detail": rate_msg,
                                                      "usage": guard.usage(db, user.id)})

    client = _get_client()

    # 3) Bağlam: son N tur (engellenmemiş) + yeni mesaj
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
    gen_cfg = types.GenerateContentConfig(
        system_instruction=build_system_prompt(user.username, result),
        max_output_tokens=CONFIG["max_output_tokens"],
        temperature=CONFIG["temperature"],
    )

    user_msg = ChatMessage(user_id=user.id, role="user", content=text,
                           test_result_id=result.id if result else None)
    db.add(user_msg)
    db.commit()
    user_id, result_id = user.id, (result.id if result else None)

    async def stream():
        reply = ""
        try:
            async for chunk in await client.aio.models.generate_content_stream(
                model=CONFIG["model"], contents=contents, config=gen_cfg
            ):
                if chunk.text:
                    reply += chunk.text
                    yield chunk.text
        except Exception as e:  # noqa: BLE001
            print(f"[lumi_chat] Gemini hatası: {e}")
            err = "\n\n⚠️ Şu an cevap veremiyorum, biraz sonra tekrar dener misin?"
            reply += err
            yield err
        finally:
            # Akış bitince (veya istemci koparsa) cevabı kaydet
            s = Session_()
            try:
                s.add(ChatMessage(user_id=user_id, role="model",
                                  content=reply or "(boş cevap)", test_result_id=result_id,
                                  created_at=datetime.datetime.utcnow()))
                s.commit()
            finally:
                s.close()

    return StreamingResponse(stream(), media_type="text/plain; charset=utf-8",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
