const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const SRC_DIR = path.resolve(__dirname, '../Dudu Stickers');
const OUT_DIR = path.resolve(__dirname, '../assets/stickers_gif');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.webp'));
console.log(`Starting conversion of ${files.length} animated WebP to high-res 384x384 GIF...`);

const CONCURRENCY = 12;
let index = 0;
let active = 0;
let completed = 0;

function next() {
  if (completed >= files.length) {
    console.log(`\nSuccessfully converted all ${completed} GIFs!`);
    return;
  }

  while (active < CONCURRENCY && index < files.length) {
    const file = files[index++];
    active++;
    const baseName = path.basename(file, '.webp');
    const srcFile = path.join(SRC_DIR, file);
    const outFile = path.join(OUT_DIR, `${baseName}.gif`);

    const cmd = `magick "${srcFile}" -coalesce -resize 384x384 -layers Optimize "${outFile}"`;
    exec(cmd, (err) => {
      active--;
      completed++;
      if (err) {
        console.error(`\nFailed: ${file}:`, err.message);
      } else {
        process.stdout.write(`\r[${completed}/${files.length}] Converted ${baseName}.gif`);
      }
      next();
    });
  }
}

next();
