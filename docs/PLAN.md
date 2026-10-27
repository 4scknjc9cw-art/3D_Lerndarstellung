# 3D-Lerndarstellung — Plan (Phase 1 im Detail)

Stand 27.10.2026. Lebendes Dokument: widerlegte Annahmen werden mit Datum korrigiert, nicht
gelöscht.

## Context

**Zielbild:** Eine Web-App, in der man physikalische Experimente als animiertes 3D-Modell sieht
und Schritt für Schritt versteht — Bild und Erklärtext sind dabei *gekoppelt*: ändert sich ein
Wert, ändern sich Bild, Formel mit eingesetzten Zahlen und Erklärsatz gleichzeitig. Erstes
Experiment: der **Doppelspalt**, vom Wellenbild des Lichts über einzelne Quanten bis zu
Elektronen.

**Was in Phase 1 gebaut wird:** der Doppelspalt mit Licht als Welle — geführte Tour in
Schritten (eigene Kameraansicht je Schritt, flüssige Kamerafahrten, fester Erklärtext), dazu
freier Modus, Zeitlupe/Pause, Umschalter 3D ↔ Draufsicht, Punkt am Schirm anklicken und
Gangunterschied sehen. Die Physik wird wirklich berechnet, nicht nachgeahmt.

**Was nur entworfen wird, damit es später *angesetzt* statt *hineinoperiert* wird:**
Quantenmodus mit Einzeltreffern und Welcher-Weg-Detektor (Phase 2), Elektronen und de Broglie
(Phase 3), weitere Experimente (Fotoeffekt usw.). Die Nähte dafür (Experiment-Schablone,
Tour-Schritte als Daten, Physik getrennt vom Bild) kommen schon in Phase 1.

**Randbedingungen, die feststehen:** Nutzer ist nur Kurt, Schulniveau (Oberstufe). Läuft im
Browser auf PC und Laptop, Maus und Tastatur. Kein Server, kein Hintergrundprozess — die App
ist unter einer festen Web-Adresse als Lesezeichen erreichbar. Keine laufenden Kosten.

## Zielbild: die Szenarien

- **A — „Ich gehe die Tour durch."** Schritt 1 zeigt eine Lichtwelle, die auf eine Wand
  zuläuft; ich klicke „weiter", die Kamera fährt an den Spalt heran, der Text erklärt, warum
  daraus eine Kreiswelle wird. So geht es bis zum fertigen Streifenmuster.
- **B — „Hier ziehe ich mal am Spaltabstand."** Im Schritt „Spaltabstand" ist genau der
  Regler für *d* frei. Ich ziehe ihn größer: die Streifen rücken zusammen, in
  `d · sin θ = m · λ` ändern sich die eingesetzten Zahlen, und der Satz daneben sagt, warum.
- **C — „Moment, nochmal langsam."** Ich halte an oder schalte auf Zeitlupe, klicke auf einen
  dunklen Streifen am Schirm und sehe beide Wege von den Spalten dorthin eingezeichnet:
  „Gangunterschied 1,5 λ — Berg trifft auf Tal, darum dunkel."
- **D (Phase 2) — „Jetzt einzeln."** Ich schalte auf einzelne Photonen: Treffer erscheinen
  zufällig, nach Hunderten entsteht dasselbe Muster. Ich setze einen Detektor an einen Spalt —
  das Muster verschwindet.

| Szenario | erzwingt |
|---|---|
| A — Tour | Tour-Schritte als **Daten** (Kamera, sichtbare Teile, Text, freie Regler); Kamerafahrten; Text-Panel |
| B — Regler in der Tour | **ein** zentraler Parameterspeicher, an dem Bild, Formel und Text hängen; Physik pro Bild neu gerechnet; Text mit Platzhaltern für Live-Werte |
| C — anhalten, anklicken | eigene Zeitsteuerung (Simulationszeit ≠ Uhrzeit); Anklicken von Punkten in 3D; zweite Kameraansicht (Draufsicht) |
| D — Einzelquanten | Physik liefert eine **Wahrscheinlichkeitsverteilung**, nicht nur ein Bild; Modus als Parameter; Detektor ändert die Rechenregel (Wellen addieren vs. Intensitäten addieren) |

