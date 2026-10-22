import json
def load_previous():
    """Load previously saved tournament data, if available."""
    try:
        data = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Could not read previous tournament data: {exc}")

    return {"events": [], "sources": []}


def main():
    previous = load_previous()
    old_events = previous.get("events", [])
    old_sources = {s.get("name"): s for s in previous.get("sources", []) if isinstance(s, dict)}
    source_results = []
    all_events = []
    source_specs = [
        (CANADA_NAME, CANADA_URL, "canada_calendar"),
        ("Tennis Canada Tournament Software", TOURNAMENT_SOFTWARE_URL, "canada_ts"),
    ]

    soup, error = fetch_html(CANADA_URL)
    if soup is not None:
        found = parse_canada_calendar(soup)
        # Some page versions expose links to Tournament Software; keep those official URLs.
        all_events.extend(found)
        source_results.append({"name": CANADA_NAME, "url": CANADA_URL, "status": "success" if found else "no-events",
                               "eventsCount": len(found), "note": "" if found else "Page loaded but no dated tournament cards were parsed."})
        print(f"[Canada calendar] parsed {len(found)} events")
    else:
        old = [e for e in old_events if e.get("sourceId") == "tennis-canada"]
        all_events.extend(old)
        source_results.append({"name": CANADA_NAME, "url": CANADA_URL, "status": "error",
                               "eventsCount": len(old), "note": f"Fetch failed; retained {len(old)} previous events. {error}"})

    # Tournament Software is a separate real source. Avoid discarding existing records on a parse failure.
    soup, error = fetch_html(TOURNAMENT_SOFTWARE_URL)
    if soup is not None:
        found = parse_tournamentsoftware(soup)
        all_events.extend(found)
        source_results.append({"name": "Tennis Canada Tournament Software", "url": TOURNAMENT_SOFTWARE_URL,
                               "status": "success" if found else "no-events", "eventsCount": len(found),
                               "note": "" if found else "Page loaded but no dated results were parsed; check the site's current markup."})
        print(f"[Tournament Software] parsed {len(found)} events")
    else:
        old = [e for e in old_events if e.get("sourceId") == "tennis-canada-tournamentsoftware"]
        all_events.extend(old)
        source_results.append({"name": "Tennis Canada Tournament Software", "url": TOURNAMENT_SOFTWARE_URL,
                               "status": "error", "eventsCount": len(old),
                               "note": f"Fetch failed; retained {len(old)} previous events. {error}"})

    usta_found_any = False
    usta_errors = []
    for url in USTA_URLS:
        soup, error = fetch_html(url)
        if soup is None:
            usta_errors.append(error or "Fetch failed")
            continue
        found = parse_usta(soup, url)
        if found:
            usta_found_any = True
            all_events.extend(found)
            print(f"[USTA] parsed {len(found)} events from {url}")
            # Stop after first URL that provides actual events to reduce duplicate records.
            break

    if usta_found_any:
        usta_events = [e for e in all_events if e.get("sourceId") == "usta"]
        source_results.append({"name": USTA_NAME, "url": USTA_URLS[0], "status": "success",
                               "eventsCount": len(usta_events), "note": ""})
    else:
        old = [e for e in old_events if e.get("sourceId") == "usta"]
        all_events.extend(old)
        source_results.append({"name": USTA_NAME, "url": USTA_URLS[0], "status": "error" if usta_errors else "no-events",
                               "eventsCount": len(old),
                               "note": "No dated tournament cards were parsed. The USTA page may render data with JavaScript; previous USTA events were retained. " +
                                       (usta_errors[0] if usta_errors else "")})

    all_events = dedupe(all_events)
    # Do not replace a source's previous events with an empty result if a page loaded but parser failed.
    # For any source with no new parsed results, retain its previous events.
    successful_source_ids = set()
    for source in source_results:
        if source["status"] == "success":
            if source["name"] == CANADA_NAME:
                successful_source_ids.add("tennis-canada")
            elif source["name"] == "Tennis Canada Tournament Software":
                successful_source_ids.add("tennis-canada-tournamentsoftware")
            elif source["name"] == USTA_NAME:
                successful_source_ids.add("usta")
    if old_events:
        for event in old_events:
            sid = event.get("sourceId", "")
            if sid not in successful_source_ids and sid not in {e.get("sourceId") for e in all_events}:
                all_events.append(event)
        all_events = dedupe(all_events)

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": source_results,
        "events": sorted(all_events, key=lambda e: (e.get("startDate") or "9999-99-99", e.get("country", ""), e.get("title", ""))),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(output['events'])} unique events to {OUTPUT_PATH}")
    for source in source_results:
        print(f" - {source['name']}: {source['status']} ({source['eventsCount']})")


if __name__ == "__main__":
    main()
