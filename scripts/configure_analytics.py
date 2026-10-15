"""Ativa/desativa a contagem de prévias com o ID público de um site Umami Cloud."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "previas.html"
START = '<script type="application/json" id="analytics-config">'
END = '</script>'
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)


def update(html: str, website_id: str) -> str:
    if html.count(START) != 1:
        raise ValueError("Expected exactly one analytics configuration")
    before, rest = html.split(START, 1)
    raw, after = rest.split(END, 1)
    current = json.loads(raw)
    if set(current) != {"websiteId"}:
        raise ValueError("Unexpected analytics configuration fields")
    if website_id and not UUID.fullmatch(website_id):
        raise ValueError("Website ID must be a UUID; never pass an API key")
    return before + START + json.dumps({"websiteId": website_id.lower()}, separators=(",", ":")) + END + after


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["status", "set", "disable"])
    parser.add_argument("--website-id")
    args = parser.parse_args()
    html = PAGE.read_text(encoding="utf-8")
    if args.action == "status":
        _, rest = html.split(START, 1)
        config = json.loads(rest.split(END, 1)[0])
        print(json.dumps({"configured": bool(config.get("websiteId"))}))
        return
    if args.action == "set" and not args.website_id:
        parser.error("set requires --website-id")
    revised = update(html, args.website_id if args.action == "set" else "")
    if revised != html:
        temporary = PAGE.with_suffix(".html.tmp")
        temporary.write_text(revised, encoding="utf-8")
        temporary.replace(PAGE)
    print(json.dumps({"configured": args.action == "set", "changed": revised != html}))


if __name__ == "__main__":
    main()