Szenario D wird in Phase 1 nicht gebaut, aber seine Naht ist der Grund, warum die
Schirm-Intensität als eigene Rechenfunktion existiert und nicht nur im Grafik-Programm steckt.

## Entscheidungen (bestätigt)

| Baustein | Entscheidung |
|---|---|
| Plattform | Web-App, läuft komplett im Browser, PC/Laptop. Kein Handy/Tablet-Layout. |
| Öffnen | feste Web-Adresse als Lesezeichen — kein Server, den man startet. **GitHub Pages**, Repo dafür öffentlich (Kurt, 27.10.2026). Jeder Push auf `main` baut und veröffentlicht automatisch. |
| Zielgruppe | nur Kurt, Schulniveau |
| 3D | Three.js (verbreitete Programmbibliothek für 3D im Browser) |
| Wellenfeld | auf der Grafikkarte berechnet (Shader = kleines Programm, das direkt auf der Grafikkarte läuft) |
| Sprache/Werkzeug | TypeScript (JavaScript mit Typprüfung: viele Fehler fallen vor dem Ausprobieren auf), Vite (Werkzeug, das die Dateien für den Browser zusammenpackt) |
| Formeln | KaTeX (Bibliothek, die Formeln sauber setzt wie im Schulbuch) |
| Erklärungen | feste, vorher geschriebene Texte mit Live-Werten; **kein** KI-Fragefeld |
| Lernweg | geführte Tour in Schritten, je Schritt eigene Ansicht und die Regler, die gerade den Unterschied machen, frei verstellbar; zusätzlich freier Modus mit allen Reglern |
| Vorhersage-Modus | **nicht** — Kurt will sich das fertige Modell ansehen (27.10.2026) |
| Zeit | Pause, Zeitlupe, normal; Schritt für Schritt vor/zurück |
| Ansicht | 3D ist der Normalfall. Draufsicht (2D) **nur in den Tour-Schritten, wo sie wirklich hilft** (Winkel/Wege ablesen, Gangunterschied, Formel) — jeder Schritt legt in seinen Daten fest, ob der Umschalter erscheint (Kurt, 27.10.2026) |
| Physik | echt berechnet (Wellenüberlagerung), gegen Lehrbuchformeln geprüft |
| Reihenfolge | Welle → Quanten → Elektronen, jede Phase mit eigenen erklärenden Schritten |

**Was das kostet, bewusst in Kauf genommen:**

- *Echte Physik statt Animation:* aufwendiger als eine gezeichnete Wellenanimation, und das
  Grafik-Programm muss korrekt rechnen. Dafür stimmt jeder Fall, auch einer, an den beim
  Textschreiben niemand gedacht hat, und es lässt sich nachprüfen.
