---
name: farbschema
description: Kurts Farbwunsch für die App — sehr dunkler, angenehmer Hintergrund (kein Reinschwarz), Orange als Kontrastfarbe
metadata:
  type: feedback
---

Hintergrund: nicht reines Schwarz, sondern ein angenehmes, sehr dunkles Schwarz (neutral, kein
Blaustich). Bedienelemente, Hervorhebungen, aktive Zustände: Orange als Kontrast.

**Why:** Kurt, 27.10.2026 — „ein angenehmes Schwarz … die Sachen in einem Kontrast dazu, zum
Beispiel orange".

**How to apply:** Farben als CSS-Variablen in `index.html` (`--hintergrund`, `--akzent`).
Ausnahme: Lichtwellen und Schirmmuster behalten die physikalische Farbe der Wellenlänge
(`farbe.ts`) — das ist Physik, nicht Gestaltung. Orange nie für Licht verwenden, das sonst
wie ~600 nm aussieht.
