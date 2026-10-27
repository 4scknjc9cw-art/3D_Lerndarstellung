# 3D-Lerndarstellung — Arbeitsanweisung für Claude

Web-App, die Physik-Experimente als animiertes 3D-Modell mit gekoppeltem Erklärtext zeigt;
läuft im Browser unter fester Adresse, gebaut mit Vite + TypeScript + Three.js. Erstes
Experiment: Doppelspalt.
**Die Quelle der Wahrheit ist docs/PLAN.md.** Vor jeder größeren Arbeit dort nachlesen und
dort nachtragen. Der Plan ist ein lebendes Dokument.

## Stand

- 27.10.2026: Plan geschrieben, Entscheidungen mit Kurt geklärt (siehe Plan, „Entscheidungen").
- 27.10.2026: Schritt 0 gebaut — Gerüst + drehender Würfel, öffentliches Repo
  `4scknjc9cw-art/3D_Lerndarstellung`, GitHub Pages: https://4scknjc9cw-art.github.io/3D_Lerndarstellung/
  PC von Kurt abgenommen (27.10.2026), Laptop steht aus.
- 27.10.2026: Schritt 1 Physik-Kern ✅ — 9 Tests grün, ≤ 0,015 % gegen cos²·sinc²
  ([Messung](docs/schritt1-messung.md)).
- 27.10.2026: Schritt 2 Szene + Wellenfeld ✅, von Kurt abgenommen. PC 144 Bilder/s,
  Laptop ungemessen (`?fps`).
- 27.10.2026: Schritt 3 Regler + gekoppelter Text ✅, von Kurt abgenommen.
- 27.10.2026: Schritt 4 Tour-Maschine ✅ (2 Probe-Schritte), 77 Tests grün. Freier Modus ist
  als Umschalter schon mit drin.
- 27.10.2026: Tour-Schritte 1–2 mit „warum" neu geschrieben, Schritt 5 (Draufsicht,
  Klick, Gangunterschied-Dreieck) ✅ als Tour-Schritt 3. 84 Tests grün.
- 27.10.2026: Schritt 6 Tour-Inhalt ✅ gebaut: 9 Schritte / 27 Teile mit Kamerafahrt je Teil,
  136 Tests grün. **Abnahme durch Kurt offen.**
- Nächster Schritt: Kurts Rückmeldung zur Tour einarbeiten, dann **Schritt 7** (Startseite,
  Feinschliff). Auf Zuruf, nicht von selbst anfangen.

Kurts Regel für Tour-Texte: jeder Schritt erklärt **warum**, folgt dem Weg des Lichts, Formeln
erst nach der Herleitung im Bild. Braucht ein Teil der Erklärung eine andere Ansicht, bekommt
er einen eigenen Tour-Teil mit eigener Kamera. Behauptet ein Text etwas über einen
vorgewählten Punkt, gehört ein Test dazu (`tour.test.ts`).

Nicht neu diskutieren: kein Vorhersage-Modus, kein KI-Fragefeld, nur PC/Laptop, kein Server,
echte Physik statt Animation, GitHub Pages mit öffentlichem Repo, 2D-Draufsicht nur in
Schritten, wo sie hilft — sonst 3D.

## Zusammenarbeit

Erst das Vorgehen vorschlagen, dann bauen. Kritische Rückmeldung erwünscht.
Kurt hat kein Informatik-Fachwissen — Fachbegriffe beim ersten Auftreten erklären, deutsche
Wörter statt englischer, wo es sie gibt. Physik auf Schulniveau (Oberstufe) erklären.
Messen statt vermuten. Committen und pushen nur auf Zuruf. Am Sitzungsende /uebergabe.

## Starten und Prüfen

```
npm run dev      # lokale Vorschau mit sofortigem Neuladen (nur zum Entwickeln)
npm run build    # Typprüfung + Bau nach dist/ — muss vor jedem Commit durchlaufen
npm test         # Physik-Tests gegen Lehrbuchformeln
gh run list --limit 1   # ist die letzte Veröffentlichung grün?
```
Veröffentlicht wird automatisch bei jedem Push auf `main` (`.github/workflows/pages.yml`).
Kurt startet nie etwas, er nutzt nur das Lesezeichen.

## Konventionen im Code

Deutsche Namen für Fachliches (`spaltabstand`, `wellenlaenge`), Kommentare erklären das Warum.
Physik in reinen Funktionen ohne Grafik, damit sie testbar ist.
Farben: sehr dunkles, angenehmes Schwarz (`--hintergrund` #131315) + Orange (`--akzent`) für
Bedienung/Hervorhebung, als CSS-Variablen in `index.html`. Licht behält seine physikalische
Farbe aus `farbe.ts`.

## Was sich nicht von selbst testen lässt

Flüssigkeit der Animation und Kamerafahrten, Lesbarkeit der Texte — braucht Kurts Blick.

## Fallen in diesem Projekt

- Darstellung ist nicht maßstabsgetreu (Licht-Wellenlänge viel zu klein); gerechnet wird mit
  echten Werten. Die beiden Maßstäbe nie vermischen.
- `d·sin θ = mλ` ist nur für schmale Spalte genau — nicht als Prüfmaßstab für breite Spalte
  nehmen, dort gilt cos²·sinc² (Maxima rücken echt nach innen).
- Shader rechnen mit 32-Bit-Zahlen: echte Lichtwerte (k·r ≈ 10⁷) gehen dort nicht.
- Die Shader-Formel in `wellenfeld.ts` ist eine Kopie von `feldVonSpalt`/`auslenkung` in
  `physik.ts` — wer die eine ändert, muss die andere mitziehen.
- Bildschirmfoto zum Selbstprüfen: `npx vite preview --port 4173`, dann Chrome
  `--headless=new --enable-unsafe-swiftshader --use-angle=swiftshader --screenshot=…`.
  Bildrate dort ist bedeutungslos (keine Grafikkarte). Prüfhilfen in der Adresse:
  `?kamera=x,y,z,zielX,zielY,zielZ`, `?werte=d:0.0002,lambda:6.5e-7` (SI), `?fps`,
  `?schritt=5&teil=3`, `?frei`, `?draufsicht`, `?klick=x,z` (x = 99 = Schirm).
- Neue Reglerbereiche immer gegen `index.test.ts` (alle Reglerecken) laufen lassen — dort ist
  schon einmal ein ineinanderlaufender Spalt aufgefallen.
