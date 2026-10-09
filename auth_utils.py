# -*- coding: utf-8 -*-
"""
Lumina Studio - Kimlik Doğrulama & Oturum Yardımcıları
PBKDF2-HMAC-SHA256 ile güvenli parola özetleme, kriptografik oturum token üretimi ve doğrulama.
"""

import hashlib
import hmac
import secrets
import datetime
from typing import Optional, Tuple
from fastapi import Request
from sqlalchemy.orm import Session

from database import User, UserSession

COOKIE_NAME = "lumina_session"
SALT_BYTES = 16
HASH_ITERATIONS = 100_000
ALGORITHM = "sha256"


def hash_password(password: str) -> str:
    """
    Parolayı PBKDF2-HMAC-SHA256 ile tuzlayıp özetler.
    Format: pbkdf2_sha256$iterations$salt_hex$hash_hex
    """
    salt = secrets.token_bytes(SALT_BYTES)
    key = hashlib.pbkdf2_hmac(
        ALGORITHM,
        password.encode("utf-8"),
        salt,
        HASH_ITERATIONS
    )
    return f"pbkdf2_sha256${HASH_ITERATIONS}${salt.hex()}${key.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    """
    Verilen parolanın veritabanındaki özetle eşleştiğini doğrular (timing-attack korumalı).
    """
    try:
        parts = hashed.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        original_hash = bytes.fromhex(parts[3])

        computed_hash = hashlib.pbkdf2_hmac(
            ALGORITHM,
            password.encode("utf-8"),
            salt,
            iterations
        )
        return hmac.compare_digest(original_hash, computed_hash)
    except Exception:
        return False


def get_client_ip(request: Optional[Request]) -> str:
    if not request or not request.client:
        return "127.0.0.1"
    # Reverse proxy header'ları kontrol et
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host or "127.0.0.1"


def get_user_agent(request: Optional[Request]) -> str:
    if not request:
        return ""
    return request.headers.get("user-agent", "")[:250]


def create_session(
    db: Session,
    user_id: int,
    remember_me: bool = False,
    request: Optional[Request] = None
) -> Tuple[UserSession, int]:
    """
    Kullanıcı için yeni bir oturum tokeni oluşturur ve DB'ye kaydeder.
    Dönüş: (UserSession nesnesi, saniye cinsinden max_age)
    """
    token = secrets.token_urlsafe(48)
    now = datetime.datetime.utcnow()

    if remember_me:
        # Beni hatırla seçildiyse: 30 gün geçerli
        max_age = 30 * 24 * 60 * 60
        expires_at = now + datetime.timedelta(days=30)
    else:
        # Normal oturum: 24 saat geçerli
        max_age = 24 * 60 * 60
        expires_at = now + datetime.timedelta(days=1)

    ip = get_client_ip(request)
    ua = get_user_agent(request)

    session_rec = UserSession(
        user_id=user_id,
        session_token=token,
        remember_me=remember_me,
        expires_at=expires_at,
        ip_address=ip,
        user_agent=ua,
        created_at=now
    )
    db.add(session_rec)
    db.commit()
    db.refresh(session_rec)

    return session_rec, max_age


def get_session_user(db: Session, session_token: Optional[str]) -> Optional[User]:
    """
    Oturum tokenini doğrular, süresi geçmişse temizler, geçerliyse User nesnesini döner.
    """
    if not session_token:
        return None

    now = datetime.datetime.utcnow()
    session_rec = db.query(UserSession).filter(
        UserSession.session_token == session_token
    ).first()

    if not session_rec:
        return None

    # Süre dolmuş mu?
    if session_rec.expires_at < now:
        db.delete(session_rec)
        db.commit()
        return None

    user = db.query(User).filter(User.id == session_rec.user_id).first()
    if not user or not user.is_active:
        return None

    return user


def delete_session(db: Session, session_token: Optional[str]) -> None:
    """
    Oturumu veritabanından siler (Logout).
    """
    if not session_token:
        return

    session_rec = db.query(UserSession).filter(
        UserSession.session_token == session_token
    ).first()

    if session_rec:
        db.delete(session_rec)
        db.commit()
