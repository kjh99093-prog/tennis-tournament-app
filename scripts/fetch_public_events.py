#!/usr/bin/env python3
"""Collect dated public tennis tournament listings for AURA.

A source is only marked successful when at least one dated event is parsed.
If a source is unavailable or its page structure changes, its previous events
are retained so a failed scrape cannot erase known data.
"""
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

OUTPUT_PATH = Path("public/data/tournaments.json")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}
TIMEOUT = 25
CANADA_URL = "https://www.tenniscanada.com/tournaments/"
TC_SOFTWARE_URL = "https://tc.tournamentsoftware.com/find"
USTA_URLS = [
    "https://playtennis.usta.com/Tournaments",
    "https://playtennis.usta.com/competitions/USTA/Tournaments/",
    # USTA legacy searchable schedule; official page includes a server-rendered search/results table.
    "https://tdndownload.usta.com/tournaments/Schedule/Search.aspx",
]
ITF_URLS = [
    "https://www.itftennis.com/en/tournament-calendar/world-tennis-tour-calendar/",
    "https://www.itftennis.com/en/tournament-calendar/junior-calendar/",
]
MONTHS = {m.lower(): i for i, m in enumerate(
    ["", "January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"]) if m}
AGE_RE = re.compile(r"\b(U8|U9|U10|U12|U14|U16|U18|18\+|30\+|35\+|40\+|45\+|50\+|Rising Stars)\b", re.I)
PROVINCE_RE = re.compile(r"\b(BC|AB|SK|MB|ON|QC|NB|NS|PE|NL|YT|NT|NU)\b", re.I)
US_STATE_RE = re.compile(r"\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b", re.I)
DATE_PATTERNS = [
    re.compile(r"\b(20\d{2}-\d{2}-\d{2})\s*(?:to|[-–—])\s*(20\d{2}-\d{2}-\d{2})\b", re.I),
    re.compile(r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*[-–—]\s*(\d{1,2}))?,?\s+(20\d{2})\b", re.I),
    re.compile(r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s*[-–—]\s*(January|February|March|April|May|June|July|August|September|October|November|December)?\s*(\d{1,2}),?\s+(20\d{2})\b", re.I),
]

def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()

def fetch_html(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser"), ""
    except requests.RequestException as exc:
        print(f"[ERROR] {url}: {exc}")
        return None, str(exc)

def parse_dates(text):
    text = clean(text)
    m = DATE_PATTERNS[0].search(text)
    if m:
        return m.group(1), m.group(2)
    m = DATE_PATTERNS[1].search(text)
    if m:
        month = MONTHS[m.group(1).lower()]
        year, start = int(m.group(4)), int(m.group(2))
        end = int(m.group(3) or start)
        try:
            return date(year, month, start).isoformat(), date(year, month, end).isoformat()
        except ValueError:
            return "", ""
    m = DATE_PATTERNS[2].search(text)
    if m:
        sm = MONTHS[m.group(1).lower()]
        em = MONTHS[(m.group(3) or m.group(1)).lower()]
        year, start, end = int(m.group(5)), int(m.group(2)), int(m.group(4))
        try:
            return date(year, sm, start).isoformat(), date(year, em, end).isoformat()
        except ValueError:
            return "", ""
    iso = re.findall(r"\b20\d{2}-\d{2}-\d{2}\b", text)
    return (iso[0], iso[-1]) if iso else ("", "")

def parse_event_card(card, source_id, source_name, country, base_url):
    title_node = card.find(["h1", "h2", "h3", "h4", "a"])
    if not title_node:
        return None
    title = clean(title_node.get_text(" ", strip=True))
    if len(title) < 4 or title.lower() in {"learn more", "read more", "register"}:
        return None
    whole_text = clean(card.get_text(" ", strip=True))
    # ITF calendars are international; only keep listings explicitly located in the United States.
    if source_id == "itf" and not (re.search(r"\bUnited States\b|\bUSA\b|\bU\.S\.A\.\b", whole_text, re.I) or US_STATE_RE.search(whole_text)):
        return None
    start, end = parse_dates(whole_text)
    if not start or not end:
        return None
    link_node = card if card.name == "a" and card.get("href") else card.find("a", href=True)
    official_url = urljoin(base_url, link_node["href"]) if link_node else base_url
    if official_url.startswith("javascript:"):
        official_url = base_url
    ages = sorted(set(x.upper() if x.lower() != "rising stars" else "RISING STARS"
                      for x in AGE_RE.findall(title + " " + whole_text)))
    city, region = "", ""
    location_match = re.search(r"([A-Za-zÀ-ÿ .'-]+),\s*([A-Z]{2})\b", whole_text)
    if location_match:
        city, region = clean(location_match.group(1)), location_match.group(2).upper()
    if country == "Canada" and not region:
        p = PROVINCE_RE.search(whole_text)
        region = p.group(1).upper() if p else ""
    if country == "United States" and not region:
        p = US_STATE_RE.search(whole_text)
        region = p.group(1).upper() if p else ""
    if country == "Canada":
        province = region
        state = ""
    else:
        province = ""
        state = region
    tags = whole_text[:600]
    category = "junior" if any(x.startswith("U") or x == "RISING STARS" for x in ages) else "adult"
    return {
        "title": title, "officialUrl": official_url, "sourceId": source_id,
        "sourceName": source_name, "startDate": start, "endDate": end,
        "entryDeadline": "", "venueName": "", "city": city,
        "province": province, "state": state, "country": country,
        "ageDivisions": ages, "tags": tags, "category": category, "entryFee": ""
    }

def parse_cards(soup, source_id, source_name, country, base_url):
    found = []
    seen = set()
    # Prefer semantic cards; then inspect links/cards carrying date text.
    candidates = soup.select("article, li, tr, .event, .tournament, .competition, .card, [itemtype*=Event]")
    for node in candidates:
        event = parse_event_card(node, source_id, source_name, country, base_url)
        if event:
            key = (event["title"], event["startDate"], event["officialUrl"])
            if key not in seen:
                seen.add(key); found.append(event)
    # Also inspect structured event metadata, when the source provides it.
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            payload = json.loads(script.string or script.get_text())
        except (json.JSONDecodeError, TypeError):
            continue
        objects = payload if isinstance(payload, list) else [payload]
        for obj in objects:
            if not isinstance(obj, dict):
                continue
            candidates_json = obj.get("@graph", []) if isinstance(obj.get("@graph"), list) else [obj]
            for item in candidates_json:
                if not isinstance(item, dict) or not any(k in item for k in ("startDate", "endDate")):
                    continue
                title = clean(item.get("name", ""))
                item_text = json.dumps(item, ensure_ascii=False)
                if source_id == "itf" and not (re.search(r"\bUnited States\b|\bUSA\b|\bU\.S\.A\.\b", item_text, re.I) or US_STATE_RE.search(item_text)):
                    continue
                start, end = parse_dates(f"{item.get('startDate', '')} {item.get('endDate', '')}")
                if not title or not start:
                    continue
                loc = item.get("location", {}) if isinstance(item.get("location"), dict) else {}
                addr = loc.get("address", {}) if isinstance(loc.get("address"), dict) else {}
                region = clean(addr.get("addressRegion", ""))
                city = clean(addr.get("addressLocality", ""))
                event = {"title": title, "officialUrl": urljoin(base_url, item.get("url", base_url)), "sourceId": source_id, "sourceName": source_name, "startDate": start, "endDate": end or start, "entryDeadline": "", "venueName": clean(loc.get("name", "")), "city": city, "province": region if country == "Canada" else "", "state": region if country == "United States" else "", "country": country, "ageDivisions": [], "tags": "", "category": "adult", "entryFee": ""}
                key = (event["title"], event["startDate"], event["officialUrl"])
                if key not in seen:
                    seen.add(key); found.append(event)
    if not found:
        for node in soup.find_all("a", href=True):
            parent = node
            for _ in range(3):
                if parent.parent is not None:
                    parent = parent.parent
            event = parse_event_card(parent, source_id, source_name, country, base_url)
            if event:
                key = (event["title"], event["startDate"], event["officialUrl"])
                if key not in seen:
                    seen.add(key); found.append(event)
    return found

def dedupe(events):
    result, seen = [], set()
    for e in events:
        key = (clean(e.get("title")).lower(), e.get("startDate", ""), e.get("officialUrl", ""))
        if key not in seen:
            seen.add(key); result.append(e)
    return result

def load_previous():
    try:
        data = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {"events": [], "sources": []}
    except (OSError, json.JSONDecodeError) as exc:
        print(f"[INFO] No usable previous data: {exc}")
        return {"events": [], "sources": []}

def main():
    previous = load_previous()
    old_events = previous.get("events", [])
    events, source_results = [], []
    sources = [
        (CANADA_URL, "Tennis Canada", "tennis-canada", "Canada"),
        (TC_SOFTWARE_URL, "Tennis Canada Tournament Software", "tennis-canada-tournamentsoftware", "Canada"),
        *[(url, "USTA Tournaments", "usta", "United States") for url in USTA_URLS],
        *[(url, "ITF Tournament Calendar", "itf", "United States") for url in ITF_URLS],
    ]
    successful_ids = set()
    usta_done = False
    itf_success = False
    for url, name, source_id, country in sources:
        if source_id == "usta" and usta_done:
            continue
        if source_id == "itf" and itf_success:
            continue
        soup, error = fetch_html(url)
        found = parse_cards(soup, source_id, name, country, url) if soup else []
        if found:
            events.extend(found)
            successful_ids.add(source_id)
            if source_id == "usta":
                usta_done = True
            if source_id == "itf":
                itf_success = True
            source_results.append({"name": name, "url": url, "status": "success", "eventsCount": len(found), "note": ""})
            print(f"[{name}] parsed {len(found)} events")
        else:
            old = [e for e in old_events if e.get("sourceId") == source_id]
            events.extend(old)
            status = "error" if error else "no-events"
            note = error or "Page loaded but no dated tournament cards matched the parser; previous records retained."
            source_results.append({"name": name, "url": url, "status": status, "eventsCount": len(old), "note": note})
            print(f"[{name}] {status}; retained {len(old)} previous events")
    # Keep prior records from any source that wasn't parsed this run.
    present_ids = {e.get("sourceId") for e in events}
    for event in old_events:
        sid = event.get("sourceId", "")
        if sid not in successful_ids and sid not in present_ids:
            events.append(event)
    events = dedupe(events)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": source_results,
        "events": sorted(events, key=lambda e: (e.get("startDate") or "9999-12-31", e.get("country", ""), e.get("title", ""))),
    }
    OUTPUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(output['events'])} unique events to {OUTPUT_PATH}")
    for source in source_results:
        print(f" - {source['name']}: {source['status']} ({source['eventsCount']})")

if __name__ == "__main__":
    main()
