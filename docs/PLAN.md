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
│        ├─ darstellung.ts     Umrechnung echte Werte → Darstellungsmaßstab (+ Test)
│        ├─ farbe.ts           Wellenlänge → sichtbare Farbe
│        ├─ szene.ts           3D-Aufbau: Lichtquelle, Blende, Schirm, Wellenfeld
│        ├─ wellenfeld.ts      Shader: Wellenüberlagerung je Gitterpunkt
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
| Physik vs. Lehrbuchformel (Lage der Maxima) | < 1 % Abweichung im Kleinwinkelbereich | ≤ 0,015 % gegen cos²·sinc² ✅ ([Messung](schritt1-messung.md)) |

Korrektur (27.10.2026): Hier war gemeint „gegen `d·sin θ = mλ`". Das war als Prüfmaßstab
falsch: die Schulformel gilt nur für schmale Spalte. Bei b = d/5 rücken die Maxima durch die
Einzelspalt-Hülle echt bis 5 % nach innen. Maßstab ist darum die volle Formel cos²·sinc²;
gegen die Schulformel wird nur bei schmalen Spalten (b = d/20, < 0,25 %) geprüft.

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

### Schritt 1 — Physik-Kern ✅ erledigt (27.10.2026)
`physik.ts` als reine Rechenfunktionen, `physik.test.ts` prüft Lage der Maxima, Minima und
Hülle gegen die Lehrbuchformeln. Noch kein Bild.
**Prüfung:** `npm test` grün; Abweichungen als Zahlen festgehalten.

**Ergebnis:** 9 Tests grün. Huygens-Rechnung (16 Punktquellen je Spalt) trifft cos²·sinc² auf
≤ 0,015 % des Streifenabstands, Minima exakt (Helligkeit < 10⁻⁴), fehlende 5. Ordnung bei
d = 5b erscheint von selbst. Details: [schritt1-messung.md](schritt1-messung.md).

**Festlegungen:** gerechnet wird in Metern mit echten Werten, nie im Darstellungsmaßstab.
`feldVonSpalt` ist getrennt von `feld` — das ist die Naht für den Welcher-Weg-Detektor
(Phase 2: Intensitäten statt Wellen addieren). `auslenkung(zeiger, phase)` liefert Berg/Tal
für die Animation.

**Fund beim Bauen:** Die Schulformel `d·sin θ = mλ` ist bei breiten Spalten sichtbar
ungenau (Maxima bis 5 % nach innen). Siehe Korrektur unter „Budget".

#### Vorgemerkt für Schritt 6 (Tour-Inhalt)
Der Text zu Schritt 9 „Spaltbreite" sollte sagen, dass die Maxima mit breiteren Spalten
leicht nach innen rücken und `d·sin θ = mλ` darum eine Näherung für schmale Spalte ist —
sonst wundert man sich, wenn man im Bild nachmisst. In Schritt 7 „Formel" schmale Spalte als
Startwert nehmen, damit Formel und Bild dort sichtbar übereinstimmen.

#### Vorgemerkt für Schritt 2 (Shader)
Die Grafikkarte rechnet mit 32-Bit-Zahlen (≈ 7 Stellen). Bei echten Werten ist k·r ≈ 10⁷ —
die Phase wäre im Shader Rauschen. Der Shader muss im Darstellungsmaßstab rechnen (dort ist
λ groß); der Schirm-Verlauf kommt aus `physik.ts` (64-Bit) als Textur bzw. Kurve.

### Schritt 2 — Szene und Wellenfeld ✅ gebaut (27.10.2026), Bildrate noch ungemessen
Lichtquelle, Blende mit zwei Spalten, Schirm; Wellenfeld als Shader; Zeitsteuerung (Pause,
Zeitlupe). Hinweis „nicht maßstabsgetreu".
**Prüfung:** Bildrate am Laptop gemessen; Streifenlage im Bild = Physik-Kern.

**Ergebnis:** 16 Tests grün (9 Physik, 7 Darstellung/Farbe). Bildschirmfoto mit unsichtbarem
Chrome geprüft: keine Fehler in der Konsole, Kreiswellen, Auslöschungslinien und Schirmstreifen
sichtbar und zueinander passend. Bildrate: **ungeprüft** — der Testbrowser rechnet ohne
Grafikkarte (1 Bild/s, sagt nichts). Messung bei Kurt mit `…/3D_Lerndarstellung/?fps`.

**Festlegungen:**
- `darstellung.ts` übersetzt echt → Bild: λ_Bild = 0,35 bei 500 nm, d_Bild = 2,8 bei 0,1 mm
  (d/λ = 8 statt 200), b mit demselben Faktor wie d (d/b und fehlende Ordnungen bleiben),
  L_Bild = 12 · L/m, begrenzt auf 6…16. Tests sichern, dass jede Änderung im Bild in die
  richtige Richtung wirkt.
- Schirmbild = `schirmIntensitaet` aus `physik.ts` mit dem **Bild**-Aufbau (64-Bit), damit es
  genau zum sichtbaren Wellenfeld passt. Zahlen im Text kommen aus dem **echten** Aufbau.
- Shader (`wellenfeld.ts` statt `.glsl`, damit Quellenzahl und Rechnung an einer Stelle stehen)
  rechnet dieselbe Formel wie `feldVonSpalt`/`auslenkung`. Rechnet nur in den Gitterpunkten
  (Abstand λ_Bild/10), nicht pro Bildpunkt — spart Grafikleistung am Laptop.
