#!/usr/bin/env python3
"""Fetch actual tournament cards from the Tennis Canada calendar.

Only event-like cards with a date range and Canadian location are accepted.
Unknown fields remain blank. Generic navigation links are never treated as events.
"""
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

SOURCE_NAME = "Tennis Canada"
SOURCE_URL = "https://www.tenniscanada.com/tournaments/"
OUTPUT_PATH = Path("public/data/tournaments.json")

DATE_RANGE_RE = re.compile(
    r"\b(20\d{2}-\d{2}-\d{2})\s*(?:to|–|-)\s*(20\d{2}-\d{2}-\d{2})\b",
    re.IGNORECASE,
)
LOCATION_RE = re.compile(
    r"\b([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÿ'. -]+),\s*"
    r"(BC|AB|SK|MB|ON|QC|NB|NS|PE|NL|YT|NT|NU)\b"
)
AGE_RE = re.compile(r"\bU(?:10|12|14|16|18)\b|\b\d{2}\+\b|\bRising Stars\b", re.I)
EXCLUDED_TITLE_RE = re.compile(
    r"^(tennis 101|progressive tennis|tennis courts and surfaces|"
    r"tennis points and rules|tennis shot playbook|tennis equipment|"
    r"get on court|coach|junior|adult|masters tennis|resources|subscribe|"
    r"contact us|privacy policy|about tennis canada|careers)$",
    re.I,
)

PROVINCE_NAMES = {
    "BC": "British Columbia", "AB": "Alberta", "SK": "Saskatchewan",
    "MB": "Manitoba", "ON": "Ontario", "QC": "Quebec",
    "NB": "New Brunswick", "NS": "Nova Scotia",
    "PE": "Prince Edward Island", "NL": "Newfoundland and Labrador",
    "YT": "Yukon", "NT": "Northwest Territories", "NU": "Nunavut",
}


def clean_text(value):
    return re.sub(r"\s+", " ", value or "").strip()


def parse_event_from_heading(heading):
    title = clean_text(heading.get_text(" ", strip=True))
    if not title or EXCLUDED_TITLE_RE.match(title):
        return None

    # Find the smallest ancestor that appears to contain one event.
    candidate = heading
    card_text = ""
    for _ in range(6):
        if candidate.parent is None:
            break
        candidate = candidate.parent
        text = clean_text(candidate.get_text(" ", strip=True))
        if DATE_RANGE_RE.search(text) and LOCATION_RE.search(text):
            if len(DATE_RANGE_RE.findall(text)) == 1:
                card_text = text
                break

    if not card_text:
        return None

    date_match = DATE_RANGE_RE.search(card_text)
    location_match = LOCATION_RE.search(card_text)
    if not date_match or not location_match:
        return None

    link = heading if heading.name == "a" else heading.find("a", href=True)
    if not link:
        link = heading.find_parent("a", href=True)
    if not link:
        link = candidate.find("a", href=True)

    official_url = urljoin(SOURCE_URL, link["href"]) if link and link.get("href") else SOURCE_URL
    if not official_url.startswith("https://www.tenniscanada.com/"):
        official_url = SOURCE_URL

    divisions = sorted({m.group(0).upper() for m in AGE_RE.finditer(card_text)})
    lowered = card_text.lower()
    if "adult" in lowered or re.search(r"\b18\+\b", lowered) or "masters" in lowered:
        category = "adult"
    elif divisions or "junior" in lowered:
        category = "junior"
    else:
        category = ""

    title_slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:70]
    province = location_match.group(2)
