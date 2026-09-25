/**
 * Tarot kartı görsellerini sıkıştır
 * Kullanım: node scripts/compress-tarot.js
 * Kaynak: assets-src/tarot-original/*.png (deploy edilmez) → public/tarot/*.webp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TAROT_DIR = path.join(__dirname, '../public/tarot');
const BACKUP_DIR = path.join(__dirname, '../assets-src/tarot-original');
const TARGET_WIDTH = 800; // Kartlar için yeterli
const QUALITY = 80;

async function compressImages() {
  console.log('Tarot görsellerini sıkıştırma başlıyor...\n');

  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.png'));

  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const file of files) {
    const inputPath = path.join(BACKUP_DIR, file);
    const outputPath = path.join(TAROT_DIR, file.replace(/\.png$/, '.webp'));

    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;
    totalOriginal += originalSize;

    try {
      // WebP olarak sıkıştır
      const buffer = await sharp(inputPath)
        .resize(TARGET_WIDTH, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: QUALITY, effort: 6 })
        .toBuffer();

      fs.writeFileSync(outputPath, buffer);

      const newSize = buffer.length;
      totalCompressed += newSize;

      const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`✓ ${file}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024).toFixed(0)}KB (-%${reduction})`);
    } catch (err) {
      console.error(`✗ ${file}: Hata - ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Toplam: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(totalCompressed / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Kazanç: ${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}% küçülme`);
  console.log('='.repeat(50));
  console.log('\nOrijinal dosyalar: assets-src/tarot-original/');
}

compressImages().catch(console.error);
