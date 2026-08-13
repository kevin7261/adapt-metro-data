# Metro data verification report

對照 **Wikipedia List of metro systems**（站數）＋ urbanrail.net 參考連結。

| 指標 | 值 |
|---|---|
| Wikipedia 系統數 | 233 |
| 本資料系統數 | 595 |
| 站數相符 (ok) | 185 |
| 標記待查 | 64（missing 9／no_line 0／span 0／order 16／zero 0／low 0／high 39） |
| 額外（不在 wiki 清單） | 388 |

## 不變式（invariants，違反＝資料一定有錯，必須驗證修正）

1. **wiki 有列的城市不可能沒資料**：違反數 **9**（severity `missing`）
2. **車站不可能沒有路線**：**0** 個系統、共 **0** 站的 `lines` 為空（severity `no_line`）
3. **線必有站、折點/端點必為車站**（幾何＝車站點依站序連線）：違反系統數 **0**（severity `vertex`）
4. **車站距離不可異常跨城**：相鄰 hop／系統 MST／近鄰 ≥40 km → severity `span`（**0** 系統）；≥30 km 為 warn
4. **站序必須正確**：**16** 個系統有站序可疑的線（severity `order`）——一律以該線 **Wikipedia 條目**的車站列表與 **urbanrail.net** 的線路站序人工確認

## 待查系統（fetch⇄verify 迴圈的回饋清單）

