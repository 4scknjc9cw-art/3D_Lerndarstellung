// Ungefähre Farbe, die das Auge bei einer Wellenlänge sieht (380–780 nm).
// Näherung nach Dan Bruton — für die Anzeige genügt das, gerechnet wird damit nichts.

export function wellenlaengeZuFarbe(wellenlaenge: number): [number, number, number] {
  const nm = wellenlaenge * 1e9;
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = (440 - nm) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = (510 - nm) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = (645 - nm) / 65;
  } else if (nm <= 780) {
    r = 1;
  }
  // Am Rand des Sichtbaren nimmt die Empfindlichkeit des Auges ab.
  let staerke = 1;
  if (nm < 420) staerke = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) staerke = 0.3 + (0.7 * (780 - nm)) / 80;
  return [r * staerke, g * staerke, b * staerke];
}
