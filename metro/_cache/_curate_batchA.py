#!/usr/bin/env python3
"""Curate batch A maps — uses curl subprocess to avoid SSL issues."""
import json, re, subprocess, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGING = ROOT / "maps" / "_staging_2026-07-26"
REPORT = ROOT / "_cache" / "_map_curate_batchA.json"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) adapt-metro-curate/1.0"

# slug -> dict with key, city, and either official url or commons file candidates
CITIES = {
    "as-chn-jiaxing": {
        "key": "asia/china/as-chn-jiaxing", "city": "Jiaxing",
        "search": ["Jiaxing tram map", "Jiaxing metro map schematic", "嘉兴 有轨 地图"],
        "candidates": [],
    },
    "am-usa-denver": {
        "key": "americas/united-states/am-usa-denver", "city": "Denver",
        "official": {
            "url": "https://cdn.rtd-denver.com/image/upload/v1734792008/A_w6uqtf.pdf",
            "artist": "RTD-Denver", "notes": "2024 official RTD rail system map; semi-geographic light bg colored lines",
        },
        "candidates": ["File:Denver Light Rail Route Diagram.svg"],
    },
    "eu-pol-cracow": {
        "key": "europe/poland/eu-pol-cracow", "city": "Cracow",
        "candidates": ["File:Krakow linie dzienne.svg", "File:Krakow tram network simple.png"],
        "search": ["Krakow tram map schematic"],
    },
    "eu-pol-katowice": {
        "key": "europe/poland/eu-pol-katowice", "city": "Katowice",
        "candidates": ["File:Tram map of Katowice agglomeration.svg", "File:Katowice tram map.svg"],
        "search": ["Katowice tram map", "Tramwaje Slaskie mapa"],
    },
    "eu-pol-lodz": {
        "key": "europe/poland/eu-pol-lodz", "city": "Lodz",
        "candidates": ["File:Łódź ex tram map 2019.jpg", "File:Lodz tram map.svg"],
        "search": ["Lodz tram map"],
    },
    "eu-pol-poznan": {
        "key": "europe/poland/eu-pol-poznan", "city": "Poznan",
        "candidates": ["File:Poznan tram map.svg", "File:Poznan tram network.svg"],
        "search": ["Poznan tram map"],
    },
    "eu-cze-ostrava": {
        "key": "europe/czechia/eu-cze-ostrava", "city": "Ostrava",
        "candidates": ["File:Ostrava tram map.svg", "File:Tram map Ostrava.svg"],
        "search": ["Ostrava tram map"],
    },
    "eu-ned-the-hague": {
        "key": "europe/netherlands/eu-ned-the-hague", "city": "The Hague",
        "official": {
            "url": "https://www.htm.nl/media/wb0dphxi/25039htm_a4haltekrtweb_5jan_tram_bus.pdf",
            "artist": "HTM", "notes": "Official HTM tram+bus network map Jan 2026; light bg colored tram lines",
        },
        "candidates": ["File:HTM Personenvervoer The Hague 2012.png"],
    },
    "eu-ukr-odessa": {
        "key": "europe/ukraine/eu-ukr-odessa", "city": "Odesa",
        "candidates": ["File:Odessa tram map.svg", "File:Odesa tram map.svg"],
        "search": ["Odessa tram map schematic"],
    },
    "eu-ukr-kryvy-rih-krivoy-rog": {
        "key": "europe/ukraine/eu-ukr-kryvy-rih-krivoy-rog", "city": "Kryvyi Rih",
        "candidates": ["File:Kryvyi Rih Metrotram map.svg", "File:Kryvyi Rih tram map.svg"],
        "search": ["Kryvyi Rih metrotram map"],
    },
    "eu-cze-brno": {
        "key": "europe/czechia/eu-cze-brno", "city": "Brno",
        "candidates": ["File:Brno tram map.svg", "File:Brno - mapa tramvajovych linek.svg", "File:Brno tram network.svg"],
        "search": ["Brno tram map"],
    },
    "eu-cro-zagreb": {
        "key": "europe/croatia/eu-cro-zagreb", "city": "Zagreb",
        "candidates": ["File:Zagreb tram map.svg", "File:Zagreb tram network.svg"],
        "search": ["Zagreb tram map"],
    },
    "eu-sui-basel": {
        "key": "europe/switzerland/eu-sui-basel", "city": "Basel",
        "candidates": ["File:Basel - Straßenbahnnetzplan.png", "File:Basel tram map.svg"],
        "search": ["Basel tram map"],
    },
    "eu-rus-ulyanovsk": {
        "key": "europe/russia/eu-rus-ulyanovsk", "city": "Ulyanovsk",
        "candidates": ["File:Ulyanovsk tram map.svg", "File:Ulyanovsk tram map 2022-04.svg"],
        "search": ["Ulyanovsk tram map"],
    },
    "as-kaz-ust-kamenogorsk": {
        "key": "asia/kazakhstan/as-kaz-ust-kamenogorsk", "city": "Ust-Kamenogorsk",
        "candidates": ["File:Ust-Kamenogorsk tram map.svg", "File:Oskemen tram map.svg"],
        "search": ["Ust-Kamenogorsk tram map", "Oskemen tram map"],
    },
    "eu-aut-graz": {
        "key": "europe/austria/eu-aut-graz", "city": "Graz",
        "candidates": ["File:Straßenbahn Graz Ende 2021 V3.png", "File:Graz tram map.svg"],
        "search": ["Graz tram map"],
    },
    "eu-aut-innsbruck": {
        "key": "europe/austria/eu-aut-innsbruck", "city": "Innsbruck",
        "candidates": ["File:Innsbruck tram map.svg", "File:IVB Innsbruck tram map.svg"],
        "search": ["Innsbruck tram map"],
    },
    "eu-pol-torun": {
        "key": "europe/poland/eu-pol-torun", "city": "Torun",
        "candidates": ["File:Torun tram map.svg", "File:Toruń tram map.svg"],
        "search": ["Torun tram map"],
    },
    "eu-rou-arad": {
        "key": "europe/romania/eu-rou-arad", "city": "Arad",
        "candidates": ["File:Arad tram map.svg", "File:Arad tram map.png"],
        "search": ["Arad tram map Romania"],
    },
    "eu-ger-jena": {
        "key": "europe/germany/eu-ger-jena", "city": "Jena",
        "candidates": ["File:Jena tram map.svg", "File:Jena Straßenbahn Netzplan.svg"],
        "search": ["Jena tram map"],
    },
    "eu-rus-kolomna": {
        "key": "europe/russia/eu-rus-kolomna", "city": "Kolomna",
        "candidates": ["File:Kolomna tram map.svg", "File:Kolomna tram map 2022-04.svg"],
        "search": ["Kolomna tram map"],
    },
    "eu-bel-ghent": {
        "key": "europe/belgium/eu-bel-ghent", "city": "Ghent",
        "candidates": ["File:Ghent tram map.svg", "File:Gent tram map.svg", "File:Gent tramnet.svg"],
        "search": ["Ghent tram map", "Gent tram map De Lijn"],
    },
    "eu-pol-elblag": {
        "key": "europe/poland/eu-pol-elblag", "city": "Elblag",
        "candidates": ["File:Elblag tram map.svg", "File:Elbląg tram map.svg"],
        "search": ["Elblag tram map"],
    },
    "as-tur-kayseri": {
        "key": "asia/turkey/as-tur-kayseri", "city": "Kayseri",
        "candidates": ["File:Kayseri tram map.svg", "File:Kayseray map.svg"],
        "search": ["Kayseri tram map", "Kayseray map"],
    },
}

