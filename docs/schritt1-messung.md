# Schritt 1 — Messung: Lage der Maxima

27.10.2026. Aufbau: λ = 500 nm, d = 0,1 mm, L = 1 m, 16 Huygens-Punktquellen je Spalt.
Gemessen wurde die Lage des Maximums m auf dem Schirm, gesucht in 20 000 Schritten über
± ½ Streifenabstand (Streifenabstand Δx = 5 mm).

| b | m | Schulformel d·sin θ = mλ | Huygens-Rechnung | Lehrbuch cos²·sinc² | Huygens − Schulformel | Huygens − Lehrbuch |
|---|---|---|---|---|---|---|
| 0,02 mm (= d/5) | 1 | 5,0001 mm | 4,9328 mm | 4,9326 mm | −1,34 % Δx | 0,005 % Δx |
| 0,02 mm | 2 | 10,0005 mm | 9,8543 mm | 9,8538 mm | −2,93 % Δx | 0,010 % Δx |
| 0,02 mm | 3 | 15,0017 mm | 14,7409 mm | 14,7402 mm | −5,21 % Δx | 0,015 % Δx |
| 0,005 mm (= d/20) | 1 | 5,0001 mm | 4,9958 mm | 4,9958 mm | −0,08 % Δx | 0,000 % Δx |
| 0,005 mm | 2 | 10,0005 mm | 9,9923 mm | 9,9920 mm | −0,16 % Δx | 0,005 % Δx |
| 0,005 mm | 3 | 15,0017 mm | 14,9889 mm | 14,9889 mm | −0,25 % Δx | 0,000 % Δx |

**Ergebnis:** Die Huygens-Rechnung stimmt mit der vollständigen Lehrbuchformel auf ≤ 0,015 %
des Streifenabstands überein — die Physik ist richtig. Die Schulformel `d·sin θ = mλ` ist nur
für schmale Spalte genau: bei b = d/5 rücken die Maxima durch die abfallende
Einzelspalt-Hülle echt nach innen (bis 5 % beim 3. Maximum). Das ist kein Rechenfehler,
sondern Physik.

Die Minima `d·sin θ = (m+½)λ` dagegen liegen exakt (Helligkeit < 10⁻⁴), weil dort der
cos²-Faktor null ist, egal wie die Hülle aussieht.
