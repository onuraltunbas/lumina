# -*- coding: utf-8 -*-
"""
Lumina Studio - HTML Sayfa Route'ları
Anasayfa, portföy detay sayfaları, şablon kılavuzları, auth ve kullanıcı paneli.
"""

import os
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from database import get_db
from auth_utils import COOKIE_NAME, get_session_user

router = APIRouter(tags=["HTML Pages"])

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")

def get_template(name: str) -> str:
    filepath = os.path.join(TEMPLATES_DIR, name)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Sayfa bulunamadı.")
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


# =====================================================================
# ANA SAYFA
# =====================================================================
@router.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
def index_page():
    content = get_template("index.html")
    return HTMLResponse(content=content)


# =====================================================================
# KULLANICI KİMLİK DOĞRULAMA (KAYIT OL / GİRİŞ YAP) SAYFASI
# =====================================================================
@router.api_route("/auth", methods=["GET", "HEAD"])
def auth_page(request: Request, db: Session = Depends(get_db)):
    # Eğer kullanıcı zaten geçerli bir oturuma sahipse doğrudan panele yönlendir
    token = request.cookies.get(COOKIE_NAME)
    if token and get_session_user(db, token):
        return RedirectResponse(url="/dashboard", status_code=303)
    content = get_template("auth.html")
    return HTMLResponse(content=content)


# =====================================================================
# KULLANICI DASHBOARD / KONTROL PANELİ
# =====================================================================
@router.api_route("/dashboard", methods=["GET", "HEAD"])
def dashboard_page(request: Request, db: Session = Depends(get_db)):
    # Oturum açmamış kullanıcıyı auth sayfasına yönlendir
    token = request.cookies.get(COOKIE_NAME)
    user = get_session_user(db, token) if token else None
    if not user:
        return RedirectResponse(url="/auth", status_code=303)
    content = get_template("dashboard.html")
    return HTMLResponse(content=content)


# =====================================================================
# ÖĞRENME STİLİ TESTİ
# =====================================================================
@router.api_route("/test", methods=["GET", "HEAD"], response_class=HTMLResponse)
def test_page():
    content = get_template("test.html")
    return HTMLResponse(content=content)


# =====================================================================
# PORTFÖY PROJE DETAY SAYFALARI
# =====================================================================
PROJECT_MAP = {
    "sandbox-banking-application-website": "project_sandbox.html",
    "morello-company-networking-website": "project_morello.html",
    "snowlake-social-media-website": "project_snowlake.html",
    "creatink-creative-agency-website": "project_creatink.html",
}

@router.api_route("/project/{slug}", methods=["GET", "HEAD"], response_class=HTMLResponse)
def project_detail(slug: str):
    template_name = PROJECT_MAP.get(slug)
    if not template_name:
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")
    content = get_template(template_name)
    return HTMLResponse(content=content)


# =====================================================================
# ŞABLON VE DOKÜMANTASYON SAYFALARI
# =====================================================================
@router.api_route("/template/changelog", methods=["GET", "HEAD"], response_class=HTMLResponse)
def changelog_page():
    content = get_template("changelog.html")
    return HTMLResponse(content=content)


@router.api_route("/template/license", methods=["GET", "HEAD"], response_class=HTMLResponse)
def license_page():
    content = get_template("license.html")
    return HTMLResponse(content=content)


@router.api_route("/template/style-guide", methods=["GET", "HEAD"], response_class=HTMLResponse)
def style_guide_page():
    content = get_template("style_guide.html")
    return HTMLResponse(content=content)


# =====================================================================
# 404 SAYFASI
# =====================================================================
@router.api_route("/404", methods=["GET", "HEAD"], response_class=HTMLResponse)
def not_found_page():
    content = get_template("404.html")
    return HTMLResponse(content=content, status_code=404)