- Anzeige hinter der Blende 2,75-fach verstärkt (`uSkala`), sonst ist die Interferenz kaum zu
  sehen; davor 0,8. Betrifft nur die Helligkeit des Bilds, nicht die Rechnung.
- Vereinfachung: Reflexion an der Blende ist weggelassen (vor der Blende nur die einfallende
  ebene Welle) — entspricht einer schwarzen, Licht schluckenden Blende.
- Maus (Kurt, 27.10.2026): rechts = Sicht drehen, Mausrad gedrückt = verschieben, Mausrad =
  Zoom; links frei für das Anklicken in Schritt 5. Prüfhilfe: `?kamera=x,y,z,zielX,zielY,zielZ`.

Korrektur (27.10.2026): Die Huygens-Quellen strahlten anfangs in alle Richtungen gleich stark.
Kurt fiel auf, dass die Wellen dadurch direkt hinter der Blende seitlich an der Wand
entlangliefen, „als würden sie durch die Wand glitschen". Das war physikalisch falsch: eine
Elementarwelle hat einen Neigungsfaktor cos θ (Rayleigh-Sommerfeld) und strahlt entlang der
Wand gar nicht. Jetzt in `physik.ts` und Shader eingebaut; alle 16 Tests weiter grün, weil
cos θ bei den kleinen echten Winkeln (≤ 0,03 rad) praktisch 1 ist.

**Funde beim Bauen:** Im Bild ist der Schirm bei L_Bild = 12 im Nahfeld (d²/λ ≈ 22 > L), das
Bild-Schirmmuster ist also streng genommen ein Fresnel-Muster. Es stimmt trotzdem, weil es aus
derselben Huygens-Summe kommt wie das Wellenfeld — nur die *Lehrbuch*-Formel cos²·sinc² gilt
im Bild nicht exakt. Für die Zahlen ist das egal (echter Aufbau: d²/λ = 2 cm ≪ 1 m).

### Schritt 3 — Parameter, Regler, gekoppelter Text ✅ erledigt (27.10.2026)
Zentraler Parameterspeicher; Regler; Text-Panel mit KaTeX-Formel und Live-Werten.
*Tracer:* ein einziger Regler (d) und ein Satz mit `{d}` und `{deltaX}`.
**Prüfung:** Regler ziehen → Bild, Formel und Satz ändern sich im selben Moment.

**Ergebnis:** 73 Tests grün. Bildschirmfotos bei Standard (Δx = 5,0 mm, θ₁ = 0,29°) und bei
λ = 650 nm, d = 0,2 mm (Formel 3,3 mm / 0,19°, nachgerechnet 3,25 mm / 0,186°; Bild rot, Streifen
enger). Gleichzeitigkeit ist durch Bauart gesichert: ein Speicher, alle hängen als Beobachter
daran. Wie es sich beim Ziehen *anfühlt* (Ruckeln bei λ/L-Änderung, weil dann das Gitter neu
gebaut wird): **ungeprüft**, braucht Kurts Blick.

**Festlegungen:**
- Die Naht `kern/experiment.ts` steht: Parameter (SI-Einheiten, Bereich, „warum"-Satz),
  `groessen()` für Text/Formeln, `erzeugeSzene()`. Der Kern kennt den Doppelspalt nicht.
- Statt Tracer mit nur d gleich alle vier Regler (λ, d, b, L) — gleicher Aufwand, weil die
  Reglerliste generisch ist; wird in Schritt 7 zum freien Modus.
- Platzhalter `[[name]]` statt `{name}`, weil `{}` in TeX schon belegt ist. Unbekannte
  Platzhalter und Parameter werfen einen Fehler.
- Nach jeder Änderung leuchtet der geänderte Wert und alle berechneten Größen 0,9 s orange in
  der Formel auf, darunter erscheint der „warum"-Satz des Reglers.
- Reglerbereiche: λ 380–750 nm, d 0,06–0,30 mm, b 0,005–0,030 mm, L 0,5–1,5 m.
  L_Bild = 12 · L (6–18).
- Huygens-Quellen im Bild jetzt angepasst (≤ λ/4 Abstand, 8–32 je Spalt), im echten Aufbau
  bleiben 16 (Geisterstrahlen erst bei sin θ ≥ 0,15, weit außerhalb des Schirms).
- Bildmitte um das halbe Seitenfeld nach links verschoben (`setViewOffset`), sonst verdeckt
  es den Schirm. Prüfhilfe `?werte=d:0.0002,lambda:6.5e-7`.

**Fund beim Bauen:** Der Test über alle 16 Reglerecken fiel durch: bei d = 0,06 mm und
b = 0,04 mm bliebe nur 0,02 mm Steg — die Spalte liefen fast ineinander. b ist darum auf
0,03 mm begrenzt.

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
2. [x] Physik-Tests grün, Abweichung ≤ 0,015 % gegen cos²·sinc² ([Messung](schritt1-messung.md))
3. [ ] Bildrate am Laptop ≥ 50 Bilder/s (PC: 144 Bilder/s = Bildschirmgrenze, Kurt 27.10.2026)
4. [x] Bild, Formel und Text ändern sich gleichzeitig mit dem Regler (Schritt 3; Gefühl beim Ziehen noch von Kurt zu prüfen)
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
