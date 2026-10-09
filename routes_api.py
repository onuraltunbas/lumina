# -*- coding: utf-8 -*-
"""
Lumina Studio - API Route'ları
İletişim formu, bülten aboneliği, sistem sağlık kontrolleri ve kullanıcı kimlik doğrulama / test API'leri.
"""

import re
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, ContactMessage, NewsletterSubscriber, User, UserSession, TestResult
from auth_utils import (
    COOKIE_NAME,
    hash_password,
    verify_password,
    create_session,
    get_session_user,
    delete_session,
    get_client_ip,
    get_user_agent
)

router = APIRouter(prefix="/api", tags=["API"])


# =====================================================================
# PYDANTIC ŞEMALARI
# =====================================================================
class ContactFormSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=160)
    message: str = Field(..., min_length=1, max_length=5000)


class NewsletterSchema(BaseModel):
    email: str = Field(..., min_length=3, max_length=160)


class RegisterSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4, max_length=128)


class LoginSchema(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)
    remember_me: bool = Field(default=False)


class TestResultSaveSchema(BaseModel):
    score_gorsel: float = Field(default=0.0, ge=0.0, le=100.0)
    score_isitsel: float = Field(default=0.0, ge=0.0, le=100.0)
    score_yazarak: float = Field(default=0.0, ge=0.0, le=100.0)
    score_okuyarak: float = Field(default=0.0, ge=0.0, le=100.0)
    score_deneyimsel: float = Field(default=0.0, ge=0.0, le=100.0)
    dominant_style: Optional[str] = Field(default=None, max_length=64)
    details_json: Optional[str] = Field(default=None)


# =====================================================================
# KİMLİK DOĞRULAMA (AUTH) ENDPOINT'LERİ
# =====================================================================

