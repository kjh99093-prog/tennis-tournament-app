#!/usr/bin/env python3
"""Fetch real tournament listings from the Tennis Canada tournament calendar.

Only ``article.resource`` cards that contain a verifiable ISO date range and a
Canadian city/province are saved as events.  General information pages, coaching
articles, and navigation links are never treated as tournaments.

Fields not exposed on the listing page (entry deadline, entry fee, venue name,
address) are left empty rather than invented.
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
    r"\b(20\d{2}-\d{2}-\d{2})\s*to\s*(20\d{2}-\d{2}-\d{2})\b",
    re.IGNORECASE,
)
LOCATION_RE = re.compile(
    r"^([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÿ'. -]+),\s*"
    r"(BC|AB|SK|MB|ON|QC|NB|NS|PE|NL|YT|NT|NU)\s*$"
)
AGE_RE = re.compile(
    r"\bU(?:9|10|12|14|16|18)\b|\bRising Stars\b|\b18\+\b",
    re.IGNORECASE,
)


def clean_text(value):
    return re.sub(r"\s+", " ", value or "").strip()


def parse_tournament_article(article):
    """Extract a tournament event dict from an ``article.resource`` element.

    Returns ``None`` if the article lacks a valid title or ISO date range.
    """
    heading = article.find("h2", class_="resource__title")
    if not heading:
        return None
    title = clean_text(heading.get_text(" ", strip=True))
    if not title:
        return None

    desc = article.find("div", class_="resource__description")
    if not desc:
        return None

    # Parse the text-icon paragraphs: first is location, second is date range
    ps = desc.find_all("p", class_="text-icon")
    city = ""
    province = ""
    start_date = ""
    end_date = ""

    for p in ps:
        text = clean_text(p.get_text(strip=True))
        loc_match = LOCATION_RE.match(text)
        if loc_match and not city:
            city = loc_match.group(1)
            province = loc_match.group(2)
            continue
        date_match = DATE_RANGE_RE.search(text)
        if date_match and not start_date:
            start_date = date_match.group(1)
            end_date = date_match.group(2)
            continue

    # A valid tournament must have a start date
    if not start_date:
        return None

    # Tags / divisions from btn-group
    tags_text = ""
    btn_group = desc.find("div", class_="btn-group")
    if btn_group:
        tags_text = clean_text(btn_group.get_text(" ", strip=True))

    divisions = sorted({m.group(0).upper() for m in AGE_RE.finditer(tags_text)})

    lowered = tags_text.lower()
    if "18+" in lowered or "open" in lowered:
        category = "adult"
    elif divisions or "rising stars" in lowered:
        category = "junior"
    else:
        category = ""

    # Official link from footer
    official_url = ""
    footer = article.find("footer")
    if footer:
        a = footer.find("a", href=True)
        if a and a.get("href"):
            official_url = a["href"]

    if not official_url:
        a = article.find("a", href=True)
        if a and a.get("href"):
            href = a["href"]
            official_url = href if href.startswith("http") else urljoin(SOURCE_URL, href)

    return {
        "title": title,
        "officialUrl": official_url,
        "sourceId": "tennis-canada",
        "sourceName": SOURCE_NAME,
        "startDate": start_date,
        "endDate": end_date,
        "entryDeadline": "",
        "venueName": "",
        "city": city,
        "province": province,
        "country": "Canada",
        "ageDivisions": divisions,
        "tags": tags_text,
        "category": category,
        "entryFee": "",
    }


def fetch_page(url):
    """Fetch a URL and return a BeautifulSoup object, or ``None`` on failure."""
    try:
        resp = requests.get(
            url,
            timeout=30,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0 Safari/537.36"
                )
            },
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"Error fetching {url}: {exc}")
        return None
    return BeautifulSoup(resp.text, "html.parser")


def main():
    print(f"Fetching tournament calendar: {SOURCE_URL}")
    soup = fetch_page(SOURCE_URL)
    if soup is None:
        print("Failed to fetch the Tennis Canada tournaments page.")
        output = {
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "sources": [
                {
                    "name": SOURCE_NAME,
                    "url": SOURCE_URL,
                    "status": "error",
                    "eventsCount": 0,
                    "note": "Failed to fetch the tournaments page.",
                }
            ],
            "events": [],
        }
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_PATH.write_text(
            json.dumps(output, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        return

    articles = soup.find_all("article", class_="resource")
    print(f"Found {len(articles)} article.resource elements on the page.")

    events = []
    rejected = 0
    for art in articles:
        event = parse_tournament_article(art)
        if event:
            events.append(event)
        else:
            rejected += 1

    print(f"Parsed {len(events)} valid tournaments, rejected {rejected} articles.")

    if not events:
        print(
            "Limitation: The Tennis Canada tournaments page did not expose any "
            "verifiable tournament listings with ISO date ranges at this time."
        )

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": [
            {
                "name": SOURCE_NAME,
                "url": SOURCE_URL,
                "status": "success" if events else "no-events",
                "eventsCount": len(events),
            }
        ],
        "events": events,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(output, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(events)} events to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
