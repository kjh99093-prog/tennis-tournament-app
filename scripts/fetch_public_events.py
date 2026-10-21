
import json
import re
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from html.parser import HTMLParser

SOURCE_URL = "https://www.tenniscanada.com/tournaments/"
SOURCE_ID = "tennis-canada"

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current_href = None
        self.current_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and attrs.get("href"):
            self.current_href = attrs["href"]
            self.current_text = []

    def handle_data(self, data):
        if self.current_href is not None:
            self.current_text.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.current_href is not None:
            title = " ".join(" ".join(self.current_text).split())
            if title:
                self.links.append((title, self.current_href))
            self.current_href = None
            self.current_text = []

def fetch_html(url):
    request = Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 AURA-Tournament-Directory"}
    )
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")

def main():
    html = fetch_html(SOURCE_URL)
    parser = PageParser()
    parser.feed(html)

    events = []
    seen = set()

    for title, href in parser.links:
        full_url = urljoin(SOURCE_URL, unescape(href))

        # Keep only links that appear to identify individual tournaments.
        if "tenniscanada.com" not in full_url.lower():
            continue

        if "/tournaments" in full_url.lower():
            continue

        if full_url in seen:
            continue

        # Avoid navigation, social links and generic calls to action.
        if len(title) < 5:
            continue

        if title.lower() in {
            "read more", "learn more", "view more",
            "show results", "open filters"
        }:
            continue

        seen.add(full_url)
        events.append({
            "title": title,
            "officialUrl": full_url,
            "sourceId": SOURCE_ID,
            "sourceName": "Tennis Canada",
            "startDate": "",
            "endDate": "",
            "entryDeadline": "",
            "venueName": "",
            "city": "",
            "country": "Canada",
            "ageDivisions": [],
            "entryFee": ""
        })

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": [{
            "name": "Tennis Canada",
            "url": SOURCE_URL,
            "status": "success" if events else "no_events_found",
            "eventsCount": len(events)
        }],
        "events": events
    }

    output_path = Path("public/data/tournaments.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print("Source:", SOURCE_URL)
    print("Status:", output["sources"][0]["status"])
    print("Collected links:", len(events))
    print("Output:", output_path)

if __name__ == "__main__":
    main()