@router.post("/auth/register")
async def register_user(
    payload: RegisterSchema,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Yeni kullanıcı kaydı oluşturur, otomatik oturum açar ve oturum çerezi döner.
    """
    raw_username = payload.username.strip()
    raw_password = payload.password.strip()

    # Kullanıcı adı kontrolü: Türkçe karakterler, harfler, rakamlar, alt çizgi
    if not re.match(r"^[a-zA-Z0-9_çÇğĞıİöÖşŞüÜ]{3,30}$", raw_username):
        raise HTTPException(
            status_code=400,
            detail="Kullanıcı adı 3-30 karakter uzunluğunda olmalı ve sadece harf, rakam ve alt çizgi içermelidir."
        )

    if len(raw_password) < 4:
        raise HTTPException(
            status_code=400,
            detail="Şifre en az 4 karakter uzunluğunda olmalıdır."
        )

    # Kullanıcı adı kullanımda mı? (küçük/büyük harf duyarsız kontrol)
    existing_user = db.query(User).filter(
        User.username.ilike(raw_username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin."
        )

    client_ip = get_client_ip(request)
    user_agent = get_user_agent(request)

    # Kullanıcıyı oluştur
    new_user = User(
        username=raw_username,
        password_hash=hash_password(raw_password),
        is_active=True,
        ip_address=client_ip,
        user_agent=user_agent,
        created_at=datetime.datetime.utcnow(),
        last_login=datetime.datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Oturum aç ve çerez ata
    session_rec, max_age = create_session(db, new_user.id, remember_me=True, request=request)
    response.set_cookie(
        key=COOKIE_NAME,
        value=session_rec.session_token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
        path="/"
    )

    return {
        "success": True,
        "message": f"Tebrikler {new_user.username}! Kaydınız başarıyla oluşturuldu.",
        "user": new_user.to_dict()
    }


@router.post("/auth/login")
async def login_user(
    payload: LoginSchema,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Kullanıcı girişi yapar. 'Beni Hatırla' işaretlenirse 30 günlük kalıcı oturum verir.
    """
    raw_username = payload.username.strip()
    raw_password = payload.password.strip()

    user = db.query(User).filter(User.username.ilike(raw_username)).first()
    if not user or not verify_password(raw_password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Bu hesap devre dışı bırakılmıştır. Lütfen yöneticiyle iletişime geçin."
        )

    # Kullanıcı son giriş & IP bilgisini güncelle
    user.last_login = datetime.datetime.utcnow()
    user.ip_address = get_client_ip(request)
    user.user_agent = get_user_agent(request)
    db.commit()

    # Yeni oturum oluştur
    session_rec, max_age = create_session(
        db,
        user.id,
        remember_me=payload.remember_me,
        request=request
    )

    response.set_cookie(
        key=COOKIE_NAME,
        value=session_rec.session_token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
        path="/"
    )

    return {
        "success": True,
        "message": f"Hoş geldiniz, {user.username}!",
        "user": user.to_dict()
    }


@router.post("/auth/logout")
async def logout_user(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Aktif oturumu sonlandırır ve tarayıcı çerezini temizler.
    """
    token = request.cookies.get(COOKIE_NAME)
    if token:
        delete_session(db, token)

    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {
        "success": True,
        "message": "Başarıyla çıkış yapıldı."
    }


@router.get("/auth/me")
async def get_current_user_info(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Aktif oturumdaki kullanıcının bilgilerini ve son test sonucunu döner.
    """
    token = request.cookies.get(COOKIE_NAME)
    user = get_session_user(db, token)

    if not user:
        return {
            "authenticated": False,
            "user": None,
            "latest_result": None
        }

    # Son test sonucunu çek
    latest_result = db.query(TestResult).filter(
        TestResult.user_id == user.id
    ).order_by(TestResult.created_at.desc()).first()

    return {
        "authenticated": True,
        "user": user.to_dict(),
        "latest_result": latest_result.to_dict() if latest_result else None
    }


@router.post("/auth/results")
async def save_test_result(
    payload: TestResultSaveSchema,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Giriş yapmış kullanıcının test sonucunu kaydeder.
    Her öğrenme stili skoru 0-100 arasında bağımsız bir yüzdedir.
    """
    token = request.cookies.get(COOKIE_NAME)
    user = get_session_user(db, token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Test sonucunu kaydetmek için lütfen giriş yapınız."
        )

    # Baskın stili belirle (en yüksek puanlı model)
    scores = {
        "gorsel": payload.score_gorsel,
        "isitsel": payload.score_isitsel,
        "yazarak": payload.score_yazarak,
        "okuyarak": payload.score_okuyarak,
        "deneyimsel": payload.score_deneyimsel
    }
    dominant = payload.dominant_style or max(scores, key=scores.get)

    result = TestResult(
        user_id=user.id,
        score_gorsel=payload.score_gorsel,
        score_isitsel=payload.score_isitsel,
        score_yazarak=payload.score_yazarak,
        score_okuyarak=payload.score_okuyarak,
        score_deneyimsel=payload.score_deneyimsel,
        dominant_style=dominant,
        details_json=payload.details_json,
        created_at=datetime.datetime.utcnow()
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "success": True,
        "message": "Test sonucu başarıyla profilinize kaydedildi.",
        "result": result.to_dict()
    }


@router.get("/auth/results")
async def list_user_results(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Kullanıcının geçmiş tüm test sonuçlarını listeler.
    """
    token = request.cookies.get(COOKIE_NAME)
    user = get_session_user(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli.")

    results = db.query(TestResult).filter(
        TestResult.user_id == user.id
    ).order_by(TestResult.created_at.desc()).all()

    return {
        "success": True,
        "count": len(results),
        "data": [r.to_dict() for r in results]
    }


# =====================================================================
# DİĞER GENEL API ENDPOINT'LERİ (İletişim & Bülten)
# =====================================================================

@router.post("/contact")
async def handle_contact_form(payload: ContactFormSchema, request: Request, db: Session = Depends(get_db)):
    """
    İletişim formundan gelen verileri karşılar ve veritabanına kaydeder.
    """
    client_ip = get_client_ip(request)
    user_agent = get_user_agent(request)

    name = payload.name.strip()
    email = payload.email.strip()
    message = payload.message.strip()

    if not name or not email or not message:
        raise HTTPException(status_code=400, detail="Lütfen tüm zorunlu alanları doldurunuz.")

    try:
        new_msg = ContactMessage(
            name=name,
            email=email,
            message=message,
            ip_address=client_ip,
            user_agent=user_agent,
            created_at=datetime.datetime.utcnow()
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)

        return {
            "success": True,
            "message": "Thank you! Your submission has been received!",
            "id": new_msg.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Mesaj kaydedilemedi: {str(e)}")


@router.get("/contact/messages")
async def list_contact_messages(limit: int = 50, db: Session = Depends(get_db)):
    """
    Gönderilen iletişim mesajlarını listeler.
    """
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(limit).all()
    return {
        "success": True,
        "count": len(messages),
        "data": [msg.to_dict() for msg in messages]
    }


@router.post("/newsletter")
async def handle_newsletter(payload: NewsletterSchema, db: Session = Depends(get_db)):
    """
    Bülten aboneliği kaydeder.
    """
    email = payload.email.strip().lower()
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if existing:
        return {"success": True, "message": "Zaten abonesiniz."}

    new_sub = NewsletterSubscriber(email=email)
    db.add(new_sub)
    db.commit()
    return {"success": True, "message": "Aboneliğiniz başarıyla oluşturuldu."}


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Servis sağlık durumu kontrolü.
    """
    msg_count = db.query(ContactMessage).count()
    user_count = db.query(User).count()
    return {
        "status": "ok",
        "service": "Lumina Creative Studio",
        "total_messages": msg_count,
        "total_users": user_count,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