BAD = re.compile(
    r"plan(?:ning|ned)?|proposed|future|expansion|phase|panoramio|flickr|"
    r"street.?view|tram.?stop|passenger.?information|\b(18|19)\d{2}\b|"
    r"\.JPG$|photo|depot|inside|platform|icon|logo",
    re.I,
)
GOOD = re.compile(r"map|netz|network|schemat|linie|route|diagram|plan|mapa|netzplan", re.I)


def curl_json(url, params=None):
    cmd = ["curl", "-sG", url, "-A", UA]
    if params:
        for k, v in params.items():
            cmd += ["--data-urlencode", f"{k}={v}"]
    r = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def curl_download(url, dest):
    subprocess.run(["curl", "-fsSL", "-A", UA, url, "-o", str(dest)], check=True)


def commons_info(title):
    time.sleep(1.0)
    try:
        d = curl_json("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "titles": title, "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime", "format": "json",
        })
    except Exception:
        return None
    for p in d["query"]["pages"].values():
        if "missing" in p or "imageinfo" not in p:
            return None
        ii = p["imageinfo"][0]
        meta = ii.get("extmetadata", {})
        def m(k):
            return re.sub(r"<[^>]+>", "", meta.get(k, {}).get("value", "")).strip()
        return {
            "title": title, "url": ii["url"], "mime": ii.get("mime", ""),
            "width": ii.get("width", 0), "height": ii.get("height", 0),
            "license": m("LicenseShortName") or "?", "artist": m("Artist")[:120],
        }
    return None


def commons_search(q, limit=8):
    time.sleep(1.0)
    try:
        d = curl_json("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "list": "search", "srsearch": q,
            "srnamespace": "6", "srlimit": str(limit), "format": "json",
        })
    except Exception:
        return []
    return [r["title"] for r in d.get("query", {}).get("search", [])]


