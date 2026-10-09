# -*- coding: utf-8 -*-
"""
Lumina Studio - Veritabanı Modülü (SQLite + SQLAlchemy)
Kullanıcı kimlik doğrulama, oturum yönetimi ve öğrenme stili test sonuçları modelleri.
"""

import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "lumina.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

Session_ = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "is_active": self.is_active,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.strftime("%d.%m.%Y %H:%M") if self.created_at else None,
            "last_login": self.last_login.strftime("%d.%m.%Y %H:%M") if self.last_login else None
        }


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_token = Column(String(128), unique=True, index=True, nullable=False)
    remember_me = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sessions")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    score_gorsel = Column(Float, default=0.0)      # 0 - 100 bağımsız yüzde
    score_isitsel = Column(Float, default=0.0)     # 0 - 100 bağımsız yüzde
    score_yazarak = Column(Float, default=0.0)     # 0 - 100 bağımsız yüzde
    score_okuyarak = Column(Float, default=0.0)    # 0 - 100 bağımsız yüzde
    score_deneyimsel = Column(Float, default=0.0)  # 0 - 100 bağımsız yüzde
    dominant_style = Column(String(64), nullable=True)
    details_json = Column(Text, nullable=True)     # Soru yanıtları ve gerekçeler
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="test_results")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "score_gorsel": self.score_gorsel,
            "score_isitsel": self.score_isitsel,
            "score_yazarak": self.score_yazarak,
            "score_okuyarak": self.score_okuyarak,
            "score_deneyimsel": self.score_deneyimsel,
            "dominant_style": self.dominant_style,
            "details_json": self.details_json,
            "created_at": self.created_at.strftime("%d.%m.%Y %H:%M") if self.created_at else None
        }


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False, index=True)
    message = Column(Text, nullable=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(256), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "ip_address": self.ip_address,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(160), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = Session_()
    try:
        yield db
    finally:
        db.close()
