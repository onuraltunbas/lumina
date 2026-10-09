# -*- coding: utf-8 -*-
"""Girdi filtreleri ve DB tabanlı hız limiti."""

import datetime
import re
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from .config import CONFIG
from .models import ChatMessage

_BANNED = [w.lower() for w in CONFIG["banned_words"]]
_SENSITIVE = [re.compile(p) for p in CONFIG["sensitive_regex"]]
_INJECTION = [re.compile(p, re.IGNORECASE) for p in CONFIG["injection_regex"]]
_TZ = ZoneInfo(CONFIG["timezone"])


def check_content(text: str) -> tuple[str, str] | None:
    """İçerik ihlali varsa (kod, kullanıcıya mesaj) döner."""
    if not text.strip():
        return "empty", "Boş mesaj gönderemezsin 🙂"
    if len(text) > CONFIG["max_input_chars"]:
        return "too_long", f"Mesajın çok uzun ({len(text)}/{CONFIG['max_input_chars']} karakter). Biraz kısaltır mısın? ✂️"
    low = text.casefold()
    for w in _BANNED:
        if w in low:
            return "banned_word", "Bu mesajda paylaşmaman gereken bir ifade var, o yüzden gönderemedim 🔒"
    for r in _SENSITIVE:
        if r.search(text):
            return "sensitive", "Mesajında TC kimlik / kart / IBAN gibi kişisel bir veri olabilir. Güvenliğin için göndermedim 🛡️"
    for r in _INJECTION:
        if r.search(text):
            return "injection", "Kurallarımı değiştiremem ama çalışma konusunda sana seve seve yardım ederim! 📚"
    return None


def _today_start_utc() -> datetime.datetime:
    now_local = datetime.datetime.now(_TZ)
    start_local = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    return start_local.astimezone(datetime.timezone.utc).replace(tzinfo=None)


def usage(db: Session, user_id: int) -> dict:
    """Engellenmemiş (API'ye giden) kullanıcı mesajlarını sayar."""
    base = db.query(ChatMessage).filter(
        ChatMessage.user_id == user_id,
        ChatMessage.role == "user",
        ChatMessage.blocked.is_(False),
    )
    minute_ago = datetime.datetime.utcnow() - datetime.timedelta(seconds=60)
    return {
        "minute_used": base.filter(ChatMessage.created_at >= minute_ago).count(),
        "day_used": base.filter(ChatMessage.created_at >= _today_start_utc()).count(),
        "minute_limit": CONFIG["rate_limit_per_minute"],
        "day_limit": CONFIG["rate_limit_per_day"],
    }


def check_rate(db: Session, user_id: int) -> str | None:
    u = usage(db, user_id)
    if u["day_used"] >= u["day_limit"]:
        return f"Bugünlük {u['day_limit']} soru hakkını doldurdun 🌙 Yarın görüşmek üzere!"
    if u["minute_used"] >= u["minute_limit"]:
        return "Biraz yavaşla şampiyon 😅 Bir dakika içinde tekrar sorabilirsin."
    return None
