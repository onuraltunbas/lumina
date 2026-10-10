# -*- coding: utf-8 -*-
"""Yapılandırma ve API anahtarı yükleme."""

import json
import os
from pathlib import Path

PKG_DIR = Path(__file__).parent
CONFIG = json.loads((PKG_DIR / "lumi_config.json").read_text(encoding="utf-8"))


def _load_env():
    """Paket klasöründeki veya bir üst klasördeki .env dosyasını yükler."""
    for env in (PKG_DIR / ".env", PKG_DIR.parent / ".env"):
        try:
            if env.exists():
                for line in env.read_text(encoding="utf-8").splitlines():
                    if "=" in line and not line.lstrip().startswith("#"):
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip("\"'"))
        except Exception:
            pass


_load_env()


def get_api_key() -> str | None:
    return os.getenv("GEMINI_API_KEY")
