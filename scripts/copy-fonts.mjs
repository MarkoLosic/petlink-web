// Kopira samo potrebne woff2 fajlove (latin + latin-ext zbog č ć š ž đ) u assets/fonts.
// @font-face pravila su u src/styles.css — ako ovde dodaš težinu, dodaj je i tamo.
import fs from 'node:fs';

const FONTS = {
  inter: [400, 500, 600],
  poppins: [600, 700, 800],
};
const OUT = 'assets/fonts';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const [family, weights] of Object.entries(FONTS)) {
  for (const w of weights) {
    for (const subset of ['latin', 'latin-ext']) {
      const name = `${family}-${subset}-${w}-normal.woff2`;
      fs.copyFileSync(`node_modules/@fontsource/${family}/files/${name}`, `${OUT}/${name}`);
    }
  }
}
console.log('fonts: kopirano u', OUT);
