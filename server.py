# -*- coding: utf-8 -*-
"""
Lumina Creative Studio - FastAPI Sunucu Giriş Noktası
Mimarisi /home/onur/opc-lisans-sunucu referans alınarak tasarlanmıştır.

FastAPI + SQLite (SQLAlchemy) + Static Assets + Interactive Animations
"""

import os
import pathlib

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from database import init_db
from html_404 import render_404
import routes_api
import routes_html

# =====================================================================
# FASTAPI UYGULAMASI
# =====================================================================
app = FastAPI(
    title="Lumina - Creative Design Studio & Portfolio",
    description="Modern, yüksek performanslı ve interaktif portföy web sitesi.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None
)

# =====================================================================
# CORS AYARLARI
# =====================================================================
_cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "*")
_cors_list = [o.strip() for o in _cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_list,
    allow_credentials=True if _cors_origins != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# STATIC DOSYALAR
# =====================================================================
_base_dir = pathlib.Path(__file__).parent.resolve()
_static_dir = _base_dir / "static"
_static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")


# =====================================================================
# GLOBAL EXCEPTION HANDLER
# =====================================================================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"❌ Sunucu Hatası: {request.url} -> {str(exc)}"
    print(error_msg)
    return JSONResponse(
        status_code=500,
        content={"detail": "Sunucuda bir hata oluştu. Lütfen tekrar deneyiniz."}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return HTMLResponse(content=render_404(request.url.path), status_code=404)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# Initialize database tables
init_db()

# =====================================================================
# STARTUP / SHUTDOWN
# =====================================================================
@app.on_event("startup")
async def startup_event():
    print("🚀 [Lumina Studio] Veritabanı hazırlandı ve sunucu başarıyla ayağa kalktı.")

@app.on_event("shutdown")
def shutdown_event():
    print("🚧 [Lumina Studio] Sunucu kapatılıyor.")


# =====================================================================
# ROUTER KAYITLARI
# =====================================================================
app.include_router(routes_api.router)
app.include_router(routes_html.router)


# =====================================================================
# DOĞRUDAN ÇALIŞTIRMA DESTEĞİ
# =====================================================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
