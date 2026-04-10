#!/usr/bin/env python3
"""Anker Solix C1000 Solar Dashboard - Startpunkt"""

import sys
import os
import logging

# Add anker-solix-api to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "anker-solix-api"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

import uvicorn  # noqa: E402
from app.config import SERVER_HOST, SERVER_PORT  # noqa: E402

if __name__ == "__main__":
    print(f"\n  Solar Dashboard: http://localhost:{SERVER_PORT}\n")
    uvicorn.run(
        "app.server:app",
        host=SERVER_HOST,
        port=SERVER_PORT,
        reload=False,
    )
