# -*- coding: utf-8 -*-
"""
Geliştirme sunucusu: Lumina'yı hiç değiştirmeden Lumi'yi test eder.

- /home/onur/lumina kodunu import eder (LUMINA_DIR ile değiştirilebilir)
- lumina.db'nin KOPYASINI (dev_lumina.db) kullanır -> gerçek veritabanına dokunmaz
- /dashboard sayfasına widget script'ini enjekte eder

Çalıştır:  python3 dev_server.py   ->  http://localhost:8001/dashboard
"""

import os
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).parent.resolve()
LUMINA_DIR = Path(os.getenv("LUMINA_DIR", "/home/onur/lumina")).resolve()
DEV_DB = HERE / "dev_lumina.db"

sys.path.insert(0, str(LUMINA_DIR))
sys.path.insert(0, str(HERE))

if not DEV_DB.exists():
    shutil.copy(LUMINA_DIR / "lumina.db", DEV_DB)
    print(f"[dev] lumina.db kopyalandı -> {DEV_DB.name}")

# Lumina'nın engine'ini kopya DB'ye yönlendir (server import edilmeden önce)
import database  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402

database.engine = create_engine(f"sqlite:///{DEV_DB}", connect_args={"check_same_thread": False})
database.Session_.configure(bind=database.engine)

from fastapi.responses import HTMLResponse, RedirectResponse  # noqa: E402
from starlette.routing import Route  # noqa: E402

import lumi_chat  # noqa: E402  (ChatMessage modelini Base'e kaydeder)
from auth_utils import COOKIE_NAME, get_session_user  # noqa: E402
from server import app  # noqa: E402

database.Base.metadata.create_all(bind=database.engine)
app.include_router(lumi_chat.router)

WIDGET_TAG = '<script src="/api/chat/widget.js" defer></script>'


def dev_dashboard(request):
    db = database.Session_()
    try:
        if not get_session_user(db, request.cookies.get(COOKIE_NAME)):
            return RedirectResponse("/auth", status_code=303)
    finally:
        db.close()
    html = (LUMINA_DIR / "templates" / "dashboard.html").read_text(encoding="utf-8")
    return HTMLResponse(html.replace("</body>", f"  {WIDGET_TAG}\n</body>"))


# Lumina'nın /dashboard route'unun önüne geç
app.router.routes.insert(0, Route("/dashboard", dev_dashboard, methods=["GET", "HEAD"]))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", "8001")))
