# -*- coding: utf-8 -*-
"""
Lumina Studio - API Route'ları
İletişim formu, bülten aboneliği ve sistem sağlık kontrolleri.
"""

import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, ContactMessage, NewsletterSubscriber

router = APIRouter(prefix="/api", tags=["API"])


class ContactFormSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=160)
    message: str = Field(..., min_length=1, max_length=5000)


class NewsletterSchema(BaseModel):
    email: str = Field(..., min_length=3, max_length=160)


@router.post("/contact")
async def handle_contact_form(payload: ContactFormSchema, request: Request, db: Session = Depends(get_db)):
    """
    İletişim formundan gelen verileri karşılar ve veritabanına kaydeder.
    """
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")[:250]

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
    return {
        "status": "ok",
        "service": "Lumina Creative Studio",
        "total_messages": msg_count,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