| 嚴重度 | 城市 | 國家 | 本站數 | wiki站數 | 比值 | 說明 | 參考 |
|---|---|---|---|---|---|---|---|
| missing | San Francisco (Bay Area) | United States | — | 47 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/BART[Nb_102]) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20San%20Francisco%20(Bay%20Area)) |
| missing | Taoyuan | Taiwan | — | 22 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/Taoyuan_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Taoyuan) |
| missing | Noida | India | — | 21 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/Noida_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Noida) |
| missing | Saitama Prefecture | Japan | — | 13 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/New_Shuttle) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Saitama%20Prefecture) |
| missing | New Taipei | Taiwan | — | 12 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/New_Taipei_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20New%20Taipei) |
| missing | Gurgaon | India | — | 11 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/Rapid_Metro_Gurgaon) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Gurgaon) |
| missing | Gimpo | South Korea | — | 10 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/Gimpo_Goldline) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Gimpo) |
| missing | Chiba Prefecture | Japan | — | 9 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/Tōyō_Rapid_Railway_Line) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Chiba%20Prefecture) |
| missing | Saitama Prefecture | Japan | — | 8 | — | 本資料無此系統（OSM 未以 route=subway 標記，或城市名不同） | [wiki](https://en.wikipedia.org/wiki/Saitama_Rapid_Railway_Line) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Saitama%20Prefecture) |
| order | Magnitogorsk | Russia | 141 | — | — | 3 條線站序可疑（路徑長 > 1.6× MST）：Трамвай №23 1.68×、Трамвай №8 1.64×、Трамвай №4 1.64×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Magnitogorsk) |
| order | Gothenburg | Sweden | 132 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Spårvagn: Lisebergslinjen 2×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Gothenburg) |
| order | Ostrava | Czechia | 101 | — | — | 2 條線站序可疑（路徑長 > 1.6× MST）：19 1.96×、9 1.89×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Ostrava) |
| order | Nizhniy Tagil | Russia | 74 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Трамвай 4а: Тагилстрой - Приречный 1.88×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Nizhniy%20Tagil) |
| order | Irkutsk | Russia | 54 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Трамвай 6: ул. Волжская - Центральный рынок - м/р Солнечный 1.63×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Irkutsk) |
| order | Iasi | Romania | 58 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Tram 13 1.87×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Iasi) |
| order | Pretoria | South Africa | 90 | — | — | 4 條線站序可疑（路徑長 > 1.6× MST）：Metrorail Orange Line 1.98×、Pretoria 1.98×、Metrorail Pale Brown Line 1.97×、Pretoria 1.96×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Pretoria) |
| order | Kemerovo | Russia | 75 | — | — | 5 條線站序可疑（路徑長 > 1.6× MST）：Трамвай № 1 2×、Трамвай № 10 1.87×、Трамвай № 3 1.85×、Трамвай № 5 1.76×…，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Kemerovo) |
| order | Smolensk | Russia | 34 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Трамвай №1: ул.Багратиона - Электроламповый завод 1.8×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Smolensk) |
| order | Edmonton | Canada | 38 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：High Level Bridge Streetcar 1.63×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Edmonton) |
| order | Toyama | Japan | 39 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：6系統 1.78×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Toyama) |
| order | Kobe | Japan | 43 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：ポートライナー 1.64×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Kobe) |
| order | Palermo | Italy | 43 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Tram L4 1.95×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Palermo) |
| order | Antalya | Turkey | 68 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：T2 Müze - Zerdailik tramvay Hattı 1.73×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Antalya) |
| order | Brest | France | 39 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：Tram B 3.46×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Brest) |
| order | Huangshi | China | 31 | — | — | 1 條線站序可疑（路徑長 > 1.6× MST）：黄石现代有轨电车 2×，需以 Wikipedia 線路條目與 urbanrail 人工確認站序 | [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Huangshi) |
| high | Berlin | Germany | 300 | 175 | 1.71 | 站數偏多（300 vs wiki 175），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Berlin_U-Bahn) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Berlin) |
| high | Bangkok | Thailand | 176 | 109 | 1.61 | 站數偏多（176 vs wiki 109），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Metropolitan_Rapid_Transit) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Bangkok) |
| high | Tokyo | Japan | 202 | 99 | 2.04 | 站數偏多（202 vs wiki 99），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Toei_Subway) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Tokyo) |
| high | Munich | Germany | 381 | 96 | 3.97 | 站數偏多（381 vs wiki 96），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Munich_U-Bahn) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Munich) |
| high | Hamburg | Germany | 154 | 93 | 1.66 | 站數偏多（154 vs wiki 93），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Hamburg_U-Bahn) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Hamburg) |
| high | Bangkok | Thailand | 176 | 64 | 2.75 | 站數偏多（176 vs wiki 64），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/BTS_Skytrain) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Bangkok) |
| high | Brussels | Belgium | 214 | 59 | 3.63 | 站數偏多（214 vs wiki 59），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Brussels_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Brussels) |
| high | Boston | United States | 120 | 52 | 2.31 | 站數偏多（120 vs wiki 52），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/MBTA_subway[Nb_92]) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Boston) |
| high | Kyiv | Ukraine | 224 | 49 | 4.57 | 站數偏多（224 vs wiki 49），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Kyiv_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Kyiv) |
| high | London | United Kingdom | 262 | 45 | 5.82 | 站數偏多（262 vs wiki 45），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Docklands_Light_Railway) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20London) |
| high | Lyon | France | 146 | 42 | 3.48 | 站數偏多（146 vs wiki 42），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Lyon_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Lyon) |
| high | Kaohsiung | Taiwan | 72 | 38 | 1.89 | 站數偏多（72 vs wiki 38），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Kaohsiung_Rapid_Transit) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Kaohsiung) |
| high | Guadalajara | Mexico | 54 | 28 | 1.93 | 站數偏多（54 vs wiki 28），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/SITEUR[Nb_65]) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Guadalajara) |
| high | İzmir | Turkey | 100 | 24 | 4.17 | 站數偏多（100 vs wiki 24），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/İzmir_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20%C4%B0zmir) |
| high | Montreal | Canada | 68 | 23 | 2.96 | 站數偏多（68 vs wiki 23），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Réseau_express_métropolitain) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Montreal) |
| high | Miami | United States | 42 | 23 | 1.83 | 站數偏多（42 vs wiki 23），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Metrorail) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Miami) |
| high | Hiroshima | Japan | 98 | 22 | 4.45 | 站數偏多（98 vs wiki 22），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Astram_Line) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Hiroshima) |
| high | Sydney | Australia | 176 | 21 | 8.38 | 站數偏多（176 vs wiki 21），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Sydney_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Sydney) |
| high | New York City | United States | 443 | 21 | 21.1 | 站數偏多（443 vs wiki 21），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Staten_Island_Railway) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20New%20York%20City) |
| high | Algiers | Algeria | 56 | 19 | 2.95 | 站數偏多（56 vs wiki 19），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Algiers_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Algiers) |
| high | Los Angeles | United States | 109 | 19 | 5.74 | 站數偏多（109 vs wiki 19），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Metro_Rail[Nb_96]) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Los%20Angeles) |
| high | Jakarta | Indonesia | 88 | 18 | 4.89 | 站數偏多（88 vs wiki 18），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Jabodebek_LRT) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Jakarta) |
| high | Kobe | Japan | 43 | 18 | 2.39 | 站數偏多（43 vs wiki 18），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Kobe_New_Transit) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Kobe) |
| high | Tokyo | Japan | 202 | 16 | 12.63 | 站數偏多（202 vs wiki 16），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Yurikamome) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Tokyo) |
| high | Seoul | South Korea | 426 | 16 | 26.63 | 站數偏多（426 vs wiki 16），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Shinbundang_Line[Nb_62]_(Neo_Trans)) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Seoul) |
| high | Nizhny Novgorod | Russia | 83 | 15 | 5.53 | 站數偏多（83 vs wiki 15），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Nizhny_Novgorod_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Nizhny%20Novgorod) |
| high | Yokohama | Japan | 40 | 14 | 2.86 | 站數偏多（40 vs wiki 14），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Kanazawa_Seaside_Line) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Yokohama) |
| high | Novosibirsk | Russia | 121 | 14 | 8.64 | 站數偏多（121 vs wiki 14），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Novosibirsk_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Novosibirsk) |
| high | Lausanne | Switzerland | 28 | 14 | 2 | 站數偏多（28 vs wiki 14），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Lausanne_Metro[Nb_85]) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Lausanne) |
| high | Baltimore | United States | 46 | 14 | 3.29 | 站數偏多（46 vs wiki 14），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Baltimore_Metro_SubwayLink) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Baltimore) |
| high | Philadelphia | United States | 63 | 14 | 4.5 | 站數偏多（63 vs wiki 14），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/PATCO_Speedline) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Philadelphia) |
| high | Jakarta | Indonesia | 88 | 13 | 6.77 | 站數偏多（88 vs wiki 13），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Jakarta_MRT) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Jakarta) |
| high | Tokyo | Japan | 202 | 13 | 15.54 | 站數偏多（202 vs wiki 13），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Nippori-Toneri_Liner) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Tokyo) |
| high | Manila | Philippines | 50 | 13 | 3.85 | 站數偏多（50 vs wiki 13），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Manila_Metro_Rail_Transit_System) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Manila) |
| high | New York City | United States | 443 | 13 | 34.08 | 站數偏多（443 vs wiki 13），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/PATH) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20New%20York%20City) |
| high | Tokyo | Japan | 202 | 8 | 25.25 | 站數偏多（202 vs wiki 8），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Rinkai_Line) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Tokyo) |
| high | Jakarta | Indonesia | 88 | 6 | 14.67 | 站數偏多（88 vs wiki 6），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Jakarta_LRT) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Jakarta) |
| high | Yokohama | Japan | 40 | 6 | 6.67 | 站數偏多（40 vs wiki 6），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Minatomirai_Line) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Yokohama) |
| high | Karaj | Iran | 10 | 4 | 2.5 | 站數偏多（10 vs wiki 4），可能混入輕軌 | [wiki](https://en.wikipedia.org/wiki/Karaj_Metro) · [urbanrail](https://www.google.com/search?q=site%3Aurbanrail.net%20Karaj) |

## 額外系統（本資料有、Wikipedia 清單無）

多為 OSM 標為 subway 但非 Wikipedia 定義的地鐵、或城市名變體/切分。

| 檔案 | 城市 | 國家 | 站 | 線 |
|---|---|---|---|---|
| maps/eu-pol-lodz/eu-pol-lodz/1-raw-maps/working/eu-pol-lodz-1-raw-maps-working.geojson | Lodz | Poland | 239 | 24 |
| maps/eu-pol-wroclaw/eu-pol-wroclaw/1-raw-maps/working/eu-pol-wroclaw-1-raw-maps-working.geojson | Wroclaw | Poland | 194 | 25 |
| maps/eu-ger-leipzig/eu-ger-leipzig/1-raw-maps/working/eu-ger-leipzig-1-raw-maps-working.geojson | Leipzig | Germany | 201 | 18 |
| maps/eu-rus-magnitogorsk/eu-rus-magnitogorsk/1-raw-maps/working/eu-rus-magnitogorsk-1-raw-maps-working.geojson | Magnitogorsk | Russia | 141 | 36 |
| maps/eu-ger-dresden/eu-ger-dresden/1-raw-maps/working/eu-ger-dresden-1-raw-maps-working.geojson | Dresden | Germany | 259 | 13 |
| maps/eu-swe-gothenburg/eu-swe-gothenburg/1-raw-maps/working/eu-swe-gothenburg-1-raw-maps-working.geojson | Gothenburg | Sweden | 132 | 14 |
| maps/eu-ger-stuttgart/eu-ger-stuttgart/1-raw-maps/working/eu-ger-stuttgart-1-raw-maps-working.geojson | Stuttgart | Germany | 208 | 17 |
| maps/eu-ger-dusseldorf/eu-ger-dusseldorf/1-raw-maps/working/eu-ger-dusseldorf-1-raw-maps-working.geojson | Düsseldorf | Germany | 285 | 18 |
| maps/eu-pol-katowice/eu-pol-katowice/1-raw-maps/working/eu-pol-katowice-1-raw-maps-working.geojson | Katowice | Poland | 275 | 23 |
| maps/eu-pol-poznan/eu-pol-poznan/1-raw-maps/working/eu-pol-poznan-1-raw-maps-working.geojson | Poznan | Poland | 134 | 18 |
| maps/eu-ned-the-hague/eu-ned-the-hague/1-raw-maps/working/eu-ned-the-hague-1-raw-maps-working.geojson | The Hague | Netherlands | 218 | 15 |
| maps/eu-sui-zurich/eu-sui-zurich/1-raw-maps/working/eu-sui-zurich-1-raw-maps-working.geojson | Zurich | Switzerland | 236 | 19 |
| maps/eu-ger-berlin/eu-ger-berlin-shape-rect/1-raw-maps/working/eu-ger-berlin-shape-rect-1-raw-maps-working.geojson | Berlin | Germany | 300 | 26 |
| maps/eu-ger-frankfurt/eu-ger-frankfurt/1-raw-maps/working/eu-ger-frankfurt-1-raw-maps-working.geojson | Frankfurt | Germany | 190 | 21 |
| maps/eu-pol-cracow/eu-pol-cracow/1-raw-maps/working/eu-pol-cracow-1-raw-maps-working.geojson | Cracow | Poland | 148 | 18 |
| maps/eu-cze-ostrava/eu-cze-ostrava/1-raw-maps/working/eu-cze-ostrava-1-raw-maps-working.geojson | Ostrava | Czechia | 101 | 17 |
| maps/as-jpn-tokyo/as-jpn-tokyo-shape-rect/1-raw-maps/working/as-jpn-tokyo-shape-rect-1-raw-maps-working.geojson | Tokyo | Japan | 202 | 14 |
| maps/eu-ger-halle-saale/eu-ger-halle-saale/1-raw-maps/working/eu-ger-halle-saale-1-raw-maps-working.geojson | Halle (Saale) | Germany | 145 | 19 |
| maps/eu-cze-brno/eu-cze-brno/1-raw-maps/working/eu-cze-brno-1-raw-maps-working.geojson | Brno | Czechia | 148 | 11 |
| maps/eu-ger-ludwigshafen/eu-ger-ludwigshafen/1-raw-maps/working/eu-ger-ludwigshafen-1-raw-maps-working.geojson | Ludwigshafen | Germany | 199 | 14 |
| maps/eu-bel-antwerp/eu-bel-antwerp/1-raw-maps/working/eu-bel-antwerp-1-raw-maps-working.geojson | Antwerp | Belgium | 154 | 12 |
| maps/eu-sui-basel/eu-sui-basel/1-raw-maps/working/eu-sui-basel-1-raw-maps-working.geojson | Basel | Switzerland | 187 | 13 |
| maps/eu-ger-hannover/eu-ger-hannover/1-raw-maps/working/eu-ger-hannover-1-raw-maps-working.geojson | Hannover | Germany | 196 | 14 |
| maps/eu-rus-krasnodar/eu-rus-krasnodar/1-raw-maps/working/eu-rus-krasnodar-1-raw-maps-working.geojson | Krasnodar | Russia | 129 | 16 |
| maps/eu-ger-kassel/eu-ger-kassel/1-raw-maps/working/eu-ger-kassel-1-raw-maps-working.geojson | Kassel | Germany | 158 | 11 |
| maps/eu-cro-zagreb/eu-cro-zagreb/1-raw-maps/working/eu-cro-zagreb-1-raw-maps-working.geojson | Zagreb | Croatia | 117 | 19 |
| maps/eu-rus-barnaul/eu-rus-barnaul/1-raw-maps/working/eu-rus-barnaul-1-raw-maps-working.geojson | Barnaul | Russia | 111 | 8 |
| maps/oc-aus-melbourne/oc-aus-melbourne/1-raw-maps/working/oc-aus-melbourne-1-raw-maps-working.geojson | Melbourne | Australia | 225 | 21 |
| maps/as-chn-shanghai/as-chn-shanghai-shape-rect/1-raw-maps/working/as-chn-shanghai-shape-rect-1-raw-maps-working.geojson | Shanghai | China | 407 | 21 |
| maps/na-usa-portland/na-usa-portland/1-raw-maps/working/na-usa-portland-1-raw-maps-working.geojson | Portland | United States | 153 | 10 |
| maps/eu-ger-karlsruhe/eu-ger-karlsruhe/1-raw-maps/working/eu-ger-karlsruhe-1-raw-maps-working.geojson | Karlsruhe | Germany | 105 | 11 |
| maps/eu-pol-szczecin/eu-pol-szczecin/1-raw-maps/working/eu-pol-szczecin-1-raw-maps-working.geojson | Szczecin | Poland | 107 | 11 |
| maps/eu-srb-belgrade/eu-srb-belgrade/1-raw-maps/working/eu-srb-belgrade-1-raw-maps-working.geojson | Belgrade | Serbia | 77 | 11 |
| maps/eu-ger-magdeburg/eu-ger-magdeburg/1-raw-maps/working/eu-ger-magdeburg-1-raw-maps-working.geojson | Magdeburg | Germany | 131 | 13 |
| maps/eu-rus-ulyanovsk/eu-rus-ulyanovsk/1-raw-maps/working/eu-rus-ulyanovsk-1-raw-maps-working.geojson | Ulyanovsk | Russia | 116 | 12 |
| maps/eu-ukr-odessa/eu-ukr-odessa/1-raw-maps/working/eu-ukr-odessa-1-raw-maps-working.geojson | Odessa | Ukraine | 199 | 17 |
| maps/as-chn-beijing/as-chn-beijing-shape-rect/1-raw-maps/working/as-chn-beijing-shape-rect-1-raw-maps-working.geojson | Beijing | China | 398 | 27 |
| maps/eu-rus-chelyabinsk/eu-rus-chelyabinsk/1-raw-maps/working/eu-rus-chelyabinsk-1-raw-maps-working.geojson | Chelyabinsk | Russia | 118 | 14 |
| maps/eu-ger-cologne/eu-ger-cologne/1-raw-maps/working/eu-ger-cologne-1-raw-maps-working.geojson | Cologne | Germany | 186 | 10 |
| maps/eu-pol-gdansk/eu-pol-gdansk/1-raw-maps/working/eu-pol-gdansk-1-raw-maps-working.geojson | Gdansk | Poland | 115 | 11 |
| maps/eu-ukr-lviv/eu-ukr-lviv/1-raw-maps/working/eu-ukr-lviv-1-raw-maps-working.geojson | Lviv | Ukraine | 70 | 8 |
| maps/as-kor-seoul/as-kor-seoul-shape-rect/1-raw-maps/working/as-kor-seoul-shape-rect-1-raw-maps-working.geojson | Seoul | South Korea | 426 | 23 |
| maps/af-rsa-johannesburg/af-rsa-johannesburg/1-raw-maps/working/af-rsa-johannesburg-1-raw-maps-working.geojson | Johannesburg | South Africa | 155 | 18 |
| maps/eu-ger-bremen/eu-ger-bremen/1-raw-maps/working/eu-ger-bremen-1-raw-maps-working.geojson | Bremen | Germany | 165 | 8 |
| maps/eu-fra-montpellier/eu-fra-montpellier/1-raw-maps/working/eu-fra-montpellier-1-raw-maps-working.geojson | Montpellier | France | 111 | 6 |
| maps/af-rsa-cape-town/af-rsa-cape-town/1-raw-maps/working/af-rsa-cape-town-1-raw-maps-working.geojson | Cape Town | South Africa | 110 | 16 |
| maps/eu-rus-perm/eu-rus-perm/1-raw-maps/working/eu-rus-perm-1-raw-maps-working.geojson | Perm | Russia | 93 | 8 |
| maps/eu-rus-vladikavkaz/eu-rus-vladikavkaz/1-raw-maps/working/eu-rus-vladikavkaz-1-raw-maps-working.geojson | Vladikavkaz | Russia | 71 | 12 |
| maps/eu-aut-innsbruck/eu-aut-innsbruck/1-raw-maps/working/eu-aut-innsbruck-1-raw-maps-working.geojson | Innsbruck | Austria | 84 | 6 |
| maps/eu-ukr-mykolaiv/eu-ukr-mykolaiv/1-raw-maps/working/eu-ukr-mykolaiv-1-raw-maps-working.geojson | Mykolaiv | Ukraine | 69 | 6 |
| maps/eu-rus-volgograd/eu-rus-volgograd/1-raw-maps/working/eu-rus-volgograd-1-raw-maps-working.geojson | Volgograd | Russia | 107 | 13 |
| maps/eu-svk-kosice/eu-svk-kosice/1-raw-maps/working/eu-svk-kosice-1-raw-maps-working.geojson | Kosice | Slovakia | 53 | 15 |
| maps/eu-ger-erfurt/eu-ger-erfurt/1-raw-maps/working/eu-ger-erfurt-1-raw-maps-working.geojson | Erfurt | Germany | 88 | 6 |
| maps/eu-rus-nizhniy-tagil/eu-rus-nizhniy-tagil/1-raw-maps/working/eu-rus-nizhniy-tagil-1-raw-maps-working.geojson | Nizhniy Tagil | Russia | 74 | 15 |
| maps/eu-rou-timisoara/eu-rou-timisoara/1-raw-maps/working/eu-rou-timisoara-1-raw-maps-working.geojson | Timisoara | Romania | 72 | 9 |
| maps/eu-rus-tula/eu-rus-tula/1-raw-maps/working/eu-rus-tula-1-raw-maps-working.geojson | Tula | Russia | 83 | 10 |
| maps/eu-fra-strasbourg/eu-fra-strasbourg/1-raw-maps/working/eu-fra-strasbourg-1-raw-maps-working.geojson | Strasbourg | France | 94 | 6 |
| maps/eu-ger-chemnitz/eu-ger-chemnitz/1-raw-maps/working/eu-ger-chemnitz-1-raw-maps-working.geojson | Chemnitz | Germany | 105 | 9 |
| maps/eu-ger-bonn/eu-ger-bonn/1-raw-maps/working/eu-ger-bonn-1-raw-maps-working.geojson | Bonn | Germany | 141 | 9 |
| maps/eu-rus-irkutsk/eu-rus-irkutsk/1-raw-maps/working/eu-rus-irkutsk-1-raw-maps-working.geojson | Irkutsk | Russia | 54 | 7 |
| maps/eu-rus-moscow/eu-rus-moscow-shape-rect/1-raw-maps/working/eu-rus-moscow-shape-rect-1-raw-maps-working.geojson | Moscow | Russia | 235 | 17 |
| maps/oc-aus-brisbane/oc-aus-brisbane/1-raw-maps/working/oc-aus-brisbane-1-raw-maps-working.geojson | Brisbane | Australia | 149 | 16 |
| maps/eu-rou-iasi/eu-rou-iasi/1-raw-maps/working/eu-rou-iasi-1-raw-maps-working.geojson | Iasi | Romania | 58 | 9 |
| maps/eu-gbr-manchester/eu-gbr-manchester/1-raw-maps/working/eu-gbr-manchester-1-raw-maps-working.geojson | Manchester | United Kingdom | 100 | 11 |
| maps/eu-ger-braunschweig/eu-ger-braunschweig/1-raw-maps/working/eu-ger-braunschweig-1-raw-maps-working.geojson | Braunschweig | Germany | 81 | 6 |
| maps/eu-aut-graz/eu-aut-graz/1-raw-maps/working/eu-aut-graz-1-raw-maps-working.geojson | Graz | Austria | 105 | 9 |
| maps/as-sgp-singapore/as-sgp-singapore-shape-rect/1-raw-maps/working/as-sgp-singapore-shape-rect-1-raw-maps-working.geojson | Singapore | Singapore | 146 | 8 |
| maps/na-usa-denver/na-usa-denver/1-raw-maps/working/na-usa-denver-1-raw-maps-working.geojson | Denver | United States | 60 | 7 |
| maps/eu-ger-potsdam/eu-ger-potsdam/1-raw-maps/working/eu-ger-potsdam-1-raw-maps-working.geojson | Potsdam | Germany | 96 | 8 |
| maps/oc-aus-adelaide/oc-aus-adelaide/1-raw-maps/working/oc-aus-adelaide-1-raw-maps-working.geojson | Adelaide | Australia | 121 | 16 |
| maps/eu-ger-darmstadt/eu-ger-darmstadt/1-raw-maps/working/eu-ger-darmstadt-1-raw-maps-working.geojson | Darmstadt | Germany | 78 | 10 |
| maps/eu-ger-dortmund/eu-ger-dortmund/1-raw-maps/working/eu-ger-dortmund-1-raw-maps-working.geojson | Dortmund | Germany | 121 | 8 |
| maps/af-rsa-pretoria/af-rsa-pretoria/1-raw-maps/working/af-rsa-pretoria-1-raw-maps-working.geojson | Pretoria | South Africa | 90 | 15 |
| maps/eu-rus-naberezhnye-chelny/eu-rus-naberezhnye-chelny/1-raw-maps/working/eu-rus-naberezhnye-chelny-1-raw-maps-working.geojson | Naberezhnye Chelny | Russia | 96 | 11 |
| maps/eu-ger-rostock/eu-ger-rostock/1-raw-maps/working/eu-ger-rostock-1-raw-maps-working.geojson | Rostock | Germany | 66 | 6 |
| maps/eu-lat-riga/eu-lat-riga/1-raw-maps/working/eu-lat-riga-1-raw-maps-working.geojson | Riga | Latvia | 120 | 7 |
| maps/eu-rou-arad/eu-rou-arad/1-raw-maps/working/eu-rou-arad-1-raw-maps-working.geojson | Arad | Romania | 49 | 10 |
| maps/eu-rou-oradea/eu-rou-oradea/1-raw-maps/working/eu-rou-oradea-1-raw-maps-working.geojson | Oradea | Romania | 32 | 7 |
| maps/eu-svk-bratislava/eu-svk-bratislava/1-raw-maps/working/eu-svk-bratislava-1-raw-maps-working.geojson | Bratislava | Slovakia | 80 | 4 |
| maps/eu-pol-torun/eu-pol-torun/1-raw-maps/working/eu-pol-torun-1-raw-maps-working.geojson | Torun | Poland | 61 | 7 |
| maps/eu-rus-ulan-ude/eu-rus-ulan-ude/1-raw-maps/working/eu-rus-ulan-ude-1-raw-maps-working.geojson | Ulan-Ude | Russia | 47 | 6 |
| maps/eu-ger-bochum/eu-ger-bochum/1-raw-maps/working/eu-ger-bochum-1-raw-maps-working.geojson | Bochum | Germany | 176 | 9 |
| maps/eu-ger-augsburg/eu-ger-augsburg/1-raw-maps/working/eu-ger-augsburg-1-raw-maps-working.geojson | Augsburg | Germany | 100 | 7 |
| maps/eu-pol-bydgoszcz/eu-pol-bydgoszcz/1-raw-maps/working/eu-pol-bydgoszcz-1-raw-maps-working.geojson | Bydgoszcz | Poland | 59 | 10 |
| maps/af-rsa-durban/af-rsa-durban/1-raw-maps/working/af-rsa-durban-1-raw-maps-working.geojson | Durban | South Africa | 101 | 9 |
| maps/eu-est-tallinn/eu-est-tallinn/1-raw-maps/working/eu-est-tallinn-1-raw-maps-working.geojson | Tallinn | Estonia | 42 | 5 |
| maps/eu-rus-angarsk/eu-rus-angarsk/1-raw-maps/working/eu-rus-angarsk-1-raw-maps-working.geojson | Angarsk | Russia | 40 | 5 |
| maps/eu-sui-bern/eu-sui-bern/1-raw-maps/working/eu-sui-bern-1-raw-maps-working.geojson | Bern | Switzerland | 60 | 5 |
| maps/eu-fra-bordeaux/eu-fra-bordeaux/1-raw-maps/working/eu-fra-bordeaux-1-raw-maps-working.geojson | Bordeaux | France | 133 | 6 |
| maps/eu-ger-freiburg/eu-ger-freiburg/1-raw-maps/working/eu-ger-freiburg-1-raw-maps-working.geojson | Freiburg | Germany | 75 | 6 |
| maps/eu-rus-izhevsk/eu-rus-izhevsk/1-raw-maps/working/eu-rus-izhevsk-1-raw-maps-working.geojson | Izhevsk | Russia | 66 | 11 |
| maps/eu-rus-kemerovo/eu-rus-kemerovo/1-raw-maps/working/eu-rus-kemerovo-1-raw-maps-working.geojson | Kemerovo | Russia | 75 | 5 |
| maps/eu-rus-novotroitsk/eu-rus-novotroitsk/1-raw-maps/working/eu-rus-novotroitsk-1-raw-maps-working.geojson | Novotroitsk | Russia | 69 | 9 |
| maps/eu-cze-olomouc/eu-cze-olomouc/1-raw-maps/working/eu-cze-olomouc-1-raw-maps-working.geojson | Olomouc | Czechia | 36 | 7 |
| maps/oc-aus-perth/oc-aus-perth/1-raw-maps/working/oc-aus-perth-1-raw-maps-working.geojson | Perth | Australia | 86 | 11 |
| maps/eu-esp-valencia/eu-esp-valencia/1-raw-maps/working/eu-esp-valencia-1-raw-maps-working.geojson | Valencia | Spain | 96 | 6 |
| maps/eu-ukr-donetsk/eu-ukr-donetsk/1-raw-maps/working/eu-ukr-donetsk-1-raw-maps-working.geojson | Donetsk | Ukraine | 74 | 9 |
| maps/as-tur-eskisehir/as-tur-eskisehir/1-raw-maps/working/as-tur-eskisehir-1-raw-maps-working.geojson | Eskisehir | Turkey | 55 | 7 |
| maps/eu-rus-omsk/eu-rus-omsk/1-raw-maps/working/eu-rus-omsk-1-raw-maps-working.geojson | Omsk | Russia | 65 | 6 |
| maps/eu-rus-volzhskiy/eu-rus-volzhskiy/1-raw-maps/working/eu-rus-volzhskiy-1-raw-maps-working.geojson | Volzhskiy | Russia | 56 | 8 |
| maps/eu-ger-wurzburg/eu-ger-wurzburg/1-raw-maps/working/eu-ger-wurzburg-1-raw-maps-working.geojson | Würzburg | Germany | 45 | 5 |
| maps/eu-bel-charleroi/eu-bel-charleroi/1-raw-maps/working/eu-bel-charleroi-1-raw-maps-working.geojson | Charleroi | Belgium | 56 | 11 |
| maps/na-usa-dallas/na-usa-dallas/1-raw-maps/working/na-usa-dallas-1-raw-maps-working.geojson | Dallas | United States | 92 | 6 |
| maps/eu-sui-geneva/eu-sui-geneva/1-raw-maps/working/eu-sui-geneva-1-raw-maps-working.geojson | Geneva | Switzerland | 84 | 5 |
| maps/eu-bel-ghent/eu-bel-ghent/1-raw-maps/working/eu-bel-ghent-1-raw-maps-working.geojson | Ghent | Belgium | 65 | 4 |
| maps/eu-gbr-liverpool/eu-gbr-liverpool/1-raw-maps/working/eu-gbr-liverpool-1-raw-maps-working.geojson | Liverpool | United Kingdom | 69 | 7 |
| maps/eu-blr-vitebsk/eu-blr-vitebsk/1-raw-maps/working/eu-blr-vitebsk-1-raw-maps-working.geojson | Vitebsk | Belarus | 51 | 7 |
| maps/na-usa-san-francisco/na-usa-san-francisco-bart/1-raw-maps/working/na-usa-san-francisco-bart-1-raw-maps-working.geojson | San Francisco BART | United States | 50 | 5 |
| maps/eu-fra-grenoble/eu-fra-grenoble/1-raw-maps/working/eu-fra-grenoble-1-raw-maps-working.geojson | Grenoble | France | 81 | 5 |
| maps/eu-ger-jena/eu-ger-jena/1-raw-maps/working/eu-ger-jena-1-raw-maps-working.geojson | Jena | Germany | 48 | 5 |
| maps/eu-rus-kolomna/eu-rus-kolomna/1-raw-maps/working/eu-rus-kolomna-1-raw-maps-working.geojson | Kolomna | Russia | 42 | 10 |
| maps/eu-ger-mainz/eu-ger-mainz/1-raw-maps/working/eu-ger-mainz-1-raw-maps-working.geojson | Mainz | Germany | 60 | 5 |
| maps/af-tun-tunis/af-tun-tunis/1-raw-maps/working/af-tun-tunis-1-raw-maps-working.geojson | Tunis | Tunisia | 79 | 6 |
| maps/na-usa-san-diego/na-usa-san-diego/1-raw-maps/working/na-usa-san-diego-1-raw-maps-working.geojson | San Diego | United States | 62 | 4 |
| maps/eu-pol-elblag/eu-pol-elblag/1-raw-maps/working/eu-pol-elblag-1-raw-maps-working.geojson | Elblag | Poland | 35 | 5 |
| maps/as-tur-konya/as-tur-konya/1-raw-maps/working/as-tur-konya-1-raw-maps-working.geojson | Konya | Turkey | 40 | 6 |
| maps/eu-rus-krasnoyarsk/eu-rus-krasnoyarsk/1-raw-maps/working/eu-rus-krasnoyarsk-1-raw-maps-working.geojson | Krasnoyarsk | Russia | 50 | 5 |
| maps/as-jpn-nagasaki/as-jpn-nagasaki/1-raw-maps/working/as-jpn-nagasaki-1-raw-maps-working.geojson | Nagasaki | Japan | 38 | 5 |
| maps/eu-cze-plzen/eu-cze-plzen/1-raw-maps/working/eu-cze-plzen-1-raw-maps-working.geojson | Plzen | Czechia | 53 | 8 |
| maps/eu-rus-rostov-on-don/eu-rus-rostov-on-don/1-raw-maps/working/eu-rus-rostov-on-don-1-raw-maps-working.geojson | Rostov-on-Don | Russia | 61 | 5 |
| maps/eu-bih-sarajevo/eu-bih-sarajevo/1-raw-maps/working/eu-bih-sarajevo-1-raw-maps-working.geojson | Sarajevo | Bosnia and Herzegovina | 28 | 6 |
| maps/eu-ger-bielefeld/eu-ger-bielefeld/1-raw-maps/working/eu-ger-bielefeld-1-raw-maps-working.geojson | Bielefeld | Germany | 59 | 4 |
| maps/eu-ger-heilbronn/eu-ger-heilbronn/1-raw-maps/working/eu-ger-heilbronn-1-raw-maps-working.geojson | Heilbronn | Germany | 106 | 4 |
| maps/na-usa-salt-lake-city/na-usa-salt-lake-city/1-raw-maps/working/na-usa-salt-lake-city-1-raw-maps-working.geojson | Salt Lake City | United States | 58 | 4 |
| maps/eu-por-porto/eu-por-porto/1-raw-maps/working/eu-por-porto-1-raw-maps-working.geojson | Porto | Portugal | 85 | 7 |
| maps/na-can-calgary/na-can-calgary/1-raw-maps/working/na-can-calgary-1-raw-maps-working.geojson | Calgary | Canada | 45 | 4 |
| maps/na-usa-sacramento/na-usa-sacramento/1-raw-maps/working/na-usa-sacramento-1-raw-maps-working.geojson | Sacramento | United States | 54 | 4 |
| maps/eu-hun-szeged/eu-hun-szeged/1-raw-maps/working/eu-hun-szeged-1-raw-maps-working.geojson | Szeged | Hungary | 51 | 6 |
| maps/eu-fra-nantes/eu-fra-nantes/1-raw-maps/working/eu-fra-nantes-1-raw-maps-working.geojson | Nantes | France | 99 | 5 |
| maps/eu-rou-braila/eu-rou-braila/1-raw-maps/working/eu-rou-braila-1-raw-maps-working.geojson | Braila | Romania | 34 | 4 |
| maps/eu-ger-heidelberg/eu-ger-heidelberg/1-raw-maps/working/eu-ger-heidelberg-1-raw-maps-working.geojson | Heidelberg | Germany | 48 | 4 |
| maps/eu-aut-linz/eu-aut-linz/1-raw-maps/working/eu-aut-linz-1-raw-maps-working.geojson | Linz | Austria | 76 | 6 |
| maps/eu-pol-olsztyn/eu-pol-olsztyn/1-raw-maps/working/eu-pol-olsztyn-1-raw-maps-working.geojson | Olsztyn | Poland | 32 | 5 |
| maps/eu-ger-plauen/eu-ger-plauen/1-raw-maps/working/eu-ger-plauen-1-raw-maps-working.geojson | Plauen | Germany | 39 | 4 |
| maps/eu-rus-pyatigorsk/eu-rus-pyatigorsk/1-raw-maps/working/eu-rus-pyatigorsk-1-raw-maps-working.geojson | Pyatigorsk | Russia | 52 | 8 |
| maps/eu-fra-saint-etienne/eu-fra-saint-etienne/1-raw-maps/working/eu-fra-saint-etienne-1-raw-maps-working.geojson | Saint-Étienne | France | 39 | 3 |
| maps/eu-rus-tomsk/eu-rus-tomsk/1-raw-maps/working/eu-rus-tomsk-1-raw-maps-working.geojson | Tomsk | Russia | 38 | 5 |
| maps/eu-rus-ufa/eu-rus-ufa/1-raw-maps/working/eu-rus-ufa-1-raw-maps-working.geojson | Ufa | Russia | 70 | 7 |
| maps/eu-rus-yaroslavl/eu-rus-yaroslavl/1-raw-maps/working/eu-rus-yaroslavl-1-raw-maps-working.geojson | Yaroslavl | Russia | 32 | 4 |
| maps/eu-ukr-zaporizhia/eu-ukr-zaporizhia/1-raw-maps/working/eu-ukr-zaporizhia-1-raw-maps-working.geojson | Zaporizhia | Ukraine | 52 | 6 |
| maps/eu-gbr-sheffield/eu-gbr-sheffield/1-raw-maps/working/eu-gbr-sheffield-1-raw-maps-working.geojson | Sheffield | United Kingdom | 50 | 4 |
| maps/eu-rus-taganrog/eu-rus-taganrog/1-raw-maps/working/eu-rus-taganrog-1-raw-maps-working.geojson | Taganrog | Russia | 51 | 9 |
| maps/na-usa-phoenix/na-usa-phoenix/1-raw-maps/working/na-usa-phoenix-1-raw-maps-working.geojson | Phoenix | United States | 66 | 6 |
| maps/eu-esp-alicante/eu-esp-alicante/1-raw-maps/working/eu-esp-alicante-1-raw-maps-working.geojson | Alicante | Spain | 54 | 5 |
| maps/oc-nzl-auckland/oc-nzl-auckland/1-raw-maps/working/oc-nzl-auckland-1-raw-maps-working.geojson | Auckland | New Zealand | 39 | 4 |
| maps/eu-ger-brandenburg-havel/eu-ger-brandenburg-havel/1-raw-maps/working/eu-ger-brandenburg-havel-1-raw-maps-working.geojson | Brandenburg (Havel) | Germany | 34 | 2 |
| maps/eu-ger-cottbus/eu-ger-cottbus/1-raw-maps/working/eu-ger-cottbus-1-raw-maps-working.geojson | Cottbus | Germany | 48 | 4 |
| maps/eu-rus-smolensk/eu-rus-smolensk/1-raw-maps/working/eu-rus-smolensk-1-raw-maps-working.geojson | Smolensk | Russia | 34 | 4 |
| maps/na-usa-northern-new-jersey-newark/na-usa-northern-new-jersey-newark/1-raw-maps/working/na-usa-northern-new-jersey-newark-1-raw-maps-working.geojson | Northern New Jersey (Newark) | United States | 44 | 5 |
| maps/na-usa-san-jose/na-usa-san-jose/1-raw-maps/working/na-usa-san-jose-1-raw-maps-working.geojson | San Jose | United States | 59 | 4 |
| maps/eu-fra-angers/eu-fra-angers/1-raw-maps/working/eu-fra-angers-1-raw-maps-working.geojson | Angers | France | 42 | 3 |
| maps/eu-fra-caen/eu-fra-caen/1-raw-maps/working/eu-fra-caen-1-raw-maps-working.geojson | Caen | France | 37 | 3 |
| maps/eu-rus-dzerzhinsk/eu-rus-dzerzhinsk/1-raw-maps/working/eu-rus-dzerzhinsk-1-raw-maps-working.geojson | Dzerzhinsk* | Russia | 88 | 5 |
| maps/eu-rou-galati/eu-rou-galati/1-raw-maps/working/eu-rou-galati-1-raw-maps-working.geojson | Galati | Romania | 23 | 3 |
| maps/as-tur-gaziantep/as-tur-gaziantep/1-raw-maps/working/as-tur-gaziantep-1-raw-maps-working.geojson | Gaziantep | Turkey | 28 | 3 |
| maps/eu-ger-gotha/eu-ger-gotha/1-raw-maps/working/eu-ger-gotha-1-raw-maps-working.geojson | Gotha | Germany | 32 | 5 |
| maps/as-tur-kayseri/as-tur-kayseri/1-raw-maps/working/as-tur-kayseri-1-raw-maps-working.geojson | Kayseri | Turkey | 74 | 6 |
| maps/eu-rus-kursk/eu-rus-kursk/1-raw-maps/working/eu-rus-kursk-1-raw-maps-working.geojson | Kursk | Russia | 72 | 4 |
| maps/eu-ukr-mariupol/eu-ukr-mariupol/1-raw-maps/working/eu-ukr-mariupol-1-raw-maps-working.geojson | Mariupol | Ukraine | 51 | 5 |
| maps/na-usa-new-orleans/na-usa-new-orleans/1-raw-maps/working/na-usa-new-orleans-1-raw-maps-working.geojson | New Orleans | United States | 99 | 5 |
| maps/eu-rus-novokuznetsk/eu-rus-novokuznetsk/1-raw-maps/working/eu-rus-novokuznetsk-1-raw-maps-working.geojson | Novokuznetsk | Russia | 66 | 12 |
| maps/eu-ger-schwerin/eu-ger-schwerin/1-raw-maps/working/eu-ger-schwerin-1-raw-maps-working.geojson | Schwerin | Germany | 36 | 4 |
| maps/eu-ukr-vinnytsia/eu-ukr-vinnytsia/1-raw-maps/working/eu-ukr-vinnytsia-1-raw-maps-working.geojson | Vinnytsia | Ukraine | 38 | 6 |
| maps/eu-ger-essen/eu-ger-essen/1-raw-maps/working/eu-ger-essen-1-raw-maps-working.geojson | Essen | Germany | 43 | 3 |
| maps/na-can-edmonton/na-can-edmonton/1-raw-maps/working/na-can-edmonton-1-raw-maps-working.geojson | Edmonton | Canada | 38 | 5 |
| maps/eu-fra-mulhouse/eu-fra-mulhouse/1-raw-maps/working/eu-fra-mulhouse-1-raw-maps-working.geojson | Mulhouse | France | 37 | 4 |
| maps/eu-por-almada/eu-por-almada/1-raw-maps/working/eu-por-almada-1-raw-maps-working.geojson | Almada | Portugal | 19 | 3 |
| maps/eu-lat-daugavpils/eu-lat-daugavpils/1-raw-maps/working/eu-lat-daugavpils-1-raw-maps-working.geojson | Daugavpils | Latvia | 36 | 4 |
| maps/eu-pol-gorzow/eu-pol-gorzow/1-raw-maps/working/eu-pol-gorzow-1-raw-maps-working.geojson | Gorzow | Poland | 33 | 5 |
| maps/eu-ukr-horlivka/eu-ukr-horlivka/1-raw-maps/working/eu-ukr-horlivka-1-raw-maps-working.geojson | Horlivka | Ukraine | 39 | 3 |
| maps/eu-ger-krefeld/eu-ger-krefeld/1-raw-maps/working/eu-ger-krefeld-1-raw-maps-working.geojson | Krefeld | Germany | 57 | 3 |
| maps/as-jpn-matsuyama/as-jpn-matsuyama/1-raw-maps/working/as-jpn-matsuyama-1-raw-maps-working.geojson | Matsuyama | Japan | 27 | 5 |
| maps/eu-cze-most/eu-cze-most/1-raw-maps/working/eu-cze-most-1-raw-maps-working.geojson | Most | Czechia | 27 | 4 |
| maps/eu-rus-prokopyevsk/eu-rus-prokopyevsk/1-raw-maps/working/eu-rus-prokopyevsk-1-raw-maps-working.geojson | Prokopyevsk | Russia | 50 | 4 |
| maps/as-jpn-toyama/as-jpn-toyama/1-raw-maps/working/as-jpn-toyama-1-raw-maps-working.geojson | Toyama | Japan | 39 | 6 |
| maps/oc-nzl-wellington/oc-nzl-wellington/1-raw-maps/working/oc-nzl-wellington-1-raw-maps-working.geojson | Wellington | New Zealand | 48 | 5 |
| maps/eu-ukr-kryvyi-rih/eu-ukr-kryvyi-rih/1-raw-maps/working/eu-ukr-kryvyi-rih-1-raw-maps-working.geojson | Kryvyi Rih | Ukraine | 30 | 4 |
| maps/eu-den-aarhus/eu-den-aarhus/1-raw-maps/working/eu-den-aarhus-1-raw-maps-working.geojson | Aarhus | Denmark | 50 | 3 |
| maps/na-usa-pittsburgh/na-usa-pittsburgh/1-raw-maps/working/na-usa-pittsburgh-1-raw-maps-working.geojson | Pittsburgh | United States | 51 | 3 |
| maps/eu-rus-biysk/eu-rus-biysk/1-raw-maps/working/eu-rus-biysk-1-raw-maps-working.geojson | Biysk | Russia | 46 | 3 |
| maps/eu-rus-cherepovets/eu-rus-cherepovets/1-raw-maps/working/eu-rus-cherepovets-1-raw-maps-working.geojson | Cherepovets | Russia | 24 | 4 |
| maps/eu-ger-halberstadt/eu-ger-halberstadt/1-raw-maps/working/eu-ger-halberstadt-1-raw-maps-working.geojson | Halberstadt | Germany | 25 | 2 |
| maps/eu-ukr-kamianske/eu-ukr-kamianske/1-raw-maps/working/eu-ukr-kamianske-1-raw-maps-working.geojson | Kamianske | Ukraine | 61 | 4 |
| maps/eu-ukr-konotop/eu-ukr-konotop/1-raw-maps/working/eu-ukr-konotop-1-raw-maps-working.geojson | Konotop | Ukraine | 20 | 3 |
| maps/eu-fra-le-havre/eu-fra-le-havre/1-raw-maps/working/eu-fra-le-havre-1-raw-maps-working.geojson | Le Havre | France | 39 | 3 |
| maps/eu-cze-liberec/eu-cze-liberec/1-raw-maps/working/eu-cze-liberec-1-raw-maps-working.geojson | Liberec | Czechia | 39 | 4 |
| maps/na-usa-memphis/na-usa-memphis/1-raw-maps/working/na-usa-memphis-1-raw-maps-working.geojson | Memphis | United States | 26 | 3 |
| maps/eu-ger-nordhausen/eu-ger-nordhausen/1-raw-maps/working/eu-ger-nordhausen-1-raw-maps-working.geojson | Nordhausen | Germany | 31 | 3 |
| maps/eu-ita-palermo/eu-ita-palermo/1-raw-maps/working/eu-ita-palermo-1-raw-maps-working.geojson | Palermo | Italy | 43 | 4 |
| maps/na-usa-seattle/na-usa-seattle/1-raw-maps/working/na-usa-seattle-1-raw-maps-working.geojson | Seattle | United States | 55 | 4 |
| maps/af-eth-addis-ababa/af-eth-addis-ababa/1-raw-maps/working/af-eth-addis-ababa-1-raw-maps-working.geojson | Addis Ababa | Ethiopia | 39 | 2 |
| maps/eu-nor-bergen/eu-nor-bergen/1-raw-maps/working/eu-nor-bergen-1-raw-maps-working.geojson | Bergen | Norway | 33 | 2 |
| maps/sa-bol-cochabamba/sa-bol-cochabamba/1-raw-maps/working/sa-bol-cochabamba-1-raw-maps-working.geojson | Cochabamba | Bolivia | 36 | 4 |
| maps/eu-fin-tampere/eu-fin-tampere/1-raw-maps/working/eu-fin-tampere-1-raw-maps-working.geojson | Tampere | Finland | 33 | 2 |
| maps/as-tur-antalya/as-tur-antalya/1-raw-maps/working/as-tur-antalya-1-raw-maps-working.geojson | Antalya | Turkey | 68 | 4 |
| maps/eu-rou-cluj-napoca/eu-rou-cluj-napoca/1-raw-maps/working/eu-rou-cluj-napoca-1-raw-maps-working.geojson | Cluj-Napoca | Romania | 40 | 4 |
| maps/eu-pol-czestochowa/eu-pol-czestochowa/1-raw-maps/working/eu-pol-czestochowa-1-raw-maps-working.geojson | Czestochowa | Poland | 35 | 3 |
| maps/eu-fra-dijon/eu-fra-dijon/1-raw-maps/working/eu-fra-dijon-1-raw-maps-working.geojson | Dijon | France | 34 | 2 |
| maps/eu-ukr-druzhkivka/eu-ukr-druzhkivka/1-raw-maps/working/eu-ukr-druzhkivka-1-raw-maps-working.geojson | Druzhkivka | Ukraine | 22 | 3 |
| maps/eu-ger-duisburg/eu-ger-duisburg/1-raw-maps/working/eu-ger-duisburg-1-raw-maps-working.geojson | Duisburg | Germany | 88 | 2 |
| maps/eu-ita-firenze/eu-ita-firenze/1-raw-maps/working/eu-ita-firenze-1-raw-maps-working.geojson | Firenze | Italy | 40 | 2 |
| maps/eu-rus-kaliningrad/eu-rus-kaliningrad/1-raw-maps/working/eu-rus-kaliningrad-1-raw-maps-working.geojson | Kaliningrad | Russia | 31 | 2 |
| maps/eu-rus-khabarovsk/eu-rus-khabarovsk/1-raw-maps/working/eu-rus-khabarovsk-1-raw-maps-working.geojson | Khabarovsk | Russia | 53 | 3 |
| maps/eu-fra-le-mans/eu-fra-le-mans/1-raw-maps/working/eu-fra-le-mans-1-raw-maps-working.geojson | Le Mans | France | 35 | 2 |
| maps/eu-ger-mulheim-ruhr/eu-ger-mulheim-ruhr/1-raw-maps/working/eu-ger-mulheim-ruhr-1-raw-maps-working.geojson | Mülheim (Ruhr) | Germany | 57 | 3 |
| maps/eu-fra-nice/eu-fra-nice/1-raw-maps/working/eu-fra-nice-1-raw-maps-working.geojson | Nice | France | 45 | 3 |
| maps/eu-swe-norrkoping/eu-swe-norrkoping/1-raw-maps/working/eu-swe-norrkoping-1-raw-maps-working.geojson | Norrköping | Sweden | 43 | 2 |
| maps/eu-gbr-nottingham/eu-gbr-nottingham/1-raw-maps/working/eu-gbr-nottingham-1-raw-maps-working.geojson | Nottingham | United Kingdom | 46 | 2 |
| maps/eu-rus-oryol/eu-rus-oryol/1-raw-maps/working/eu-rus-oryol-1-raw-maps-working.geojson | Oryol | Russia | 39 | 3 |
| maps/af-mar-rabat/af-mar-rabat/1-raw-maps/working/af-mar-rabat-1-raw-maps-working.geojson | Rabat | Morocco | 42 | 2 |
| maps/eu-esp-tenerife/eu-esp-tenerife/1-raw-maps/working/eu-esp-tenerife-1-raw-maps-working.geojson | Tenerife | Spain | 25 | 2 |
| maps/eu-ger-ulm/eu-ger-ulm/1-raw-maps/working/eu-ger-ulm-1-raw-maps-working.geojson | Ulm | Germany | 39 | 2 |
| maps/as-kaz-ust-kamenogorsk/as-kaz-ust-kamenogorsk/1-raw-maps/working/as-kaz-ust-kamenogorsk-1-raw-maps-working.geojson | Ust'-Kamenogorsk | Kazakhstan | 29 | 3 |
| maps/eu-esp-vitoria-gasteiz/eu-esp-vitoria-gasteiz/1-raw-maps/working/eu-esp-vitoria-gasteiz-1-raw-maps-working.geojson | Vitoria-Gasteiz | Spain | 28 | 2 |
| maps/na-usa-st-louis/na-usa-st-louis/1-raw-maps/working/na-usa-st-louis-1-raw-maps-working.geojson | St. Louis | United States | 38 | 2 |
| maps/na-usa-houston/na-usa-houston/1-raw-maps/working/na-usa-houston-1-raw-maps-working.geojson | Houston | United States | 40 | 3 |
| maps/as-isr-tel-aviv/as-isr-tel-aviv/1-raw-maps/working/as-isr-tel-aviv-1-raw-maps-working.geojson | Tel Aviv | Israel | 34 | 3 |
| maps/eu-ned-utrecht/eu-ned-utrecht/1-raw-maps/working/eu-ned-utrecht-1-raw-maps-working.geojson | Utrecht | Netherlands | 32 | 3 |
| maps/eu-esp-malaga/eu-esp-malaga/1-raw-maps/working/eu-esp-malaga-1-raw-maps-working.geojson | Málaga | Spain | 19 | 2 |
| maps/sa-bra-santos/sa-bra-santos/1-raw-maps/working/sa-bra-santos-1-raw-maps-working.geojson | Santos | Brazil | 27 | 3 |
| maps/af-mar-casablanca/af-mar-casablanca/1-raw-maps/working/af-mar-casablanca-1-raw-maps-working.geojson | Casablanca | Morocco | 105 | 4 |
| maps/eu-rou-craiova/eu-rou-craiova/1-raw-maps/working/eu-rou-craiova-1-raw-maps-working.geojson | Craiova | Romania | 27 | 3 |
| maps/eu-esp-donostia/eu-esp-donostia/1-raw-maps/working/eu-esp-donostia-1-raw-maps-working.geojson | Donostia | Spain | 59 | 2 |
| maps/eu-ger-gera/eu-ger-gera/1-raw-maps/working/eu-ger-gera-1-raw-maps-working.geojson | Gera | Germany | 40 | 3 |
| maps/eu-ger-gorlitz/eu-ger-gorlitz/1-raw-maps/working/eu-ger-gorlitz-1-raw-maps-working.geojson | Görlitz | Germany | 24 | 2 |
| maps/na-usa-milwaukee/na-usa-milwaukee/1-raw-maps/working/na-usa-milwaukee-1-raw-maps-working.geojson | Milwaukee | United States | 13 | 2 |
| maps/eu-hun-miskolc/eu-hun-miskolc/1-raw-maps/working/eu-hun-miskolc-1-raw-maps-working.geojson | Miskolc | Hungary | 25 | 3 |
| maps/eu-rus-nizhnekamsk/eu-rus-nizhnekamsk/1-raw-maps/working/eu-rus-nizhnekamsk-1-raw-maps-working.geojson | Nizhnekamsk | Russia | 17 | 4 |
| maps/eu-cro-osijek/eu-cro-osijek/1-raw-maps/working/eu-cro-osijek-1-raw-maps-working.geojson | Osijek | Croatia | 38 | 2 |
| maps/eu-rus-usolye-sibirskoye/eu-rus-usolye-sibirskoye/1-raw-maps/working/eu-rus-usolye-sibirskoye-1-raw-maps-working.geojson | Usolye Sibirskoye | Russia | 24 | 4 |
| maps/eu-rus-zlatoust/eu-rus-zlatoust/1-raw-maps/working/eu-rus-zlatoust-1-raw-maps-working.geojson | Zlatoust | Russia | 43 | 3 |
| maps/eu-rus-saratov/eu-rus-saratov/1-raw-maps/working/eu-rus-saratov-1-raw-maps-working.geojson | Saratov | Russia | 40 | 2 |
| maps/eu-ukr-yevpatoria/eu-ukr-yevpatoria/1-raw-maps/working/eu-ukr-yevpatoria-1-raw-maps-working.geojson | Yevpatoria | Ukraine | 60 | 4 |
| maps/eu-ger-zwickau/eu-ger-zwickau/1-raw-maps/working/eu-ger-zwickau-1-raw-maps-working.geojson | Zwickau | Germany | 37 | 2 |
| maps/eu-esp-palma-de-mallorca/eu-esp-palma-de-mallorca/1-raw-maps/working/eu-esp-palma-de-mallorca-1-raw-maps-working.geojson | Palma de Mallorca | Spain | 17 | 2 |
| maps/na-usa-minneapolis-st-paul/na-usa-minneapolis-st-paul/1-raw-maps/working/na-usa-minneapolis-st-paul-1-raw-maps-working.geojson | Minneapolis/St. Paul | United States | 36 | 3 |
| maps/as-twn-kaohsiung/as-twn-kaohsiung-shape-rect/1-raw-maps/working/as-twn-kaohsiung-shape-rect-1-raw-maps-working.geojson | Kaohsiung | Taiwan | 72 | 3 |
| maps/na-can-ottawa/na-can-ottawa/1-raw-maps/working/na-can-ottawa-1-raw-maps-working.geojson | Ottawa | Canada | 25 | 3 |
| maps/as-chn-tianshui/as-chn-tianshui/1-raw-maps/working/as-chn-tianshui-1-raw-maps-working.geojson | Tianshui | China | 12 | 2 |
| maps/as-tur-izmit/as-tur-izmit/1-raw-maps/working/as-tur-izmit-1-raw-maps-working.geojson | Izmit | Turkey | 21 | 2 |
| maps/eu-rus-achinsk/eu-rus-achinsk/1-raw-maps/working/eu-rus-achinsk-1-raw-maps-working.geojson | Achinsk | Russia | 18 | 4 |
| maps/eu-fra-besancon/eu-fra-besancon/1-raw-maps/working/eu-fra-besancon-1-raw-maps-working.geojson | Besançon | France | 31 | 2 |
| maps/as-jpn-chiba/as-jpn-chiba/1-raw-maps/working/as-jpn-chiba-1-raw-maps-working.geojson | Chiba | Japan | 18 | 2 |
| maps/eu-hun-debrecen/eu-hun-debrecen/1-raw-maps/working/eu-hun-debrecen-1-raw-maps-working.geojson | Debrecen | Hungary | 23 | 2 |
| maps/eu-ger-dessau/eu-ger-dessau/1-raw-maps/working/eu-ger-dessau-1-raw-maps-working.geojson | Dessau | Germany | 27 | 2 |
| maps/as-chn-dujiangyan/as-chn-dujiangyan/1-raw-maps/working/as-chn-dujiangyan-1-raw-maps-working.geojson | Dujiangyan | China | 19 | 2 |
| maps/as-jpn-hakodate/as-jpn-hakodate/1-raw-maps/working/as-jpn-hakodate-1-raw-maps-working.geojson | Hakodate | Japan | 26 | 2 |
| maps/eu-ger-mannheim/eu-ger-mannheim/1-raw-maps/working/eu-ger-mannheim-1-raw-maps-working.geojson | Mannheim | Germany | 88 | 2 |
| maps/na-usa-jacksonville/na-usa-jacksonville/1-raw-maps/working/na-usa-jacksonville-1-raw-maps-working.geojson | Jacksonville | United States | 8 | 2 |
| maps/as-jpn-kagoshima/as-jpn-kagoshima/1-raw-maps/working/as-jpn-kagoshima-1-raw-maps-working.geojson | Kagoshima | Japan | 35 | 2 |
| maps/as-jpn-kumamoto/as-jpn-kumamoto/1-raw-maps/working/as-jpn-kumamoto-1-raw-maps-working.geojson | Kumamoto | Japan | 35 | 2 |
| maps/eu-rus-lipetsk/eu-rus-lipetsk/1-raw-maps/working/eu-rus-lipetsk-1-raw-maps-working.geojson | Lipetsk | Russia | 21 | 3 |
| maps/eu-sui-neuchatel/eu-sui-neuchatel/1-raw-maps/working/eu-sui-neuchatel-1-raw-maps-working.geojson | Neuchâtel | Switzerland | 8 | 3 |
| maps/eu-rus-osinniki/eu-rus-osinniki/1-raw-maps/working/eu-rus-osinniki-1-raw-maps-working.geojson | Osinniki | Russia | 18 | 4 |
| maps/eu-rus-orsk/eu-rus-orsk/1-raw-maps/working/eu-rus-orsk-1-raw-maps-working.geojson | Orsk | Russia | 18 | 2 |
| maps/as-jpn-okayama/as-jpn-okayama/1-raw-maps/working/as-jpn-okayama-1-raw-maps-working.geojson | Okayama | Japan | 16 | 2 |
| maps/na-usa-oklahoma-city/na-usa-oklahoma-city/1-raw-maps/working/na-usa-oklahoma-city-1-raw-maps-working.geojson | Oklahoma City | United States | 22 | 2 |
| maps/eu-rou-ploiesti/eu-rou-ploiesti/1-raw-maps/working/eu-rou-ploiesti-1-raw-maps-working.geojson | Ploiesti | Romania | 18 | 2 |
| maps/eu-fra-reims/eu-fra-reims/1-raw-maps/working/eu-fra-reims-1-raw-maps-working.geojson | Reims | France | 24 | 2 |
| maps/eu-fra-valenciennes/eu-fra-valenciennes/1-raw-maps/working/eu-fra-valenciennes-1-raw-maps-working.geojson | Valenciennes | France | 48 | 2 |
| maps/as-tur-samsun/as-tur-samsun/1-raw-maps/working/as-tur-samsun-1-raw-maps-working.geojson | Samsun | Turkey | 43 | 3 |
| maps/eu-rus-staryi-oskol/eu-rus-staryi-oskol/1-raw-maps/working/eu-rus-staryi-oskol-1-raw-maps-working.geojson | Staryi Oskol | Russia | 18 | 3 |
| maps/eu-gbr-birmingham/eu-gbr-birmingham/1-raw-maps/working/eu-gbr-birmingham-1-raw-maps-working.geojson | Birmingham | United Kingdom | 34 | 2 |
| maps/eu-ita-cagliari/eu-ita-cagliari/1-raw-maps/working/eu-ita-cagliari-1-raw-maps-working.geojson | Cagliari | Italy | 12 | 2 |
| maps/as-jpn-fukui/as-jpn-fukui/1-raw-maps/working/as-jpn-fukui-1-raw-maps-working.geojson | Fukui | Japan | 24 | 2 |
| maps/na-usa-detroit/na-usa-detroit/1-raw-maps/working/na-usa-detroit-1-raw-maps-working.geojson | Detroit | United States | 24 | 2 |
| maps/af-ngr-abuja/af-ngr-abuja/1-raw-maps/working/af-ngr-abuja-1-raw-maps-working.geojson | Abuja | Nigeria | 12 | 2 |
| maps/na-usa-charlotte/na-usa-charlotte/1-raw-maps/working/na-usa-charlotte-1-raw-maps-working.geojson | Charlotte | United States | 42 | 2 |
| maps/af-mri-port-louis/af-mri-port-louis/1-raw-maps/working/af-mri-port-louis-1-raw-maps-working.geojson | Port Louis | Mauritius | 21 | 2 |
| maps/eu-fra-brest/eu-fra-brest/1-raw-maps/working/eu-fra-brest-1-raw-maps-working.geojson | Brest | France | 39 | 2 |
| maps/eu-irl-dublin/eu-irl-dublin/1-raw-maps/working/eu-irl-dublin-1-raw-maps-working.geojson | Dublin | Ireland | 60 | 2 |
| maps/eu-gbr-edinburgh/eu-gbr-edinburgh/1-raw-maps/working/eu-gbr-edinburgh-1-raw-maps-working.geojson | Edinburgh | United Kingdom | 22 | 2 |
| maps/eu-ukr-yenakiieve/eu-ukr-yenakiieve/1-raw-maps/working/eu-ukr-yenakiieve-1-raw-maps-working.geojson | Yenakiieve | Ukraine | 3 | 2 |
| maps/na-usa-little-rock/na-usa-little-rock/1-raw-maps/working/na-usa-little-rock-1-raw-maps-working.geojson | Little Rock | United States | 10 | 2 |
| maps/af-alg-mostaganem/af-alg-mostaganem/1-raw-maps/working/af-alg-mostaganem-1-raw-maps-working.geojson | Mostaganem | Algeria | 23 | 2 |
| maps/eu-esp-murcia/eu-esp-murcia/1-raw-maps/working/eu-esp-murcia-1-raw-maps-working.geojson | Murcia | Spain | 28 | 2 |
| maps/eu-fra-orleans/eu-fra-orleans/1-raw-maps/working/eu-fra-orleans-1-raw-maps-working.geojson | Orléans | France | 51 | 2 |
| maps/eu-ita-venezia-mestre/eu-ita-venezia-mestre/1-raw-maps/working/eu-ita-venezia-mestre-1-raw-maps-working.geojson | Venezia-Mestre | Italy | 35 | 2 |
| maps/as-kaz-pavlodar/as-kaz-pavlodar/1-raw-maps/working/as-kaz-pavlodar-1-raw-maps-working.geojson | Pavlodar | Kazakhstan | 38 | 2 |
| maps/eu-rus-salavat/eu-rus-salavat/1-raw-maps/working/eu-rus-salavat-1-raw-maps-working.geojson | Salavat | Russia | 20 | 2 |
| maps/as-uzb-samarkand/as-uzb-samarkand/1-raw-maps/working/as-uzb-samarkand-1-raw-maps-working.geojson | Samarkand | Uzbekistan | 21 | 2 |
| maps/eu-esp-seville/eu-esp-seville/1-raw-maps/working/eu-esp-seville-1-raw-maps-working.geojson | Seville | Spain | 20 | 1 |
| maps/eu-ita-sassari/eu-ita-sassari/1-raw-maps/working/eu-ita-sassari-1-raw-maps-working.geojson | Sassari | Italy | 8 | 1 |
| maps/as-isr-jerusalem/as-isr-jerusalem/1-raw-maps/working/as-isr-jerusalem-1-raw-maps-working.geojson | Jerusalem | Israel | 35 | 1 |
| maps/as-jpn-enoshima-shonan/as-jpn-enoshima-shonan/1-raw-maps/working/as-jpn-enoshima-shonan-1-raw-maps-working.geojson | Enoshima (Shonan) | Japan | 15 | 1 |
| maps/sa-arg-mendoza/sa-arg-mendoza/1-raw-maps/working/sa-arg-mendoza-1-raw-maps-working.geojson | Mendoza | Argentina | 25 | 1 |
| maps/na-usa-buffalo/na-usa-buffalo/1-raw-maps/working/na-usa-buffalo-1-raw-maps-working.geojson | Buffalo | United States | 14 | 1 |
| maps/as-ind-gurugram/as-ind-gurugram/1-raw-maps/working/as-ind-gurugram-1-raw-maps-working.geojson | Gurugram | India | 11 | 1 |
| maps/eu-ger-saarbrucken/eu-ger-saarbrucken/1-raw-maps/working/eu-ger-saarbrucken-1-raw-maps-working.geojson | Saarbrücken | Germany | 43 | 2 |
| maps/oc-aus-gold-coast/oc-aus-gold-coast/1-raw-maps/working/oc-aus-gold-coast-1-raw-maps-working.geojson | Gold Coast | Australia | 19 | 1 |
| maps/eu-esp-granada/eu-esp-granada/1-raw-maps/working/eu-esp-granada-1-raw-maps-working.geojson | Granada | Spain | 26 | 1 |
| maps/na-can-waterloo/na-can-waterloo/1-raw-maps/working/na-can-waterloo-1-raw-maps-working.geojson | Waterloo | Canada | 19 | 1 |
| maps/na-usa-norfolk/na-usa-norfolk/1-raw-maps/working/na-usa-norfolk-1-raw-maps-working.geojson | Norfolk | United States | 11 | 1 |
| maps/eu-esp-cadiz/eu-esp-cadiz/1-raw-maps/working/eu-esp-cadiz-1-raw-maps-working.geojson | Cádiz | Spain | 21 | 1 |
| maps/as-kor-uijeongbu/as-kor-uijeongbu/1-raw-maps/working/as-kor-uijeongbu-1-raw-maps-working.geojson | Uijeongbu | South Korea | 15 | 1 |
| maps/as-chn-sanya/as-chn-sanya/1-raw-maps/working/as-chn-sanya-1-raw-maps-working.geojson | Sanya | China | 15 | 1 |
| maps/oc-aus-newcastle/oc-aus-newcastle/1-raw-maps/working/oc-aus-newcastle-1-raw-maps-working.geojson | Newcastle | Australia | 6 | 1 |
| maps/oc-aus-canberra/oc-aus-canberra/1-raw-maps/working/oc-aus-canberra-1-raw-maps-working.geojson | Canberra | Australia | 14 | 1 |
| maps/as-jpn-kitakyushu/as-jpn-kitakyushu/1-raw-maps/working/as-jpn-kitakyushu-1-raw-maps-working.geojson | Kitakyushu | Japan | 21 | 1 |
| maps/as-jpn-utsunomiya/as-jpn-utsunomiya/1-raw-maps/working/as-jpn-utsunomiya-1-raw-maps-working.geojson | Utsunomiya | Japan | 19 | 1 |
| maps/as-chn-huai-an/as-chn-huai-an/1-raw-maps/working/as-chn-huai-an-1-raw-maps-working.geojson | Huai'an | China | 23 | 1 |
| maps/eu-fra-aubagne/eu-fra-aubagne/1-raw-maps/working/eu-fra-aubagne-1-raw-maps-working.geojson | Aubagne | France | 7 | 1 |
| maps/eu-fra-avignon/eu-fra-avignon/1-raw-maps/working/eu-fra-avignon-1-raw-maps-working.geojson | Avignon | France | 10 | 1 |
| maps/eu-ita-bergamo/eu-ita-bergamo/1-raw-maps/working/eu-ita-bergamo-1-raw-maps-working.geojson | Bergamo | Italy | 16 | 1 |
| maps/eu-gbr-blackpool/eu-gbr-blackpool/1-raw-maps/working/eu-gbr-blackpool-1-raw-maps-working.geojson | Blackpool | United Kingdom | 40 | 1 |
| maps/as-prk-chongjin/as-prk-chongjin/1-raw-maps/working/as-prk-chongjin-1-raw-maps-working.geojson | Chongjin | North Korea | 4 | 1 |
| maps/na-usa-cincinnati/na-usa-cincinnati/1-raw-maps/working/na-usa-cincinnati-1-raw-maps-working.geojson | Cincinnati | United States | 18 | 1 |
| maps/eu-fra-clermont-ferrand/eu-fra-clermont-ferrand/1-raw-maps/working/eu-fra-clermont-ferrand-1-raw-maps-working.geojson | Clermont-Ferrand | France | 34 | 1 |
| maps/af-alg-constantine/af-alg-constantine/1-raw-maps/working/af-alg-constantine-1-raw-maps-working.geojson | Constantine | Algeria | 21 | 1 |
| maps/sa-ecu-cuenca/sa-ecu-cuenca/1-raw-maps/working/sa-ecu-cuenca-1-raw-maps-working.geojson | Cuenca | Ecuador | 20 | 1 |
| maps/af-sen-dakar/af-sen-dakar/1-raw-maps/working/af-sen-dakar-1-raw-maps-working.geojson | Dakar | Senegal | 13 | 1 |
| maps/eu-ger-wuppertal/eu-ger-wuppertal/1-raw-maps/working/eu-ger-wuppertal-1-raw-maps-working.geojson | Wuppertal | Germany | 38 | 1 |
| maps/na-usa-el-paso/na-usa-el-paso/1-raw-maps/working/na-usa-el-paso-1-raw-maps-working.geojson | El Paso | United States | 27 | 1 |
| maps/eu-aut-gmunden/eu-aut-gmunden/1-raw-maps/working/eu-aut-gmunden-1-raw-maps-working.geojson | Gmunden | Austria | 13 | 1 |
| maps/eu-pol-grudziadz/eu-pol-grudziadz/1-raw-maps/working/eu-pol-grudziadz-1-raw-maps-working.geojson | Grudziadz | Poland | 18 | 1 |
| maps/as-isr-haifa/as-isr-haifa/1-raw-maps/working/as-isr-haifa-1-raw-maps-working.geojson | Haifa | Israel | 6 | 1 |
| maps/as-chn-huangshi/as-chn-huangshi/1-raw-maps/working/as-chn-huangshi-1-raw-maps-working.geojson | Huangshi | China | 31 | 1 |
| maps/as-chn-jiaxing/as-chn-jiaxing/1-raw-maps/working/as-chn-jiaxing-1-raw-maps-working.geojson | Jiaxing | China | 11 | 1 |
| maps/na-usa-kansas-city/na-usa-kansas-city/1-raw-maps/working/na-usa-kansas-city-1-raw-maps-working.geojson | Kansas City | United States | 18 | 1 |
| maps/eu-rus-krasnoturyinsk/eu-rus-krasnoturyinsk/1-raw-maps/working/eu-rus-krasnoturyinsk-1-raw-maps-working.geojson | Krasnoturyinsk | Russia | 10 | 1 |
| maps/eu-bel-kusttram/eu-bel-kusttram/1-raw-maps/working/eu-bel-kusttram-1-raw-maps-working.geojson | Kusttram | Belgium | 38 | 1 |
| maps/na-usa-las-vegas/na-usa-las-vegas/1-raw-maps/working/na-usa-las-vegas-1-raw-maps-working.geojson | Las Vegas | United States | 7 | 1 |
| maps/eu-bel-liege/eu-bel-liege/1-raw-maps/working/eu-bel-liege-1-raw-maps-working.geojson | Liège | Belgium | 23 | 1 |
| maps/eu-lat-liepaja/eu-lat-liepaja/1-raw-maps/working/eu-lat-liepaja-1-raw-maps-working.geojson | Liepaja | Latvia | 18 | 1 |
| maps/eu-swe-lund/eu-swe-lund/1-raw-maps/working/eu-swe-lund-1-raw-maps-working.geojson | Lund | Sweden | 9 | 1 |
| maps/eu-lux-luxembourg/eu-lux-luxembourg/1-raw-maps/working/eu-lux-luxembourg-1-raw-maps-working.geojson | Luxembourg | Luxembourg | 24 | 1 |
| maps/as-chn-mengzi/as-chn-mengzi/1-raw-maps/working/as-chn-mengzi-1-raw-maps-working.geojson | Mengzi | China | 15 | 1 |
| maps/eu-ita-messina/eu-ita-messina/1-raw-maps/working/eu-ita-messina-1-raw-maps-working.geojson | Messina | Italy | 18 | 1 |
| maps/na-usa-morgantown/na-usa-morgantown/1-raw-maps/working/na-usa-morgantown-1-raw-maps-working.geojson | Morgantown | United States | 5 | 1 |
| maps/eu-blr-mozyr/eu-blr-mozyr/1-raw-maps/working/eu-blr-mozyr-1-raw-maps-working.geojson | Mozyr | Belarus | 20 | 2 |
| maps/as-jpn-naha/as-jpn-naha/1-raw-maps/working/as-jpn-naha-1-raw-maps-working.geojson | Naha | Japan | 19 | 1 |
| maps/eu-ger-naumburg/eu-ger-naumburg/1-raw-maps/working/eu-ger-naumburg-1-raw-maps-working.geojson | Naumburg | Germany | 9 | 1 |
| maps/eu-rus-novocherkassk/eu-rus-novocherkassk/1-raw-maps/working/eu-rus-novocherkassk-1-raw-maps-working.geojson | Novocherkassk | Russia | 10 | 1 |
| maps/eu-blr-novopolotsk/eu-blr-novopolotsk/1-raw-maps/working/eu-blr-novopolotsk-1-raw-maps-working.geojson | Novopolotsk | Belarus | 13 | 1 |
| maps/eu-den-odense/eu-den-odense/1-raw-maps/working/eu-den-odense-1-raw-maps-working.geojson | Odense | Denmark | 24 | 1 |
| maps/af-alg-oran/af-alg-oran/1-raw-maps/working/af-alg-oran-1-raw-maps-working.geojson | Oran | Algeria | 32 | 1 |
| maps/af-alg-ouargla/af-alg-ouargla/1-raw-maps/working/af-alg-ouargla-1-raw-maps-working.geojson | Ouargla | Algeria | 16 | 1 |
| maps/eu-ita-padova/eu-ita-padova/1-raw-maps/working/eu-ita-padova-1-raw-maps-working.geojson | Padova | Italy | 16 | 1 |
| maps/eu-esp-parla/eu-esp-parla/1-raw-maps/working/eu-esp-parla-1-raw-maps-working.geojson | Parla | Spain | 15 | 1 |
| maps/eu-ita-perugia/eu-ita-perugia/1-raw-maps/working/eu-ita-perugia-1-raw-maps-working.geojson | Perugia | Italy | 7 | 1 |
| maps/as-chn-qiubei/as-chn-qiubei/1-raw-maps/working/as-chn-qiubei-1-raw-maps-working.geojson | Qiubei | China | 4 | 1 |
| maps/af-alg-sidi-bel-abbes/af-alg-sidi-bel-abbes/1-raw-maps/working/af-alg-sidi-bel-abbes-1-raw-maps-working.geojson | Sidi Bel Abbès | Algeria | 22 | 2 |
| maps/eu-esp-soller/eu-esp-soller/1-raw-maps/working/eu-esp-soller-1-raw-maps-working.geojson | Sóller | Spain | 16 | 1 |
| maps/as-jpn-takaoka/as-jpn-takaoka/1-raw-maps/working/as-jpn-takaoka-1-raw-maps-working.geojson | Takaoka | Japan | 25 | 1 |
| maps/eu-rus-volchansk/eu-rus-volchansk/1-raw-maps/working/eu-rus-volchansk-1-raw-maps-working.geojson | Volchansk | Russia | 9 | 2 |
| maps/eu-rou-resita/eu-rou-resita/1-raw-maps/working/eu-rou-resita-1-raw-maps-working.geojson | Resita | Romania | 16 | 1 |
| maps/eu-fra-rouen/eu-fra-rouen/1-raw-maps/working/eu-fra-rouen-1-raw-maps-working.geojson | Rouen | France | 31 | 1 |
| maps/af-alg-setif/af-alg-setif/1-raw-maps/working/af-alg-setif-1-raw-maps-working.geojson | Sétif | Algeria | 22 | 1 |
| maps/eu-por-sintra/eu-por-sintra/1-raw-maps/working/eu-por-sintra-1-raw-maps-working.geojson | Sintra | Portugal | 8 | 1 |
| maps/eu-ger-strausberg/eu-ger-strausberg/1-raw-maps/working/eu-ger-strausberg-1-raw-maps-working.geojson | Strausberg | Germany | 10 | 1 |
| maps/na-usa-tacoma/na-usa-tacoma/1-raw-maps/working/na-usa-tacoma-1-raw-maps-working.geojson | Tacoma | United States | 12 | 1 |
| maps/as-jpn-tama/as-jpn-tama/1-raw-maps/working/as-jpn-tama-1-raw-maps-working.geojson | Tama | Japan | 19 | 1 |
| maps/na-usa-tampa/na-usa-tampa/1-raw-maps/working/na-usa-tampa-1-raw-maps-working.geojson | Tampa | United States | 11 | 1 |
| maps/as-kaz-temirtau/as-kaz-temirtau/1-raw-maps/working/as-kaz-temirtau-1-raw-maps-working.geojson | Temirtau | Kazakhstan | 17 | 1 |
| maps/eu-fra-tours/eu-fra-tours/1-raw-maps/working/eu-fra-tours-1-raw-maps-working.geojson | Tours | France | 29 | 1 |
| maps/as-jpn-toyohashi/as-jpn-toyohashi/1-raw-maps/working/as-jpn-toyohashi-1-raw-maps-working.geojson | Toyohashi | Japan | 13 | 1 |
| maps/eu-ita-trieste/eu-ita-trieste/1-raw-maps/working/eu-ita-trieste-1-raw-maps-working.geojson | Trieste | Italy | 12 | 1 |
| maps/eu-nor-trondheim/eu-nor-trondheim/1-raw-maps/working/eu-nor-trondheim-1-raw-maps-working.geojson | Trondheim | Norway | 19 | 1 |
| maps/na-usa-tucson/na-usa-tucson/1-raw-maps/working/na-usa-tucson-1-raw-maps-working.geojson | Tucson | United States | 18 | 1 |
| maps/sa-chi-valparaiso/sa-chi-valparaiso/1-raw-maps/working/sa-chi-valparaiso-1-raw-maps-working.geojson | Valparaíso | Chile | 21 | 1 |
| maps/eu-rus-vladivostok/eu-rus-vladivostok/1-raw-maps/working/eu-rus-vladivostok-1-raw-maps-working.geojson | Vladivostok | Russia | 16 | 1 |
| maps/eu-esp-zaragoza/eu-esp-zaragoza/1-raw-maps/working/eu-esp-zaragoza-1-raw-maps-working.geojson | Zaragoza | Spain | 25 | 1 |
| maps/eu-ukr-zhytomyr/eu-ukr-zhytomyr/1-raw-maps/working/eu-ukr-zhytomyr-1-raw-maps-working.geojson | Zhytomyr | Ukraine | 19 | 1 |
| maps/as-chn-shanghai/as-chn-shanghai-lm/1-raw-maps/working/as-chn-shanghai-lm-1-raw-maps-working.geojson | Shanghai + Landmark | China | 407 | 21 |
| maps/as-jpn-osaka/as-jpn-osaka-jr/1-raw-maps/working/as-jpn-osaka-jr-1-raw-maps-working.geojson | Osaka + Loop | Japan | 132 | 11 |
| maps/as-jpn-osaka/as-jpn-osaka-jr-shape-rect/1-raw-maps/working/as-jpn-osaka-jr-shape-rect-1-raw-maps-working.geojson | Osaka + Loop | Japan | 132 | 11 |
| maps/as-jpn-tokyo/as-jpn-tokyo-rail/1-raw-maps/working/as-jpn-tokyo-rail-1-raw-maps-working.geojson | Tokyo + JR + Private | Japan | 581 | 58 |
| maps/as-jpn-tokyo/as-jpn-tokyo-lm/1-raw-maps/working/as-jpn-tokyo-lm-1-raw-maps-working.geojson | Tokyo + Landmark | Japan | 202 | 14 |
| maps/as-jpn-tokyo/as-jpn-tokyo-jr/1-raw-maps/working/as-jpn-tokyo-jr-1-raw-maps-working.geojson | Tokyo + Yamanote | Japan | 214 | 15 |
| maps/as-jpn-tokyo/as-jpn-tokyo-jr-shape-rect/1-raw-maps/working/as-jpn-tokyo-jr-shape-rect-1-raw-maps-working.geojson | Tokyo + Yamanote | Japan | 214 | 15 |
| maps/as-sgp-singapore/as-sgp-singapore-lrt/1-raw-maps/working/as-sgp-singapore-lrt-1-raw-maps-working.geojson | Singapore + LRT | Singapore | 187 | 14 |
| maps/as-kor-seoul/as-kor-seoul-incheon/1-raw-maps/working/as-kor-seoul-incheon-1-raw-maps-working.geojson | Seoul + Incheon | South Korea | 487 | 26 |
| maps/as-kor-seoul/as-kor-seoul-lm/1-raw-maps/working/as-kor-seoul-lm-1-raw-maps-working.geojson | Seoul + Landmark | South Korea | 426 | 23 |
| maps/as-twn-kaohsiung/as-twn-kaohsiung-rail/1-raw-maps/working/as-twn-kaohsiung-rail-1-raw-maps-working.geojson | Kaohsiung + Rail | Taiwan | 78 | 5 |
| maps/as-twn-taichung/as-twn-taichung-rail/1-raw-maps/working/as-twn-taichung-rail-1-raw-maps-working.geojson | Taichung + Rail | Taiwan | 24 | 2 |
| maps/as-twn-taipei/as-twn-taipei-lm/1-raw-maps/working/as-twn-taipei-lm-1-raw-maps-working.geojson | Taipei + Landmark | Taiwan | 176 | 15 |
| maps/as-twn-taipei/as-twn-taipei-ty/1-raw-maps/working/as-twn-taipei-ty-1-raw-maps-working.geojson | Taipei + Taoyuan | Taiwan | 197 | 17 |
| maps/as-twn-taipei/as-twn-taipei-ty-lm/1-raw-maps/working/as-twn-taipei-ty-lm-1-raw-maps-working.geojson | Taipei + Taoyuan + Landmark | Taiwan | 197 | 17 |
| maps/as-twn-taipei/as-twn-taipei-rail/1-raw-maps/working/as-twn-taipei-rail-1-raw-maps-working.geojson | Taipei + Taoyuan + Rail | Taiwan | 205 | 19 |
| maps/eu-aut-vienna/eu-aut-vienna-lm/1-raw-maps/working/eu-aut-vienna-lm-1-raw-maps-working.geojson | Vienna + Landmark | Austria | 99 | 5 |
| maps/eu-fra-paris/eu-fra-paris-lm/1-raw-maps/working/eu-fra-paris-lm-1-raw-maps-working.geojson | Paris + Landmark | France | 321 | 20 |
| maps/eu-ger-berlin/eu-ger-berlin-lm/1-raw-maps/working/eu-ger-berlin-lm-1-raw-maps-working.geojson | Berlin + Landmark | Germany | 300 | 26 |
| maps/eu-gbr-london/eu-gbr-london-lm/1-raw-maps/working/eu-gbr-london-lm-1-raw-maps-working.geojson | London + Landmark | United Kingdom | 262 | 26 |
| maps/na-usa-new-york-city/na-usa-new-york-city-lm/1-raw-maps/working/na-usa-new-york-city-lm-1-raw-maps-working.geojson | New York City + Landmark | United States | 444 | 11 |
| maps/na-usa-san-francisco/na-usa-san-francisco-lrt/1-raw-maps/working/na-usa-san-francisco-lrt-1-raw-maps-working.geojson | San Francisco LRT | United States | 117 | 7 |
| maps/na-usa-san-francisco/na-usa-san-francisco/1-raw-maps/working/na-usa-san-francisco-1-raw-maps-working.geojson | San Francisco | United States | 161 | 12 |
| maps/na-usa-new-york-city/na-usa-new-york-city-l30/1-raw-maps/working/na-usa-new-york-city-l30-1-raw-maps-working.geojson | New York City (rot 30° CCW) | United States | 443 | 11 |
| maps/na-usa-new-york-city/na-usa-new-york-city-lm-l30/1-raw-maps/working/na-usa-new-york-city-lm-l30-1-raw-maps-working.geojson | New York City + Landmark (rot 30° CCW) | United States | 444 | 11 |
