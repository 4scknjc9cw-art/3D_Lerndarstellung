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
│        ├─ index.ts           der Doppelspalt als Experiment (Parameter, Größen, Touren)
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

**Regel für jeden Tour-Schritt (Kurt, 27.10.2026):** nicht nur sagen, *was* man sieht,
sondern *warum*, und dem Weg des Lichts folgen („nachdem das Licht durch die Spalte kommt,
fächert es auf, weil …"). Formeln erst, wenn das Bild sie vorher hergeleitet hat — ohne
Herleitung waren sie für Kurt unverständlich (Rückmeldung zu Schritt 3).
Stand 27.10.2026: Schritte 1 (Welle trifft Blende), 2 (Beugung/Huygens, zwei Kreiswellen im
Gleichtakt) und 5 (Gangunterschied, hier als Tour-Schritt 3) sind ausgeschrieben.

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

### Schritt 4 — Tour-Maschine ✅ erledigt (27.10.2026)
`tour.ts` spielt Schritte aus Daten ab; Kamerafahrten; freie Regler je Schritt; vor/zurück.
*Tracer:* Tour mit zwei Dummy-Schritten.
**Prüfung:** vor/zurück springt flüssig, Regler sperren und freigeben sich korrekt.

**Ergebnis:** 77 Tests grün (u. a. Zurückspringen stellt den Schritt exakt wieder her, Tippfehler
in Schritten fallen beim Laden auf, alle Platzhalter aller Touren gültig). Bildschirmfotos:
Schritt 1 blendet Feld und Schirm aus, Schritt 2 zeigt nur Regler d; die Einflug-Fahrt endet
genau in der Schritt-1-Ansicht. Flüssigkeit der Fahrt: **ungeprüft** (Testbrowser ohne Grafikkarte).

**Festlegungen:**
- Ein Schritt setzt beim Betreten **alle** Parameter auf Start + eigene Startwerte — so sieht er
  immer gleich aus, egal von wo man kommt. Im freien Modus bleiben die Werte stehen.
- Kamerafahrt 1,6 s auf einer Kugel um den Blickpunkt (schwenkt um das Experiment statt
  hindurch), kürzester Drehweg, sanftes An-/Abbremsen. Greift man zur Maus, endet die Fahrt.
- Seitenfeld oben „Geführte Tour | Frei ausprobieren". Der freie Modus ist damit schon da
  (Erklärfeld und Regler teilen sich beide Modi) — Schritt 7 schrumpft auf Startseite mit
  Experiment-Auswahl und Feinschliff.
- Pfeiltasten ← → blättern, außer wenn ein Regler den Fokus hat (dort bewegen sie den Regler).
- Szenenteile mit Namen: `laser`, `einfall`, `blende`, `feld`, `schirm`.
- Touren ohne Schritte (Quanten, Elektronen) erscheinen nicht — die Platzhalter liegen bereit.
- Prüfhilfen: `?schritt=2`, `?frei`.

#### Vorgemerkt für Schritt 6
Kameraansichten hängen an festen Koordinaten; bei geändertem L wandert der Schirm. Für
Schritte, die auf den Schirm blicken, entweder L festsetzen (Startwert) oder die Ansicht
später aus dem Aufbau berechnen lassen. Für Schritt 1 („Was ist eine Welle") braucht es
vermutlich einen Szenenteil ohne Spalte (Wand ganz zu) oder ganz ohne Blende.

### Schritt 5 — Draufsicht und Wege anklicken ✅ erledigt (27.10.2026)
Umschalter 3D ↔ Draufsicht, nur in den Schritten, die ihn freigeben (voraussichtlich 5–7);
Klick auf den Schirm zeichnet beide Wege und zeigt den
Gangunterschied in λ.
**Prüfung:** Klick auf Maximum m = 2 zeigt „2,0 λ" (± Rundung).

#### Vorgemerkt (Kurt, 27.10.2026): Gangunterschied-Dreieck in der Draufsicht
In der Draufsicht soll das Lehrbuch-Dreieck eingezeichnet werden: beide Wege von den Spalten
zum Schirmpunkt, das Lot vom einen Spalt auf den Weg des anderen, und das kurze Reststück
Δs = d · sin θ farbig hervorgehoben, mit Winkel θ an der Blende. Kurts Rückmeldung zu Schritt 3:
die Formeln sind ohne diese Herleitung schwer zu verstehen — das Dreieck ist die Brücke
zwischen Bild und `d · sin θ = m · λ`. Im Bild sind die Winkel vergrößert; das Dreieck wird im
Bildmaßstab gezeichnet, die Zahlen daneben kommen aus dem echten Aufbau. → umgesetzt, siehe unten.

**Ergebnis:** 84 Tests grün. Bildschirmfotos in 3D und Draufsicht: Klick auf den 2. hellen
Streifen zeigt Δs = 1,99 λ = 995 nm, θ = 0,570°, 9,95 mm auf dem echten Schirm (nachgerechnet:
sin θ = 0,00995 ✓). Klick-Bedienung mit echter Maus: **ungeprüft**.

**Festlegungen:**
- Dreieck exakt statt mit Lot: Vom Zielpunkt P wird die Länge des kurzen Wegs auf dem langen
  abgetragen (Punkt Q, grau gestrichelt), der Rest bis zum fernen Spalt ist Δs (orange). Das
  ist auch nahe am Spalt exakt, wo die Wege nicht parallel sind; weit weg wird es das
  Schulbuch-Lot (getestet: Lot ⟂ Weg, Δs → d·sin θ). Dazu Symmetrieachse, Winkelbogen θ,
  Beschriftungen Δs, θ, d, P.
- **Brücke Bild ↔ echt ist q = Δs/λ**: allein q entscheidet hell/dunkel, und auch die
  Einzelspalt-Hülle hängt nur von q und d/b ab. Der Bildpunkt mit q entspricht in echt dem
  Winkel mit d·sin θ = q·λ. Darum stimmt die Erklärung trotz nicht maßstabsgetreuem Bild.
- Hell bei |q − m| ≤ 0,1, dunkel bei |q − m − ½| ≤ 0,1, sonst „dazwischen". „genau" steht nur,
  wenn auch die angezeigte Zahl (2 Stellen) passt. Fehlende Ordnung wird erkannt (Hülle < 0,05).
- Klick wird gegen die mathematischen Ebenen (Feld y = 0, Schirm x = L) gerechnet, nicht gegen
  das Gitter (150 000 Punkte). Nur echter Klick zählt (≤ 5 px Bewegung).
- Konstruktion ohne Tiefenprüfung gezeichnet — sie liegt genau in der Spaltebene, sonst
  verdeckt sie die Blende. Erklärung zum Punkt steht oben im Seitenfeld (sonst unter dem Rand).
- Umschalter 3D/Draufsicht nur bei `draufsicht: true` und im freien Modus. Draufsicht wird aus
  dem aktuellen L berechnet; Bildschirm-oben ist dort −z (gespiegelt ist egal, rechts bleibt
  die Ausbreitungsrichtung).
- Prüfhilfen: `?draufsicht`, `?klick=x,z` (x = 99 = auf dem Schirm).

**Fund beim Bauen:** Die fehlende 5. Ordnung (d = 5b) liegt im Bild unter ~39° und damit
**neben** dem Bild-Schirm (|z| ≤ 8) — auf dem Schirm sieht man sie beim Standard nicht, im
Wellenfeld kann man sie anklicken. Für Tour-Schritt 9 („Spaltbreite") darum eine Einstellung
wählen, bei der die fehlende Ordnung auf dem Schirm liegt (z. B. d = 3b oder 4b).

### Schritt 6 — Tour-Inhalt Phase 1 ✅ gebaut (27.10.2026), Abnahme durch Kurt steht aus
Alle neun Schritte mit Ansichten und Texten. Kurt liest jeden Text gegen sein Schulwissen.
**Prüfung:** Kurt geht die Tour einmal komplett durch und nimmt ab.

**Ergebnis:** 9 Schritte mit 27 Teilen, 136 Tests grün. Bildschirmfotos von 10 Teilen
angesehen; zwei Kameras danach korrigiert (Dreieck-Nahsicht zu eng, fehlender Streifen unter
dem Seitenfeld). Jede Behauptung eines Texts über einen vorgewählten Punkt („hier hell",
„1,5 λ → dunkel", „m = 3 fehlt") wird im Test gegen die Rechnung geprüft.

**Festlegungen:**
- **Teile** (Kurt, 27.10.2026): Ein Schritt besteht aus Teilen; braucht ein Teil der Erklärung
  eine andere Ansicht, fährt die Kamera dorthin. „Weiter" geht erst durch die Teile. Frühere
  Teile bleiben abgeblendet darüber stehen, Fortschrittsstriche zeigen den Teil.
- Ein Teil kann: Kamera (oder `'draufsicht'`), sichtbare Szenenteile, Hilfen (λ-Maß,
  Ordnungen), Umschalter 3D/Draufsicht, vorgewählten Punkt, eigene Werte, Tempo (Zeitlupe).
- Werte: beim Betreten eines Schritts alles = Start + Schritt-Startwerte + Teil-Werte bis
  hierher; innerhalb des Schritts bleiben selbst verstellte Regler stehen, außer ein Teil
  bringt eigene Werte mit (getestet).
- Vorgewählte Punkte werden aus der Physik berechnet (Bisektion auf q), nicht von Hand
  eingetragen — so liegen sie garantiert auf dem Streifen.
- Neuer Parameter „Offene Spalte" (1/2) für den Einzelspalt-Schritt; der obere Spalt bleibt
  dabei an seinem Platz. Schirmbild auf das hellste Stück normiert (beim Einzelspalt ist die
  Mitte nicht die hellste Stelle). Beim Einzelspalt kein Anklicken (keine zwei Wege).
- Schritt 7 „Formel" mit b = 0,005 mm (Formel passt dort genau), Schritt 9 mit d = 3b
  (fehlende 3. Ordnung liegt auf dem Bild-Schirm).
- Reihenfolge wie geplant; „Überlagerung im Detail" vor „Gangunterschied", Ausblick auf
  Phase 2 als letzter Teil von Schritt 9.

**Ungeprüft:** wie flüssig die Teilwechsel wirken, und ob die Texte für Kurt verständlich
sind — dafür ist die Abnahme da.

#### Überarbeitung nach Kurts erster Rückmeldung (27.10.2026)
Rückmeldung: zu viel freies Ausprobieren; überall Zahlen ins Bild (Längen, Winkel); beim
Dreieck die Draufsicht so, dass man das *ganze* Dreieck sieht; Schritt 1 von der Seite (2D);
Tour aus Sicht eines 13.-Klässlers ohne Vorwissen zum Versuch durchspielen; Fehler: nach dem
Verstellen eines Reglers setzte „weiter" scheinbar nur den Schritt zurück.

- **Fehler „weiter"**: nachgestellt mit echten Maus-/Tastenereignissen (Chrome-Fernsteuerung).
  Ein Mausklick auf „Weiter" ging, aber der gezogene Regler behielt den Tastaturfokus — die
  Pfeiltaste → schob dann den Regler statt weiterzublättern. Jetzt gibt der Regler den Fokus
  beim Loslassen ab (`regler.ts`); geprüft: ziehen → → landet im nächsten Schritt.
- **Punkt nicht mehr frei**: Klick ins Wellenfeld geht nicht mehr. P liegt auf dem Schirm und
  springt mit ▲▼ (Knöpfe im Kasten „Punkt P") oder ↑↓ von Streifen zu Streifen, in halben
  Wellenlängen (hell → dunkel → hell). Ein Klick auf den Schirm rastet am nächsten Streifen
  ein. In der Tour nur in **einem** Teil wählbar (`punktWaehlen`, Schritt 5 Teil 4), sonst fest;
  im freien Modus immer. Naht: `Experiment.streifen()`.
- **Zahlen im Bild** (echte Werte): λ-Klammer „λ = 500 nm"; Dreieck mit s₁, s₂ (in mm auf
  5 Stellen — erst dort unterscheiden sie sich), Δs, θ (zweimal: Blendenmitte und kleines
  Dreieck), d, L, x und dünner Linie Blendenmitte → P (zweiter Schenkel von θ, Hypotenuse des
  großen Dreiecks). Neue Hilfen `spaltMasse` (b, d) und `schirmMass` (L). Hinweis oben links
  sagt jetzt „Alle Zahlen — im Bild und rechts — sind echte Werte".
- **Draufsicht mit Punkt** rahmt das ganze Dreieck (Blende bis P) statt des ganzen Felds —
  außer P ist wählbar (könnte sonst aus dem Rahmen springen).
- **Schritt 1** beginnt seitlich: nur die Welle als Kurve (Hilfe `profil`, gleiche Formel wie
  der Shader) mit „Berg", „Tal" und λ-Klammer; danach fährt die Kamera hoch auf die Fläche.
  Neuer Teil 4: Blende mit Maßen b und d.
- **Texte**: aus Sicht eines 13.-Klässlers durchgespielt. Nachgetragen: Überlagerungsprinzip
  vor Schritt 4, Schirm mit L eingeführt (Schritt 2), Gangunterschied als s₂ − s₁ mit echten
  Weglängen, warum θ zweimal gleich ist, tan θ = x/L am großen Dreieck. Punkte in Schritt 4
  sind „einfach" (nur Wege, ohne Δs und Kasten) — Δs kommt erst in Schritt 5. Kasten „Punkt P"
  steht unter dem Tour-Text, damit man nicht Formeln vor der Herleitung liest.
- Winkel überall mit 2 Nachkommastellen (vorher stand im Bild 0,286°, in der Formel 0,29°).

**Ergebnis:** 143 Tests grün (neu: Springen, Einrasten, Rand, echte Weglängen, „einfache"
Punkte vor Schritt 5, nur ein wählbarer Teil). Alle 29 Teile als Bildschirmfoto angesehen.

#### Zweite Rückmeldung (27.10.2026)
- **Beschriftungen** 17 px statt 15 px. Wo eine Beschriftung abseits steht, zeigt ein dünner
  Hinweisstrich auf ihr Ziel (`beschriftung.ts`); d am Dreieck hat eine eigene Maßklammer.
- **Schritt 1 exakt von der Seite auf die 3D-Fläche**: Ansichten können einen eigenen
  Öffnungswinkel haben (`Ansicht.sichtfeld`). 1,5° aus 120 Einheiten Abstand ist fast ohne
  Perspektive — alle Wellenreihen liegen übereinander. 0,6° von oben, weil eine Fläche exakt
  von der Kante unsichtbar dünn wäre. Die Welle als weiße Linie darüber (Grün auf Grün wäre
  unsichtbar). Kamerafahrt überblendet dabei die sichtbare Bildhöhe, nicht den Abstand.
- **„warum"-Satz beim Regler**: in der Tour weg (der Tour-Text sagt dasselbe), im freien Modus
  bleibt er, steht aber **unter** den Reglern. Zusätzlich scrollt das Seitenfeld beim Ziehen
  so nach, dass der Regler unter der Maus bleibt. Gemessen: Reglerposition beim Ziehen in
  Schritt 2, 8 und im freien Modus unverändert.
- **Texte** gekürzt, weniger Zahlen und Formeln im Text (die Zahlen stehen im Bild). Kasten
  „Punkt P" auf einen Satz und eine Formel gekürzt.

144 Tests grün. **Abnahme durch Kurt offen.**

### Schritt 7 — Freier Modus
Alle Regler frei, Experiment-Auswahl auf der Startseite.
**Prüfung:** jeder Regler über seinen ganzen Bereich ohne Absturz oder Unsinn.

## Verifikation Phase 1

1. [ ] Feste Adresse funktioniert auf PC und Laptop ohne Start-Befehl
2. [x] Physik-Tests grün, Abweichung ≤ 0,015 % gegen cos²·sinc² ([Messung](schritt1-messung.md))
3. [ ] Bildrate am Laptop ≥ 50 Bilder/s (PC: 144 Bilder/s = Bildschirmgrenze, Kurt 27.10.2026)
4. [x] Bild, Formel und Text ändern sich gleichzeitig mit dem Regler (Schritt 3; Gefühl beim Ziehen noch von Kurt zu prüfen)
5. [ ] Zeitlupe und Pause beeinflussen nur die Animation, nicht das Ergebnis
6. [x] Gangunterschied beim Anklicken stimmt mit der Physik überein (Schritt 5, getestet an Maxima, Minimum, fehlender Ordnung)
7. [ ] Tour von Kurt durchgesehen und abgenommen (gebaut 27.10.2026, Abnahme offen)

## Ausdrücklich nicht in diesem Plan

Lernstand, Konten, Quizfragen, Vorhersage-Modus, KI-Erklärungen, Handy-Version, mehrere
Sprachen, weißes Licht/Spektren (vielleicht später als eigener Tour-Schritt). Grund: Jedes
davon ist einzeln klein, zusammen würden sie Phase 1 verdoppeln, ohne beim Verstehen des
Doppelspalts zu helfen.

## Offene Fragen

- ~~Anbieter für die feste Adresse~~ — entschieden 27.10.2026: GitHub Pages, öffentliches Repo.
- **Grafikkarte des Laptops** — bestimmt, wie fein das Wellenfeld sein kann; wird in Schritt 2
  gemessen statt vermutet.
