import re
import sys
import urllib.request


def fetch(url: str) -> str:
    with urllib.request.urlopen(url, timeout=20) as resp:
        return resp.read().decode("utf-8", "replace")


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000/"
    html = fetch(url)
    m = re.search(r"<header[\s\S]*?</header>", html, flags=re.I)
    if not m:
        print("NO_HEADER")
        return 1
    header = m.group(0)
    print(header[:20000])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

