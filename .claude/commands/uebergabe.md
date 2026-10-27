---
description: Sitzung sauber übergeben — Plan und Stand nachtragen, prüfen, committen, pushen und eine Übergabe ausgeben, mit der ein neues Kontextfenster nahtlos weitermacht.
---

# Übergabe — diese Sitzung abschließen

Wird am **Ende** einer Arbeitssitzung aufgerufen. Ziel: Kurt schließt das Fenster, öffnet ein
neues, und dort kann ohne Nachfragen am nächsten Schritt weitergearbeitet werden.
In `$ARGUMENTS` steht optional, worum es ging. **Nicht mit dem nächsten Schritt anfangen.**

1. **Bestandsaufnahme** — `git status --short`, `git diff --stat`. Was wurde gebaut, welche
   Entscheidungen fielen (womit begründet), was wurde gemessen, was blieb ungeprüft
   (Flüssigkeit, Optik, Lesbarkeit braucht Kurts Blick). Nichts zu tun → nur Schritt 6.
2. **Dokumente nachziehen** — `docs/PLAN.md` Pflicht: Schritt auf `✅ erledigt`, Ergebnis mit
   Zahlen, Funde, Korrekturen mit Datum statt Löschen. `CLAUDE.md` sparsam: eine Zeile im
   Stand, neue Fallen, Nicht-zurückbauen-Hinweise — kein Baubericht. Neue Messung → eigene
   Datei `docs/schritt<N>-messung.md`, aus dem Plan verlinkt.
3. **Prüfen** — `npm run build` (inkl. Typprüfung) und `npm test`. Läuft etwas nicht durch:
   nicht committen, melden.
4. **Committen** — vorher auf Geheimnisse sehen (`.env`, Tokens). Nachricht sagt, **warum**,
   und welche Zahl das trägt.
5. **Pushen** — auf `main`; das veröffentlicht automatisch unter
   https://4scknjc9cw-art.github.io/3D_Lerndarstellung/ . Danach prüfen, dass der
   Veröffentlichungslauf grün ist (`gh run list --limit 1`).
6. **Übergabe ausgeben** — höchstens eine Bildschirmseite: was erreicht wurde, Stand (Commit,
   gepusht ja/nein, online ja/nein), was als Nächstes ansteht, **was offen ist**.
