#!/usr/bin/env python3
"""Fetch public tennis tournament listings for AURA.

Sources:
- Tennis Canada tournament calendar (Canada-wide; includes province, age and event tags)
- USTA tournament listings (US; best-effort extraction from public listing pages)

Only save events when a real title and a verifiable date range are found.
Fields not exposed by a source remain empty. If a source fails, keep its previous
events from public/data/tournaments.json rather than replacing them with nothing.
"""
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

OUTPUT_PATH = Path("public/data/tournaments.json")
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
HEADERS = {"User-Agent": USER_AGENT, "Accept-Language": "en-CA,en;q=0.9"}
TIMEOUT = 30

CANADA_NAME = "Tennis Canada"
CANADA_URL = "https://www.tenniscanada.com/tournaments"
TOURNAMENT_SOFTWARE_URL = "https://tc.tournamentsoftware.com/find"
USTA_NAME = "USTA Tournaments"
USTA_URLS = [
    "https://playtennis.usta.com/competitions/USTA/Tournaments/",
    "https://playtennis.usta.com/tournaments",
]

PROVINCE_CODES = {
    "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB",
    "New Brunswick": "NB", "Newfoundland and Labrador": "NL",
    "Northwest Territories": "NT", "Nova Scotia": "NS",
    "Nunavut": "NU", "Ontario": "ON", "Prince Edward Island": "PE",
    "Quebec": "QC", "Saskatchewan": "SK", "Yukon": "YT",
}
CODE_TO_PROVINCE = {v: k for k, v in PROVINCE_CODES.items()}
DATE_ISO_RANGE = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\s*(?:to|[-–—])\s*(20\d{2}-\d{2}-\d{2})\b", re.I)
DATE_ISO_SINGLE = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")
DATE_MONTH_RANGE = re.compile(
    r"\b(January|February|March|April|May|June|July|August|September|October|November|December)"
    r"\s+(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?,?\s+(20\d{2})\b", re.I
)
AGE_RE = re.compile(r"\bU(?:8|9|10|12|14|16|18)\b|\b(?:18|30|35|40|45|50|55|60|65|70|75|80|85)\+\b|Rising Stars", re.I)
PROVINCE_SUFFIX_RE = re.compile(r",\s*(BC|AB|SK|MB|ON|QC|NB|NS|PE|NL|YT|NT|NU)\b", re.I)


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def fetch_html(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser"), None
    except requests.RequestException as exc:
        print(f"[ERROR] {url}: {exc}")
        return None, str(exc)


def extract_dates(text):
    text = clean(text)
    match = DATE_ISO_RANGE.search(text)
    if match:
        return match.group(1), match.group(2)
    # Parse common USTA card dates such as "October 23 - 25, 2026".
    month_match = DATE_MONTH_RANGE.search(text)
    if month_match:
        from datetime import date
        from calendar import month_name
        month = list(month_name).index(month_match.group(1).capitalize())
        year = int(month_match.group(4))
        start_day = int(month_match.group(2))
        end_day = int(month_match.group(3) or start_day)
        try:
            return date(year, month, start_day).isoformat(), date(year, month, end_day).isoformat()
        except ValueError:
            pass
    singles = DATE_ISO_SINGLE.findall(text)
    if singles:
        return singles[0], singles[-1]
    return "", ""


def get_province(text):
    match = PROVINCE_SUFFIX_RE.search(text or "")
    return match.group(1).upper() if match else ""
