#!/usr/bin/env python3
"""Final batch A map download with verified URLs."""
import json, subprocess, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGING = ROOT / "maps" / "_staging_2026-07-26"
REPORT = ROOT / "_cache" / "_map_curate_batchA.json"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) adapt-metro-curate/1.0"

MAPS = [
    {"slug": "as-chn-jiaxing", "key": "asia/china/as-chn-jiaxing", "city": "Jiaxing", "status": "MISS",
     "notes": "No compliant network schematic; Commons only has Hanghai Line station photos"},
    {"slug": "am-usa-denver", "key": "americas/united-states/am-usa-denver", "city": "Denver", "status": "HIT_OFFICIAL",
     "url": "https://cdn.rtd-denver.com/image/upload/v1734792008/A_w6uqtf.pdf",
     "source_url": "https://www.rtd-denver.com/system-map", "commons_file": None,
     "license": "Official operator map (© RTD; thesis use)", "artist": "RTD-Denver",
     "notes": "2024 official RTD rail system map; semi-geographic light bg colored train lines"},
    {"slug": "eu-pol-cracow", "key": "europe/poland/eu-pol-cracow", "city": "Cracow", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/9/99/Krakow_linie_dzienne.svg",
     "commons_file": "File:Krakow linie dzienne.svg", "license": "CC BY-SA 4.0", "artist": "Agnaton",
     "notes": "Daytime tram lines schematic; MPK has no static downloadable network map"},
    {"slug": "eu-pol-katowice", "key": "europe/poland/eu-pol-katowice", "city": "Katowice", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/8/85/Map_of_tram_lines_in_Upper_Silesian_urban_area.svg",
     "commons_file": "File:Map of tram lines in Upper Silesian urban area.svg", "license": "CC BY-SA 3.0", "artist": "Therud",
     "notes": "Upper Silesian tram network incl. Katowice; semi-geographic colored tracks; best available for GOP"},
    {"slug": "eu-pol-lodz", "key": "europe/poland/eu-pol-lodz", "city": "Lodz", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/2/27/%C5%81%C3%B3d%C5%BA_ex_tram_map_2019.jpg",
     "commons_file": "File:Łódź ex tram map 2019.jpg", "license": "CC BY-SA 4.0", "artist": "Commons contributor",
     "notes": "2019 MPK tram network schematic from information display; light bg colored lines"},
    {"slug": "eu-pol-poznan", "key": "europe/poland/eu-pol-poznan", "city": "Poznan", "status": "HIT_OFFICIAL",
     "url": "https://www.ztm.poznan.pl/wp-content/uploads/2025/04/SchematTRAM_2025.04.07.pdf",
     "source_url": "https://www.ztm.poznan.pl/mapy-i-schematy-sieci/", "commons_file": None,
     "license": "Official operator map (© ZTM Poznań; thesis use)", "artist": "ZTM Poznań",
     "notes": "Official ZTM tram network schematic April 2025"},
    {"slug": "eu-cze-ostrava", "key": "europe/czechia/eu-cze-ostrava", "city": "Ostrava", "status": "HIT_OFFICIAL",
     "url": "https://www.dpo.cz/soubory/jr/schema-tram-dopravy-2026-06-09-vlk.pdf",
     "source_url": "https://www.dpo.cz/jizdni-rady/plan-site.html", "commons_file": None,
     "license": "Official operator map (© DPO; thesis use)", "artist": "DPO Ostrava",
     "notes": "Official DPO tram network schema valid from June 2026; light bg colored lines"},
    {"slug": "eu-ned-the-hague", "key": "europe/netherlands/eu-ned-the-hague", "city": "The Hague", "status": "HIT_OFFICIAL",
     "url": "https://www.htm.nl/media/wb0dphxi/25039htm_a4haltekrtweb_5jan_tram_bus.pdf",
     "source_url": "https://www.htm.nl/en/travel/maps-for-your-htm-trip/", "commons_file": None,
     "license": "Official operator map (© HTM; thesis use)", "artist": "HTM",
     "notes": "Official HTM tram+bus network map Jan 2026"},
    {"slug": "eu-ukr-odessa", "key": "europe/ukraine/eu-ukr-odessa", "city": "Odesa", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/e/ed/%D0%A1%D1%85%D0%B5%D0%BC%D0%B0_%D1%82%D1%80%D0%B0%D0%BC%D0%B2%D0%B0%D0%B9%D0%BD%D1%8B%D1%85_%D0%BC%D0%B0%D1%80%D1%88%D1%80%D1%83%D1%82%D0%BE%D0%B2_%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D0%B0_%D0%9E%D0%B4%D0%B5%D1%81%D1%81%D1%8B.gif",
     "commons_file": "File:Схема трамвайных маршрутов города Одессы.gif", "license": "Public domain", "artist": "Commons contributor",
     "notes": "Odesa tram route schematic; light bg colored routes; only compliant full-network map found"},
    {"slug": "eu-ukr-kryvy-rih-krivoy-rog", "key": "europe/ukraine/eu-ukr-kryvy-rih-krivoy-rog", "city": "Kryvyi Rih", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Map_of_tram_system_in_Kryvyi_Rih_%28uk%29.svg",
     "commons_file": "File:Map of tram system in Kryvyi Rih (uk).svg", "license": "CC BY-SA 3.0", "artist": "Commons contributor",
     "notes": "Kryvyi Rih tram+metrotram network schematic including fast tram lines"},
    {"slug": "eu-cze-brno", "key": "europe/czechia/eu-cze-brno", "city": "Brno", "status": "HIT_OFFICIAL",
     "url": "https://www.dpmb.cz/sites/default/files/downloads/2026/06/schema_denni_26_07_07.pdf",
     "source_url": "https://www.dpmb.cz/dalsi-informace-o-doprave", "commons_file": None,
     "license": "Official operator map (© DPMB; thesis use)", "artist": "DPMB Brno",
     "notes": "Official DPMB daily lines schema July 2026"},
    {"slug": "eu-cro-zagreb", "key": "europe/croatia/eu-cro-zagreb", "city": "Zagreb", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/5/57/ZET_Zagreb.svg",
     "commons_file": "File:ZET Zagreb.svg", "license": "CC BY-SA 4.0", "artist": "Meierberg",
     "notes": "Diagrammatic ZET tram routes as of 2023; light bg colored schematic"},
    {"slug": "eu-sui-basel", "key": "europe/switzerland/eu-sui-basel", "city": "Basel", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Basel_-_Stra%C3%9Fenbahnnetzplan.png",
     "commons_file": "File:Basel - Straßenbahnnetzplan.png", "license": "CC BY-SA 2.5", "artist": "Chumwa",
     "notes": "Basel tram network plan; light bg colored lines based on BVB network"},
    {"slug": "eu-rus-ulyanovsk", "key": "europe/russia/eu-rus-ulyanovsk", "city": "Ulyanovsk", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/f/fb/UlyanovskTramSystem.png",
     "commons_file": "File:UlyanovskTramSystem.png", "license": "Public domain", "artist": "Wikipedia contributor",
     "notes": "Ulyanovsk tram system schematic; only compliant map found on Commons"},
    {"slug": "as-kaz-ust-kamenogorsk", "key": "asia/kazakhstan/as-kaz-ust-kamenogorsk", "city": "Ust-Kamenogorsk", "status": "MISS",
     "notes": "No schematic network map on Commons or operator site; only tram photos"},
    {"slug": "eu-aut-graz", "key": "europe/austria/eu-aut-graz", "city": "Graz", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Stra%C3%9Fenbahn_Graz_Ende_2021_V3.png",
     "commons_file": "File:Straßenbahn Graz Ende 2021 V3.png", "license": "CC BY-SA 4.0", "artist": "Öffis Graz (Armin Ademovic)",
     "notes": "Graz tram network end 2021; light bg colored schematic"},
    {"slug": "eu-aut-innsbruck", "key": "europe/austria/eu-aut-innsbruck", "city": "Innsbruck", "status": "HIT_OFFICIAL",
     "url": "https://www.ivb.at/fileadmin/downloads/Linienfolder/2026/IVB2026_LNP_Aushang_A3_WEB_schematisch_RZ.pdf",
     "source_url": "https://www.ivb.at/fahrgast/linien/linienuebersicht/", "commons_file": None,
     "license": "Official operator map (© IVB; thesis use)", "artist": "IVB Innsbruck",
     "notes": "Official IVB schematic network map 2026 valid from Dec 2025"},
    {"slug": "eu-pol-torun", "key": "europe/poland/eu-pol-torun", "city": "Torun", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/a/af/Toru%C5%84_%E2%80%93_schemat_dziennej_sieci_tramwajowej.svg",
     "commons_file": "File:Toruń – schemat dziennej sieci tramwajowej.svg", "license": "CC BY-SA 4.0", "artist": "Commons contributor",
     "notes": "Toruń daily tram network schematic; light bg colored lines"},
    {"slug": "eu-rou-arad", "key": "europe/romania/eu-rou-arad", "city": "Arad", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/1/18/Tramvai_Arad_20120324.svg",
     "commons_file": "File:Tramvai Arad 20120324.svg", "license": "CC BY-SA 3.0", "artist": "Commons contributor",
     "notes": "Arad tram network schematic (2012); only full-network map on Commons"},
    {"slug": "eu-ger-jena", "key": "europe/germany/eu-ger-jena", "city": "Jena", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/2/23/Jena_Strassenbahn.svg",
     "commons_file": "File:Jena Strassenbahn.svg", "license": "CC BY-SA 3.0", "artist": "Commons contributor",
     "notes": "Jena Straßenbahn network schematic"},
    {"slug": "eu-rus-kolomna", "key": "europe/russia/eu-rus-kolomna", "city": "Kolomna", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kolomna-tram.png",
     "commons_file": "File:Kolomna-tram.png", "license": "CC BY-SA 2.0", "artist": "Artem Svetlov",
     "notes": "Kolomna tram ring network schematic"},
    {"slug": "eu-bel-ghent", "key": "europe/belgium/eu-bel-ghent", "city": "Ghent", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/6/60/Tramnet_Gent.png",
     "commons_file": "File:Tramnet Gent.png", "license": "CC BY-SA 3.0", "artist": "Commons contributor",
     "notes": "Ghent De Lijn tram network schematic; light bg colored routes"},
    {"slug": "eu-pol-elblag", "key": "europe/poland/eu-pol-elblag", "city": "Elblag", "status": "MISS",
     "notes": "Only per-line PNGs on Commons; no full-network schematic"},
    {"slug": "as-tur-kayseri", "key": "asia/turkey/as-tur-kayseri", "city": "Kayseri", "status": "HIT_COMMUNITY",
     "url": "https://upload.wikimedia.org/wikipedia/commons/6/66/Transitdiagram_kayseray_2024.png",
     "commons_file": "File:Transitdiagram kayseray 2024.png", "license": "CC BY-SA 4.0", "artist": "Commons contributor",
     "notes": "Kayseray light rail network diagram 2024; light bg colored routes"},
]