def score(title, info):
    if BAD.search(title):
        return -100
    s = 0
    if GOOD.search(title):
        s += 30
    if info["mime"] in ("image/svg+xml", "image/png"):
        s += 10
    if info["width"] >= 600 or info["height"] >= 600:
        s += 5
    if any(w in title.lower() for w in ("tram", "light rail", "metro", "straßenbahn")):
        s += 15
    return s


def to_png(src, dst):
    ext = src.suffix.lower()
    if ext == ".png":
        if src != dst:
            dst.write_bytes(src.read_bytes())
        return
    if ext in (".jpg", ".jpeg", ".webp"):
        subprocess.run(["sips", "-s", "format", "png", str(src), "--out", str(dst)], check=True)
        return
    if ext in (".svg", ".pdf"):
        subprocess.run(["qlmanage", "-t", "-s", "2400", "-o", str(dst.parent), str(src)],
                       check=True, capture_output=True)
        thumb = dst.parent / (src.name + ".png")
        if thumb.exists():
            thumb.rename(dst)
            return
    dst.write_bytes(src.read_bytes())


def curate(slug, cfg):
    print(f"\n=== {cfg['city']} ({slug}) ===", flush=True)
    STAGING.mkdir(parents=True, exist_ok=True)

    if "official" in cfg:
        off = cfg["official"]
        raw = STAGING / f"{slug}.pdf"
        png = STAGING / f"{slug}.png"
        try:
            curl_download(off["url"], raw)
            to_png(raw, png)
            print(f"  OFFICIAL OK {off['url']}", flush=True)
            return {
                "key": cfg["key"], "city": cfg["city"], "status": "HIT_OFFICIAL",
                "local": f"data/metro/maps/_staging_2026-07-26/{png.name}",
                "source_url": off["url"], "commons_file": None,
                "license": "Official operator map (© operator; thesis use)",
                "artist": off["artist"], "notes": off["notes"],
            }
        except Exception as e:
            print(f"  official failed: {e}", flush=True)

    tried = set()
    best = None
    for title in cfg.get("candidates", []):
        if title in tried:
            continue
        tried.add(title)
        info = commons_info(title)
        if not info:
            print(f"  miss: {title}", flush=True)
            continue
        sc = score(title, info)
        print(f"  {title}: score={sc} lic={info['license']}", flush=True)
        if sc >= 20:
            best = (info, sc, title)
            break

    if not best:
        for q in cfg.get("search", []):
            for title in commons_search(q):
                if title in tried:
                    continue
                tried.add(title)
                info = commons_info(title)
                if not info:
                    continue
                sc = score(title, info)
                print(f"  search {title}: score={sc}", flush=True)
                if sc >= 25 and (not best or sc > best[1]):
                    best = (info, sc, title)

    if not best or best[1] < 20:
        return {
            "key": cfg["key"], "city": cfg["city"], "status": "MISS",
            "local": None, "source_url": None, "commons_file": None,
            "license": None, "artist": None,
            "notes": f"No compliant map after {len(tried)} tries",
        }

    info, sc, title = best
    ext = Path(info["url"]).suffix.split("?")[0] or ".bin"
    raw = STAGING / f"{slug}{ext}"
    png = STAGING / f"{slug}.png"
    curl_download(info["url"], raw)
    to_png(raw, png)
    local_name = png.name if png.exists() else raw.name
    print(f"  HIT {title}", flush=True)
    return {
        "key": cfg["key"], "city": cfg["city"], "status": "HIT_COMMUNITY",
        "local": f"data/metro/maps/_staging_2026-07-26/{local_name}",
        "source_url": info["url"], "commons_file": title,
        "license": info["license"], "artist": info["artist"],
        "notes": f"Commons schematic score={sc}; {info['mime']} {info['width']}x{info['height']}",
    }


def main():
    order = [
        "as-chn-jiaxing", "am-usa-denver", "eu-pol-cracow", "eu-pol-katowice",
        "eu-pol-lodz", "eu-pol-poznan", "eu-cze-ostrava", "eu-ned-the-hague",
        "eu-ukr-odessa", "eu-ukr-kryvy-rih-krivoy-rog", "eu-cze-brno",
        "eu-cro-zagreb", "eu-sui-basel", "eu-rus-ulyanovsk",
        "as-kaz-ust-kamenogorsk", "eu-aut-graz", "eu-aut-innsbruck",
        "eu-pol-torun", "eu-rou-arad", "eu-ger-jena", "eu-rus-kolomna",
        "eu-bel-ghent", "eu-pol-elblag", "as-tur-kayseri",
    ]
    report = [curate(s, CITIES[s]) for s in order]
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    counts = {}
    for r in report:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    print("\n=== SUMMARY ===")
    for k in sorted(counts):
        print(f"  {k}: {counts[k]}")
    print(f"Report: {REPORT}")


if __name__ == "__main__":
    main()
