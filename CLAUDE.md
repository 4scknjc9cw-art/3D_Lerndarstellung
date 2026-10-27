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
  Abnahme durch Kurt (Lesezeichen auf PC **und** Laptop) steht aus.
- Nächster Schritt: **Schritt 1 — Physik-Kern**. Auf Zuruf, nicht von selbst anfangen.

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

## Was sich nicht von selbst testen lässt

Flüssigkeit der Animation und Kamerafahrten, Lesbarkeit der Texte — braucht Kurts Blick.

## Fallen in diesem Projekt

- Darstellung ist nicht maßstabsgetreu (Licht-Wellenlänge viel zu klein); gerechnet wird mit
  echten Werten. Die beiden Maßstäbe nie vermischen.