def curl_download(url, dest):
    subprocess.run(["curl", "-fsSL", "-A", UA, url, "-o", str(dest)], check=True)

def to_png(src, dst):
    ext = src.suffix.lower()
    if ext == ".png":
        if src != dst: dst.write_bytes(src.read_bytes())
        return
    if ext in (".jpg", ".jpeg", ".webp", ".gif"):
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

def main():
    STAGING.mkdir(parents=True, exist_ok=True)
    report = []
    for m in MAPS:
        base = {"key": m["key"], "city": m["city"], "status": m["status"],
                "local": None, "source_url": m.get("source_url") or m.get("url"),
                "commons_file": m.get("commons_file"), "license": m.get("license"),
                "artist": m.get("artist"), "notes": m["notes"]}
        if m["status"] == "MISS":
            base["source_url"] = None
            report.append(base)
            print(f"MISS {m['city']}")
            continue
        slug, url = m["slug"], m["url"]
        ext = Path(url.split("?")[0]).suffix or ".bin"
        raw, png = STAGING / f"{slug}{ext}", STAGING / f"{slug}.png"
        try:
            time.sleep(1.5)
            curl_download(url, raw)
            to_png(raw, png)
            base["local"] = f"data/metro/maps/_staging_2026-07-26/{png.name}"
            if not m.get("source_url"): base["source_url"] = url
            print(f"OK {m['city']}")
        except Exception as e:
            base.update(status="MISS", local=None, source_url=None,
                        notes=f"Download failed: {e}; {m['notes']}")
            print(f"FAIL {m['city']}: {e}")
        report.append(base)
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    counts = {}
    for r in report: counts[r["status"]] = counts.get(r["status"], 0) + 1
    print("\n=== SUMMARY ===")
    for k in sorted(counts): print(f"  {k}: {counts[k]}")
    print(f"Report: {REPORT}")

if __name__ == "__main__":
    main()
