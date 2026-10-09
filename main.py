# -*- coding: utf-8 -*-
"""
Lumina Studio - Uvicorn Giriş Noktası
uvicorn main:app --reload komutu için yönlendirici
"""

from server import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
