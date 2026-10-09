# -*- coding: utf-8 -*-
"""
Lumi Chat - Lumina dashboard'u için öğrenme stili asistanı.

Lumina'ya entegrasyon (server.py):
    from lumi_chat import router as lumi_router
    app.include_router(lumi_router)

Gereksinim: Lumina'nın `database` ve `auth_utils` modülleri import edilebilir olmalı.
"""

from .router import router  # noqa: F401
