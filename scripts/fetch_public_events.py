import json
import re
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

SOURCES = [
    {
        "name": "Tennis Canada",
        "url": "https://tc.tournamentsoftware.com/tournaments",
        "source_id": "tc-tournament-software",
    },
    {
        "name": "USTA",
        "url": "https://playtennis.usta.com/Tournaments",
        "source_id": "usta-playtennis",
    },
    {
        "name": "ITF",
        "url": "https://www.itftennis.com/en/tournament/",
        "source_id": "itf-tennis",
    },
    {
        "name": "UTR",
        "url": "https://app.utrsports.net/events",
        "source_id": "utr-sports",
    },
]


def fetch_public_page(url):
    request = Request(
        url,
        headers={"User-Agent": "AURA-Tournament-Directory/1.0"},
    )
    with urlopen(request, timeout=25) as response:
        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type.lower():
            return None
        return response.read().decode("utf-8", errors="replace")


def collect_source(source):
    try:
        html = fetch_public_page(source["url"])
        if not html:
            return {
                **source,
                "status": "unavailable",
                "events": [],
            }

        # Only collect event links that are visibly present in the
        # publicly accessible HTML. Do not invent event information.
        links = re.findall(
            r'<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
            html,
            flags=re.IGNORECASE | re.DOTALL,
        )

        events = []
        seen = set()

        for href, raw_title in links:
            title = unescape(re.sub(r"<[^>]+>", " ", raw_title))
            title = " ".join(title.split())

            if not title or len(title) < 4:
                continue

            if not href.startswith("http"):
                if href.startswith("/"):
                    from urllib.parse import urljoin
                    href = urljoin(source["url"], href)
                else:
                    continue

            if href in seen:
                continue
            seen.add(href)

            events.append({
                "title": title,
                "officialUrl": href,
                "sourceId": source["source_id"],
                "startDate": "",
                "endDate": "",
                "entryDeadline": "",
                "venueName": "",
                "city": "",
                "country": "",
                "entryFee": "",
            })

        return {
            **source,
            "status": "success" if events else "no_events_found",
            "events": events,
        }

    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
        print(f"Could not read {source['name']}: {error}")
        return {
            **source,
            "status": "unavailable",
            "events": [],
        }


def main():
    results = [collect_source(source) for source in SOURCES]

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": results,
        "events": [
            event
            for source in results
            for event in source["events"]
        ],
    }

    output_path = Path("public/data/tournaments.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    for source in results:
        print(
            f"{source['name']}: {source['status']} "
            f"({len(source['events'])} links)"
        )

    print(f"Saved {len(output['events'])} links to {output_path}")


if __name__ == "__main__":
    main()
