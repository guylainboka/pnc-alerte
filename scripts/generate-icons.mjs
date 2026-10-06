// ============================================================================
// Génération des icônes du logiciel PNC Alerte
// ============================================================================
// Source unique : public/pnc-logo.png (logo officiel — NE JAMAIS MODIFIER).
// Ce script produit uniquement des REDIMENSIONS du logo pour :
//   - le favicon navigateur (48 / 96 / 192)
//   - l'icône Apple touch (180)
//   - l'icône de fenêtre du logiciel packagé Tauri/Electron (256 / 512)
// Aucun traitement graphique (aucune retouche, aucun filtre, aucun recadrage
// créatif) n'est appliqué : sharp redimensionne simplement l'image originale.
// Usage : bun run scripts/generate-icons.mjs
// ============================================================================

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'public', 'pnc-logo.png');
const OUT_DIR = path.join(ROOT, 'public', 'icons');

const SIZES = [16, 32, 48, 96, 180, 192, 256, 512];

if (!fs.existsSync(SRC)) {
  console.error(`Logo introuvable : ${SRC}`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const size of SIZES) {
  const out = path.join(OUT_DIR, `icon-${size}.png`);
  await sharp(SRC)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✅ ${path.relative(ROOT, out)} (${size}x${size})`);
}

console.log('\nIcônes générées depuis pnc-logo.png (redimensionnement pur).');
