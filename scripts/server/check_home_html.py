import re
import sys
import urllib.request


def fetch(url: str) -> str:
    with urllib.request.urlopen(url, timeout=20) as resp:
        return resp.read().decode("utf-8", "replace")


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000/"
    html = fetch(url)
    lower = html.lower()

    print("url:", url)
    print("len:", len(html))

    # Look for menu-related markers
    markers = [
        "lucide-menu",
        'data-lucide="menu"',
        'aria-label="menü"',
        'aria-label="menu"',
        'aria-label="kategoriler menüsünü aç/kapat"',
        'aria-label="kategoriler"',
    ]
    for m in markers:
        print(f"count[{m}]:", lower.count(m))

    # Print contexts for lucide-menu if present (include parent button attrs)
    idxs = [m.start() for m in re.finditer("lucide-menu", lower)]
    for i, idx in enumerate(idxs[:5], start=1):
        start = max(0, idx - 1200)
        end = min(len(html), idx + 450)
        print(f"\n--- lucide-menu context #{i} ---")
        print(html[start:end])

    # Print all aria-label values containing 'men' (up to 50)
    labels = re.findall(r'aria-label="[^"]{0,200}"', html, flags=re.I)
    hits = [l for l in labels if ("men" in l.lower() or "menu" in l.lower())]
    print("\naria-label total:", len(labels))
    print("aria-label hits:", len(hits))
    for l in hits[:50]:
        print(l)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

