# -*- coding: utf-8 -*-
"""Sohbet geçmişi tablosu (Lumina'nın lumina.db'sine eklenir)."""

import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from database import Base  # Lumina'nın ortak Base'i


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(16), nullable=False)          # "user" | "model"
    content = Column(Text, nullable=False)
    blocked = Column(Boolean, default=False)            # filtreye takılan kullanıcı mesajı
    block_reason = Column(String(64), nullable=True)
    test_result_id = Column(Integer, nullable=True)     # cevap anında kullanılan test sonucu
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "blocked": self.blocked,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
        }
