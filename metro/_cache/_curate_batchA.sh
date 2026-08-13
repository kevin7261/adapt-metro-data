#!/usr/bin/env bash
# Curate batch A maps using curl (avoids Python SSL issues)
set -euo pipefail
ROOT="/Users/kevincheng/Library/CloudStorage/Dropbox/__NTU/__Thesis/_website/adapt-metro"
STAGING="$ROOT/data/metro/maps/_staging_2026-07-26"
REPORT="$ROOT/data/metro/_cache/_map_curate_batchA.json"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) adapt-metro-curate/1.0"
mkdir -p "$STAGING"

commons_url() {
  local file="$1"
  curl -sG "https://commons.wikimedia.org/w/api.php" \
    --data-urlencode "action=query" \
    --data-urlencode "titles=$file" \
    --data-urlencode "prop=imageinfo" \
    --data-urlencode "iiprop=url|extmetadata|size|mime" \
    --data-urlencode "format=json" \
    -A "$UA" | python3 -c "
import sys,json,re
d=json.load(sys.stdin)
for p in d['query']['pages'].values():
  if 'missing' in p: sys.exit(1)
  ii=p['imageinfo'][0]
  meta=ii.get('extmetadata',{})
  def m(k): return re.sub(r'<[^>]+>','',meta.get(k,{}).get('value','')).strip()
  print(ii['url'])
  print(m('LicenseShortName') or '?')
  print(m('Artist')[:120])
  print(ii.get('mime',''))
  print(ii.get('width',0), ii.get('height',0))
"
}

download_convert() {
  local slug="$1" url="$2" ext="${3:-}"
  if [[ -z "$ext" ]]; then ext="${url##*.}"; ext="${ext%%\?*}"; fi
  local raw="$STAGING/${slug}.${ext}"
  curl -fsSL -A "$UA" "$url" -o "$raw"
  local png="$STAGING/${slug}.png"
  case "$ext" in
    png) cp "$raw" "$png" ;;
    jpg|jpeg|webp) sips -s format png "$raw" --out "$png" >/dev/null ;;
    svg|pdf)
      qlmanage -t -s 2400 -o "$STAGING" "$raw" >/dev/null 2>&1
      local thumb="$STAGING/$(basename "$raw").png"
      [[ -f "$thumb" ]] && mv "$thumb" "$png" || cp "$raw" "$png"
      ;;
    *) cp "$raw" "$png" ;;
  esac
  echo "$png"
}

# slug|key|city|status|source_type|url_or_commons|commons_file|license|artist|notes
# source_type: official|commons

declare -a ENTRIES=(
  # Denver - official RTD 2024 rail map (semi-geographic, light bg, colored lines)
  "am-usa-denver|americas/united-states/am-usa-denver|Denver|HIT_OFFICIAL|official|https://cdn.rtd-denver.com/image/upload/v1734792008/A_w6uqtf.pdf||Official operator map (© RTD; thesis use)|RTD-Denver|2024 official RTD rail system map PDF; semi-geographic with colored train lines on light background"

  # Krakow - Commons schematic (MPK has no static downloadable map)
  "eu-pol-cracow|europe/poland/eu-pol-cracow|Cracow|HIT_COMMUNITY|commons|File:Krakow linie dzienne.svg|File:Krakow linie dzienne.svg|CC BY-SA 4.0|Agnaton|Current daytime tram lines schematic; light background colored routes"

  # Katowice - search needed
  "eu-pol-katowice|europe/poland/eu-pol-katowice|Katowice|COMMONS_SEARCH|commons|Katowice tram map|"

  # Lodz
  "eu-pol-lodz|europe/poland/eu-pol-lodz|Lodz|COMMONS_SEARCH|commons|Lodz tram map|"

  # Poznan
  "eu-pol-poznan|europe/poland/eu-pol-poznan|Poznan|COMMONS_SEARCH|commons|Poznan tram map|"

  # Ostrava
  "eu-cze-ostrava|europe/czechia/eu-cze-ostrava|Ostrava|COMMONS_SEARCH|commons|Ostrava tram map|"

  # The Hague - official HTM Jan 2026
  "eu-ned-the-hague|europe/netherlands/eu-ned-the-hague|The Hague|HIT_OFFICIAL|official|https://www.htm.nl/media/wb0dphxi/25039htm_a4haltekrtweb_5jan_tram_bus.pdf||Official operator map (© HTM; thesis use)|HTM|Official HTM tram+bus network map valid from Jan 2026; light bg colored tram lines"

  # Odesa
  "eu-ukr-odessa|europe/ukraine/eu-ukr-odessa|Odesa|COMMONS_SEARCH|commons|Odessa tram map|"

  # Kryvyi Rih
  "eu-ukr-kryvy-rih-krivoy-rog|europe/ukraine/eu-ukr-kryvy-rih-krivoy-rog|Kryvyi Rih|COMMONS_SEARCH|commons|Kryvyi Rih metrotram map|"

  # Brno
  "eu-cze-brno|europe/czechia/eu-cze-brno|Brno|COMMONS_SEARCH|commons|Brno tram map|"

  # Zagreb
  "eu-cro-zagreb|europe/croatia/eu-cro-zagreb|Zagreb|COMMONS_SEARCH|commons|Zagreb tram map|"

  # Basel
  "eu-sui-basel|europe/switzerland/eu-sui-basel|Basel|COMMONS_SEARCH|commons|File:Basel - Straßenbahnnetzplan.png|"

  # Ulyanovsk
  "eu-rus-ulyanovsk|europe/russia/eu-rus-ulyanovsk|Ulyanovsk|COMMONS_SEARCH|commons|Ulyanovsk tram map|"

  # Ust-Kamenogorsk
  "as-kaz-ust-kamenogorsk|asia/kazakhstan/as-kaz-ust-kamenogorsk|Ust-Kamenogorsk|COMMONS_SEARCH|commons|Ust-Kamenogorsk tram map|"

  # Graz
  "eu-aut-graz|europe/austria/eu-aut-graz|Graz|COMMONS_SEARCH|commons|File:Straßenbahn Graz Ende 2021 V3.png|"

  # Innsbruck
  "eu-aut-innsbruck|europe/austria/eu-aut-innsbruck|Innsbruck|COMMONS_SEARCH|commons|Innsbruck tram map|"

  # Torun
  "eu-pol-torun|europe/poland/eu-pol-torun|Torun|COMMONS_SEARCH|commons|Torun tram map|"

  # Arad
  "eu-rou-arad|europe/romania/eu-rou-arad|Arad|COMMONS_SEARCH|commons|Arad tram map|"

  # Jena
  "eu-ger-jena|europe/germany/eu-ger-jena|Jena|COMMONS_SEARCH|commons|Jena tram map|"

  # Kolomna
  "eu-rus-kolomna|europe/russia/eu-rus-kolomna|Kolomna|COMMONS_SEARCH|commons|Kolomna tram map|"

  # Ghent
  "eu-bel-ghent|europe/belgium/eu-bel-ghent|Ghent|COMMONS_SEARCH|commons|Ghent tram map|"

  # Elblag
  "eu-pol-elblag|europe/poland/eu-pol-elblag|Elblag|COMMONS_SEARCH|commons|Elblag tram map|"

  # Kayseri
  "as-tur-kayseri|asia/turkey/as-tur-kayseri|Kayseri|COMMONS_SEARCH|commons|Kayseri tram map|"

  # Jiaxing
  "as-chn-jiaxing|asia/china/as-chn-jiaxing|Jiaxing|COMMONS_SEARCH|commons|Jiaxing tram map|"
)

echo "[]" > "$REPORT.tmp"