- *Nicht maßstabsgetreu:* Echtes Licht hat λ ≈ 0,0005 mm bei einem Spaltabstand von ≈ 0,1 mm
  und einem Schirm in 1 m Abstand. Maßstabsgetreu wäre die Welle unsichtbar. Darum gibt es
  **zwei Maßstäbe**: gerechnet und in Formeln angezeigt wird mit echten Werten, das Bild nahe
  am Spalt ist vergrößert. Das Bild sagt das sichtbar dazu („nicht maßstabsgetreu"), sonst
  lernt man etwas Falsches.
- *Statisches Hosting:* Die App kann nichts serverseitig speichern. Für Phase 1–3 gibt es aber
  nichts zu speichern (siehe Daten).
- *Kein Vorhersage-Modus, keine KI:* didaktisch wäre Vorhersagen stark, war aber ausdrücklich
  nicht gewünscht. Die Tour muss die Verständnisarbeit daher durch Reihenfolge und Ansicht
  leisten.

## Architektur

```
3D_Lerndarstellung/
├─ index.html                  Einstieg; Auswahl des Experiments (anfangs nur Doppelspalt)
├─ src/
│  ├─ main.ts                  startet App, verbindet Kern und Experiment
│  ├─ kern/                    für ALLE Experimente gleich
│  │  ├─ experiment.ts         die Schablone: was ein Experiment liefern muss (Naht)
│  │  ├─ parameter.ts          zentraler Parameterspeicher; meldet Änderungen an Bild/Text
│  │  ├─ zeit.ts               Simulationszeit: Pause, Zeitlupe, normal
│  │  ├─ kamera.ts             Kamerafahrten zwischen Ansichten, 3D ↔ Draufsicht
│  │  ├─ tour.ts               spielt Tour-Schritte ab (vor/zurück, Regler freigeben)
│  │  └─ ui/                   Regler, Text-Panel, Formelanzeige, Zeitleiste
│  └─ experimente/
│     └─ doppelspalt/
│        ├─ physik.ts          reine Rechenfunktionen (Feld, Schirm-Intensität, Maxima)
│        ├─ physik.test.ts     prüft physik.ts gegen Lehrbuchformeln
│        ├─ szene.ts           3D-Aufbau: Lichtquelle, Blende, Schirm, Wellenfeld
│        ├─ wellenfeld.glsl    Shader: Wellenüberlagerung pro Bildpunkt
│        ├─ tour-welle.ts      Tour-Schritte Phase 1 (Daten + Texte)
│        ├─ tour-quanten.ts    Platzhalter, Phase 2
│        └─ tour-elektronen.ts Platzhalter, Phase 3
└─ docs/PLAN.md                dieser Plan
```

In Phase 1 mit Leben gefüllt: alles außer `tour-quanten.ts` und `tour-elektronen.ts`
(nur Vertrag plus Platzhalter).

**Die zentrale Naht** ist `experiment.ts`: Ein Experiment liefert seine Parameter (mit
Einheit, Bereich, Startwert), seine Szene, seine Physik und seine Tour-Schritte. Der Kern weiß
nichts vom Doppelspalt. Ein Fotoeffekt-Experiment wäre später ein neuer Ordner unter
`experimente/`, kein Umbau.

**Ein Tour-Schritt ist reine Daten**, ungefähr so:
`{ titel, kamera, sichtbar: [...], freieRegler: ["d"], startwerte: {...}, draufsicht: true|false, text }`, wobei der
Text Platzhalter wie `{d}` oder `{deltaX}` enthält, die live ersetzt werden.

**Zustände der App:** *Tour* (Schritt n von N) oder *freier Modus*; quer dazu *läuft* /
*Zeitlupe* / *Pause* und *3D* / *Draufsicht*. Umgeschaltet wird nur durch den Nutzer;
ein Tour-Schritt darf Startwerte und Kamera setzen, aber nicht die Zeit anhalten, ohne dass es
sichtbar angezeigt wird.

## Physik (Querschnitt)

- **Wellenfeld:** Huygens-Prinzip, jeder Spalt wird in mehrere Punktquellen zerlegt (z. B. 16
  je Spalt); jede sendet eine Kreiswelle, das Feld ist die Summe. Daraus entsteht die
  Einzelspalt-Hülle von selbst, ohne Sonderformel.
- **Schirm-Intensität:** dieselbe Summe, zeitlich gemittelt. Kontrolle gegen
  `I(θ) = I₀ · cos²(π d sin θ / λ) · [sin(π b sin θ / λ) / (π b sin θ / λ)]²`
  und Streifenabstand `Δx ≈ λ · L / d` (Kleinwinkelnäherung — Abweichung bei großen Winkeln
  wird im Text erwähnt, nicht versteckt).
- **Phase 2 (vorgesehen):** Einzeltreffer werden aus der Schirm-Intensität als
  Wahrscheinlichkeit gezogen. Mit Detektor: Intensitäten der Spalte addieren statt Wellen.
- **Phase 3 (vorgesehen):** `λ = h / √(2 · m · e · U)` (nichtrelativistisch; unter ≈ 10 kV
  Fehler unter 1 %, wird im Text so gesagt).

## Budget

| Stufe | Ziel | gemessen |
|---|---|---|
| Bildrate am Laptop (schwächeres Gerät) | ≥ 50 Bilder/s, flüssig | — |
| Kamerafahrt zwischen Schritten | 1–2 s, ohne Ruckeln | — |
| Laden bis erstes Bild | < 3 s | — |
| Physik vs. Lehrbuchformel (Lage der Maxima) | < 1 % Abweichung im Kleinwinkelbereich | — |

Wird die Bildrate gerissen, wird zuerst die Auflösung des Wellenfelds gesenkt, nicht die Zahl
der Punktquellen (die trägt die Physik).

## Daten

Es entstehen **keine** Daten, die sich nicht wiederherstellen lassen. Höchstens der zuletzt
besuchte Tour-Schritt wird im Browser gemerkt (Bequemlichkeit, darf verloren gehen). Keine
Zugangsdaten, keine Schlüssel, nichts Geheimes im Repo.

## Bewusst ausgeschlossen

- **Vorhersage-Modus** — von Kurt abgelehnt (27.10.2026).
- **KI-Fragefeld** — Kosten pro Frage, braucht Netz, kann sich irren; feste Texte gewählt.
- **Handy/Tablet-Layout** — nur PC/Laptop.
- **React o. ä.** — die Oberfläche ist klein (Regler, Textfeld, Leiste); ein weiteres
  Rahmenwerk wäre mehr zu verstehen als es spart.
- **Server/Backend** — nichts zu speichern, und Kurt will nichts starten müssen.

## Phasen

| Phase | Inhalt | neu freigeschaltet |
|---|---|---|
| 1 | Licht als Welle: Tour + freier Modus, Zeitlupe, Draufsicht, Wege anklicken | das ganze Wellenbild verstehen; Formeln `d sin θ = mλ`, `Δx = λL/d` |
| 2 | Quanten: Einzelphotonen, Muster baut sich auf, Welcher-Weg-Detektor | Welle-Teilchen-Dualismus, Wahrscheinlichkeitsdeutung |
| 3 | Elektronen: Beschleunigungsspannung → de-Broglie-Wellenlänge, Jönsson-Versuch | Materiewellen |
| später | weitere Experimente als neue Module | — |

**Tour Phase 1 (Vorschlag, Inhalt wird mit Kurt durchgesehen):**
1. Was eine Welle ist: Wellenlänge, Berg und Tal — ebene Welle läuft auf die Wand zu.
2. Ein enger Spalt: aus der ebenen wird eine Kreiswelle (Huygens).
3. Zwei Spalte: zwei Kreiswellen, die sich überlagern.
4. Überlagerung im Detail — Zoom auf einen Punkt: Berg + Berg = hell, Berg + Tal = dunkel.
5. Gangunterschied: beide Wege eingezeichnet; ganze Vielfache von λ → hell.
6. Das Muster am Schirm entsteht; Maxima und ihre Ordnung m.
7. Die Formel: `d · sin θ = m · λ` und `Δx ≈ λL/d` — Regler d, λ, L frei.
8. Farbe: rotes vs. blaues Licht — warum rot breitere Streifen macht.
9. Spaltbreite b: die Einzelspalt-Hülle und fehlende Maxima.
→ Übergang zu Phase 2: „Was passiert, wenn das Licht ganz schwach wird?"

## Umsetzung Phase 1

### Schritt 0 — Gerüst und feste Adresse
Leeres Projekt (Vite + TypeScript + Three.js), eine 3D-Szene mit einem einzelnen drehenden
Würfel, veröffentlicht unter der festen Adresse. *Tracer:* funktional belanglos, beweist aber,
dass „ändern → hochladen → im Lesezeichen sichtbar" auf PC und Laptop trägt.
**Prüfung:** Lesezeichen auf beiden Geräten öffnen, Würfel dreht sich.

### Schritt 1 — Physik-Kern
`physik.ts` als reine Rechenfunktionen, `physik.test.ts` prüft Lage der Maxima, Minima und
Hülle gegen die Lehrbuchformeln. Noch kein Bild.
**Prüfung:** `npm test` grün; Abweichungen als Zahlen festgehalten.

### Schritt 2 — Szene und Wellenfeld
Lichtquelle, Blende mit zwei Spalten, Schirm; Wellenfeld als Shader; Zeitsteuerung (Pause,
Zeitlupe). Hinweis „nicht maßstabsgetreu".
**Prüfung:** Bildrate am Laptop gemessen; Streifenlage im Bild = Physik-Kern.

### Schritt 3 — Parameter, Regler, gekoppelter Text
Zentraler Parameterspeicher; Regler; Text-Panel mit KaTeX-Formel und Live-Werten.
*Tracer:* ein einziger Regler (d) und ein Satz mit `{d}` und `{deltaX}`.
**Prüfung:** Regler ziehen → Bild, Formel und Satz ändern sich im selben Moment.

### Schritt 4 — Tour-Maschine
`tour.ts` spielt Schritte aus Daten ab; Kamerafahrten; freie Regler je Schritt; vor/zurück.
*Tracer:* Tour mit zwei Dummy-Schritten.
**Prüfung:** vor/zurück springt flüssig, Regler sperren und freigeben sich korrekt.

### Schritt 5 — Draufsicht und Wege anklicken
Umschalter 3D ↔ Draufsicht, nur in den Schritten, die ihn freigeben (voraussichtlich 5–7);
Klick auf den Schirm zeichnet beide Wege und zeigt den
Gangunterschied in λ.
**Prüfung:** Klick auf Maximum m = 2 zeigt „2,0 λ" (± Rundung).

### Schritt 6 — Tour-Inhalt Phase 1
Alle neun Schritte mit Ansichten und Texten. Kurt liest jeden Text gegen sein Schulwissen.
**Prüfung:** Kurt geht die Tour einmal komplett durch und nimmt ab.

### Schritt 7 — Freier Modus
Alle Regler frei, Experiment-Auswahl auf der Startseite.
**Prüfung:** jeder Regler über seinen ganzen Bereich ohne Absturz oder Unsinn.

## Verifikation Phase 1

1. [ ] Feste Adresse funktioniert auf PC und Laptop ohne Start-Befehl
2. [ ] Physik-Tests grün, Abweichung < 1 % im Kleinwinkelbereich
3. [ ] Bildrate am Laptop ≥ 50 Bilder/s
4. [ ] Bild, Formel und Text ändern sich gleichzeitig mit dem Regler
5. [ ] Zeitlupe und Pause beeinflussen nur die Animation, nicht das Ergebnis
6. [ ] Gangunterschied beim Anklicken stimmt mit der Physik überein
7. [ ] Tour von Kurt durchgesehen und abgenommen

## Ausdrücklich nicht in diesem Plan

Lernstand, Konten, Quizfragen, Vorhersage-Modus, KI-Erklärungen, Handy-Version, mehrere
Sprachen, weißes Licht/Spektren (vielleicht später als eigener Tour-Schritt). Grund: Jedes
davon ist einzeln klein, zusammen würden sie Phase 1 verdoppeln, ohne beim Verstehen des
Doppelspalts zu helfen.

## Offene Fragen

- ~~Anbieter für die feste Adresse~~ — entschieden 27.10.2026: GitHub Pages, öffentliches Repo.
- **Grafikkarte des Laptops** — bestimmt, wie fein das Wellenfeld sein kann; wird in Schritt 2
  gemessen statt vermutet.
