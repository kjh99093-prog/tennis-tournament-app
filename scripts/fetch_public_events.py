
    date_match = DATE_RANGE_RE.search(card_text)
    location_match = LOCATION_RE.search(card_text)
    if not date_match or not location_match:
        return None

    # Avoid accepting a whole page/container that contains multiple tournaments.
    # A card with another date range is likely too broad to identify one event.
    if len(DATE_RANGE_RE.findall(card_text)) != 1:
        return None

    # Prefer a link directly on the heading or within the event card. If the source
    # does not provide a dedicated event URL, link to the official calendar instead.
    link = heading if heading.name == "a" else heading.find("a", href=True)
    if not link:
        link = heading.find_parent("a", href=True)
    if not link:
        link = candidate.find("a", href=True)

    official_url = urljoin(page_url, link["href"]) if link and link.get("href") else page_url
    if not official_url.startswith("https://www.tenniscanada.com/"):
        # Do not mislabel external links as Tennis Canada event detail pages.
        official_url = page_url

    # Extract only divisions that are visibly present in the event card.
    divisions = sorted({clean_text(m.group(0)).upper() for m in AGE_RE.finditer(card_text)})

    # Infer category only when the card explicitly indicates it.
    lowered = card_text.lower()
    if "adult" in lowered or re.search(r"\b18\+\b", lowered) or "masters" in lowered:
        category = "adult"
    elif divisions or "junior" in lowered or "u10" in lowered or "u12" in lowered:
        category = "junior"
    else:
        category = ""

    province = location_match.group(2)
    province_names = {
        "BC": "British Columbia", "AB": "Alberta", "SK": "Saskatchewan",
        "MB": "Manitoba", "ON": "Ontario", "QC": "Quebec",
        "NB": "New Brunswick", "NS": "Nova Scotia",
        "PE": "Prince Edward Island", "NL": "Newfoundland and Labrador",
        "YT": "Yukon", "NT": "Northwest Territories", "NU": "Nunavut",
    }

    return {
        "id": f"tennis-canada-{date_match.group(1)}-{re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:70]}",
        "title": title,
        "officialUrl": official_url,
        "sourceId": "tennis-canada",
        "sourceName": SOURCE_NAME,
        "startDate": date_match.group(1),
        "endDate": date_match.group(2),
        "entryDeadline": "",
        "venueName": "",
        "city": clean_text(location_match.group(1)),
        "province": province,
        "provinceName": province_names.get(province, ""),
        "country": "Canada",
        "ageDivisions": divisions,
        "category": category,
        "entryFee": "",
    }


def main():
    response = requests.get(
        SOURCE_URL,
        timeout=30,
        headers={"User-Agent": "AURA-Tournament-Calendar/1.0 (public event listings)"},
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    events_by_key = {}
    for heading in soup.find_all(["h2", "h3", "h4"]):
        event = parse_event_from_heading(heading, SOURCE_URL)
        if not event:
            continue
        key = (event["title"].casefold(), event["startDate"], event["city"].casefold())
        events_by_key[key] = event

    events = sorted(
        events_by_key.values(),
        key=lambda item: (item["startDate"] or "9999-99-99", item["title"].casefold()),
    )

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": [{
            "name": SOURCE_NAME,
            "url": SOURCE_URL,
            "status": "success" if events else "no_events_found",
            "eventsCount": len(events),
        }],
        "events": events,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{SOURCE_NAME}: {len(events)} dated tournament cards saved to {OUTPUT_PATH}")
    if not events:
        raise SystemExit(
            "No tournament cards matched the expected date/location format. "
            "The site markup may have changed; refusing to save generic navigation links."
        )


if __name__ == "__main__":
    main()
