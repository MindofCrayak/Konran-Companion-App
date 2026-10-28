const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG encoder in pure JS
function createPNG(width, height, getPixel) {
  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace

  // Raw image data with filter byte 0 per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, makeChunk('IHDR', ihdr), idat, iend]);
}

const dir = path.join(__dirname, '..', 'public', 'assests');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. Clock Face Outer (18-hour dial with Roman numerals XIIX to IX)
console.log('Generating clock-face-outer.png...');
const size = 512;
const cx = size / 2;
const cy = size / 2;

const clockOuter = createPNG(size, size, (x, y) => {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360; // 0 at top

  // Transparent background
  if (dist > cx - 2 || dist < cx * 0.45) {
    return [0, 0, 0, 0];
  }

  // Outer bezel & rings
  if (dist >= cx - 8 && dist <= cx - 3) {
    return [212, 175, 55, 255]; // Ornate gold outer rim
  }
  if (dist >= cx - 14 && dist <= cx - 10) {
    return [115, 81, 24, 255]; // Deep bronze groove
  }

  // Chapter ring band
  if (dist >= cx - 55 && dist <= cx - 16) {
    // Check ticks
    const tickStep = 360 / 18; // 20 deg per hour
    const nearestHour = Math.round(angle / tickStep);
    const diffAngle = Math.abs(angle - nearestHour * tickStep);

    // Major hour ticks
    if (diffAngle < 0.8 && dist > cx - 36) {
      return [255, 215, 0, 255]; // Bright gold hour tick
    }
    // Sub-minute ticks (every 4 deg = 12 mins, or 1 deg)
    if (Math.abs(angle % 4) < 0.5 && dist > cx - 26) {
      return [180, 140, 60, 220];
    }

    // Roman numeral placement circle around dist ~ cx - 38
    if (dist >= cx - 48 && dist <= cx - 28) {
      // Background parchment/obsidian dial gradient
      return [18, 12, 6, 230];
    }

    return [12, 8, 4, 240];
  }

  // Inner border before complication center
  if (dist >= cx - 60 && dist <= cx - 56) {
    return [212, 175, 55, 255];
  }

  // Interior space (subtle arcane starburst)
  if (dist >= cx * 0.45) {
    const ray = Math.sin((angle * 18 * Math.PI) / 180);
    const cVal = Math.floor(10 + Math.max(0, ray) * 20);
    return [cVal + 8, cVal + 4, cVal, 200];
  }

  return [0, 0, 0, 0];
});

fs.writeFileSync(path.join(dir, 'clock-face-outer.png'), clockOuter);
console.log('Saved clock-face-outer.png');

// 2. Pantheon Month Ring (9 months, rotating sub-ring)
console.log('Generating pantheon-month-ring.png...');
const monthRing = createPNG(360, 360, (x, y) => {
  const dx = x - 180;
  const dy = y - 180;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;

  // Ring band between r=120 and r=175
  if (dist < 120 || dist > 175) {
    return [0, 0, 0, 0];
  }

  // Borders
  if (dist >= 172 || dist <= 124) {
    return [212, 175, 55, 255];
  }

  // 9 month sector dividers (40 deg each)
  const sectorDiff = Math.abs((angle % 40) - 20);
  if (Math.abs(angle % 40) < 1.0) {
    return [255, 215, 0, 255]; // Gold dividing line
  }

  // Mid-sector glyph pip
  if (sectorDiff < 2.5 && dist >= 140 && dist <= 155) {
    return [255, 230, 140, 255];
  }

  // Base metallic dark bronze
  const monthIdx = Math.floor(angle / 40);
  const shade = (monthIdx % 2 === 0) ? 22 : 14;
  return [shade + 8, shade + 4, shade, 240];
});

fs.writeFileSync(path.join(dir, 'pantheon-month-ring.png'), monthRing);
console.log('Saved pantheon-month-ring.png');

// 3. Pantheon Day Ring (9 liturgical days)
console.log('Generating pantheon-day-ring.png...');
const dayRing = createPNG(280, 280, (x, y) => {
  const dx = x - 140;
  const dy = y - 140;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;

  // Ring band between r=85 and r=135
  if (dist < 85 || dist > 135) {
    return [0, 0, 0, 0];
  }

  if (dist >= 132 || dist <= 88) {
    return [212, 175, 55, 255];
  }

  // 9 day sectors (40 deg each)
  if (Math.abs(angle % 40) < 1.0) {
    return [168, 85, 247, 255]; // Violet arcane division
  }

  // Stepped day pips
  const daySectorDiff = Math.abs((angle % 40) - 20);
  if (daySectorDiff < 2.0 && dist >= 105 && dist <= 118) {
    return [57, 255, 20, 255]; // Phosphor green pip
  }

  return [14, 10, 20, 240];
});

fs.writeFileSync(path.join(dir, 'pantheon-day-ring.png'), dayRing);
console.log('Saved pantheon-day-ring.png');

// Also mirror to public/assets if that directory exists or create it
const altDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(altDir)) fs.mkdirSync(altDir, { recursive: true });
fs.copyFileSync(path.join(dir, 'clock-face-outer.png'), path.join(altDir, 'clock-face-outer.png'));
fs.copyFileSync(path.join(dir, 'pantheon-month-ring.png'), path.join(altDir, 'pantheon-month-ring.png'));
fs.copyFileSync(path.join(dir, 'pantheon-day-ring.png'), path.join(altDir, 'pantheon-day-ring.png'));
console.log('Copied to public/assets/');
