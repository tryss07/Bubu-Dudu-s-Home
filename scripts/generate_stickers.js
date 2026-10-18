/**
 * SVG Sticker Generator for Dudu and Bubu (Huang Xiao B style)
 * Generates high-res vector SVGs and exports them to 512x512 transparent PNGs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUBU_DIR = path.resolve(__dirname, '../assets/stickers_bubu');
const DUDU_DIR = path.resolve(__dirname, '../assets/stickers_dudu');
const COUPLE_DIR = path.resolve(__dirname, '../assets/stickers_couple');

[BUBU_DIR, DUDU_DIR, COUPLE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Common SVG definitions (Gradients & Filters)
const COMMON_DEFS = `
  <defs>
    <radialGradient id="bubuBlush" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF9E99" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#FFA8A3" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFA8A3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="duduBlush" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF8E85" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#FFA8A3" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FFA8A3" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="heartPinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF758C"/>
      <stop offset="100%" stop-color="#FF5277"/>
    </linearGradient>
    <linearGradient id="heartRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF4B4B"/>
      <stop offset="100%" stop-color="#D92027"/>
    </linearGradient>
    <linearGradient id="bobaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F2D1A0"/>
      <stop offset="100%" stop-color="#C59B6D"/>
    </linearGradient>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2F1FF"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="softShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#362213" flood-opacity="0.12"/>
    </filter>
  </defs>
`;

function wrapSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">\n${COMMON_DEFS}\n<g filter="url(#softShadow)">\n${body}\n</g>\n</svg>`;
}

// -------------------------------------------------------------
// Bubu Components (White Panda)
// -------------------------------------------------------------
function bubuHead(cx, cy, scale = 1) {
  return `
    <!-- Bubu Ears -->
    <circle cx="${cx - 98 * scale}" cy="${cy - 75 * scale}" r="${38 * scale}" fill="#2B2421" stroke="#2B2421" stroke-width="${4 * scale}"/>
    <circle cx="${cx + 98 * scale}" cy="${cy - 75 * scale}" r="${38 * scale}" fill="#2B2421" stroke="#2B2421" stroke-width="${4 * scale}"/>
    <!-- Bubu Head Contour -->
    <path d="M ${cx - 110 * scale} ${cy}
             C ${cx - 130 * scale} ${cy - 55 * scale}, ${cx - 75 * scale} ${cy - 100 * scale}, ${cx} ${cy - 100 * scale}
             C ${cx + 75 * scale} ${cy - 100 * scale}, ${cx + 130 * scale} ${cy - 55 * scale}, ${cx + 110 * scale} ${cy}
             C ${cx + 130 * scale} ${cy + 55 * scale}, ${cx + 95 * scale} ${cy + 95 * scale}, ${cx} ${cy + 95 * scale}
             C ${cx - 95 * scale} ${cy + 95 * scale}, ${cx - 130 * scale} ${cy + 55 * scale}, ${cx - 110 * scale} ${cy} Z"
          fill="#FFFFFF" stroke="#2B2421" stroke-width="${8 * scale}" stroke-linejoin="round"/>
    <!-- Blushing Cheeks -->
    <ellipse cx="${cx - 76 * scale}" cy="${cy + 25 * scale}" rx="${30 * scale}" ry="${18 * scale}" fill="url(#bubuBlush)"/>
    <ellipse cx="${cx + 76 * scale}" cy="${cy + 25 * scale}" rx="${30 * scale}" ry="${18 * scale}" fill="url(#bubuBlush)"/>
  `;
}

function bubuEyesNormal(cx, cy, scale = 1) {
  return `
    <!-- Left Eye Patch -->
    <ellipse cx="${cx - 56 * scale}" cy="${cy - 10 * scale}" rx="${21 * scale}" ry="${25 * scale}" fill="#2B2421" transform="rotate(-7 ${cx - 56 * scale} ${cy - 10 * scale})"/>
    <circle cx="${cx - 59 * scale}" cy="${cy - 14 * scale}" r="${7 * scale}" fill="#FFFFFF"/>
    <circle cx="${cx - 51 * scale}" cy="${cy - 5 * scale}" r="${3 * scale}" fill="#FFFFFF"/>
    <!-- Right Eye Patch -->
    <ellipse cx="${cx + 56 * scale}" cy="${cy - 10 * scale}" rx="${21 * scale}" ry="${25 * scale}" fill="#2B2421" transform="rotate(7 ${cx + 56 * scale} ${cy - 10 * scale})"/>
    <circle cx="${cx + 53 * scale}" cy="${cy - 14 * scale}" r="${7 * scale}" fill="#FFFFFF"/>
    <circle cx="${cx + 61 * scale}" cy="${cy - 5 * scale}" r="${3 * scale}" fill="#FFFFFF"/>
    <!-- Nose & Cat Mouth -->
    <ellipse cx="${cx}" cy="${cy + 5 * scale}" rx="${6 * scale}" ry="${4 * scale}" fill="#2B2421"/>
    <path d="M ${cx - 11 * scale} ${cy + 13 * scale} C ${cx - 6 * scale} ${cy + 20 * scale}, ${cx} ${cy + 20 * scale}, ${cx} ${cy + 13 * scale} C ${cx} ${cy + 20 * scale}, ${cx + 6 * scale} ${cy + 20 * scale}, ${cx + 11 * scale} ${cy + 13 * scale}"
          fill="none" stroke="#2B2421" stroke-width="${5.5 * scale}" stroke-linecap="round"/>
  `;
}

function bubuEyesWink(cx, cy, scale = 1) {
  return `
    <!-- Left Eye Patch (Happy open) -->
    <ellipse cx="${cx - 56 * scale}" cy="${cy - 10 * scale}" rx="${21 * scale}" ry="${25 * scale}" fill="#2B2421" transform="rotate(-7 ${cx - 56 * scale} ${cy - 10 * scale})"/>
    <circle cx="${cx - 59 * scale}" cy="${cy - 14 * scale}" r="${7 * scale}" fill="#FFFFFF"/>
    <circle cx="${cx - 51 * scale}" cy="${cy - 5 * scale}" r="${3 * scale}" fill="#FFFFFF"/>
    <!-- Right Eye Patch (Winking Curve) -->
    <path d="M ${cx + 38 * scale} ${cy - 8 * scale} Q ${cx + 56 * scale} ${cy - 22 * scale} ${cx + 74 * scale} ${cy - 8 * scale}"
          fill="none" stroke="#2B2421" stroke-width="${7 * scale}" stroke-linecap="round"/>
    <!-- Nose & Playful Mouth -->
    <ellipse cx="${cx}" cy="${cy + 5 * scale}" rx="${6 * scale}" ry="${4 * scale}" fill="#2B2421"/>
    <path d="M ${cx - 10 * scale} ${cy + 13 * scale} Q ${cx} ${cy + 26 * scale} ${cx + 12 * scale} ${cy + 14 * scale}"
          fill="#FF758C" stroke="#2B2421" stroke-width="${5 * scale}" stroke-linecap="round"/>
  `;
}

function bubuEyesHappyClosed(cx, cy, scale = 1) {
  return `
    <!-- Left Happy Eye Curve -->
    <path d="M ${cx - 72 * scale} ${cy - 8 * scale} Q ${cx - 56 * scale} ${cy - 24 * scale} ${cx - 40 * scale} ${cy - 8 * scale}"
          fill="none" stroke="#2B2421" stroke-width="${7.5 * scale}" stroke-linecap="round"/>
    <!-- Right Happy Eye Curve -->
    <path d="M ${cx + 40 * scale} ${cy - 8 * scale} Q ${cx + 56 * scale} ${cy - 24 * scale} ${cx + 72 * scale} ${cy - 8 * scale}"
          fill="none" stroke="#2B2421" stroke-width="${7.5 * scale}" stroke-linecap="round"/>
    <!-- Nose & Sweet Smile -->
    <ellipse cx="${cx}" cy="${cy + 5 * scale}" rx="${6 * scale}" ry="${4 * scale}" fill="#2B2421"/>
    <path d="M ${cx - 11 * scale} ${cy + 13 * scale} C ${cx - 6 * scale} ${cy + 21 * scale}, ${cx} ${cy + 21 * scale}, ${cx} ${cy + 13 * scale} C ${cx} ${cy + 21 * scale}, ${cx + 6 * scale} ${cy + 21 * scale}, ${cx + 11 * scale} ${cy + 13 * scale}"
          fill="none" stroke="#2B2421" stroke-width="${5.5 * scale}" stroke-linecap="round"/>
  `;
}

function bubuBody(cx, cy, scale = 1) {
  return `
    <!-- Feet -->
    <ellipse cx="${cx - 48 * scale}" cy="${cy + 105 * scale}" rx="${28 * scale}" ry="${20 * scale}" fill="#FFFFFF" stroke="#2B2421" stroke-width="${7.5 * scale}"/>
    <ellipse cx="${cx + 48 * scale}" cy="${cy + 105 * scale}" rx="${28 * scale}" ry="${20 * scale}" fill="#FFFFFF" stroke="#2B2421" stroke-width="${7.5 * scale}"/>
    <!-- Chubby White Body -->
    <ellipse cx="${cx}" cy="${cy + 30 * scale}" rx="${105 * scale}" ry="${88 * scale}" fill="#FFFFFF" stroke="#2B2421" stroke-width="${8 * scale}"/>
  `;
}

// -------------------------------------------------------------
// Dudu Components (Honey Brown Bear)
// -------------------------------------------------------------
function duduHead(cx, cy, scale = 1) {
  return `
    <!-- Dudu Ears -->
    <circle cx="${cx - 98 * scale}" cy="${cy - 75 * scale}" r="${38 * scale}" fill="#BA8358" stroke="#3E2723" stroke-width="${7.5 * scale}"/>
    <circle cx="${cx - 98 * scale}" cy="${cy - 75 * scale}" r="${22 * scale}" fill="#8C5935"/>
    <circle cx="${cx + 98 * scale}" cy="${cy - 75 * scale}" r="${38 * scale}" fill="#BA8358" stroke="#3E2723" stroke-width="${7.5 * scale}"/>
    <circle cx="${cx + 98 * scale}" cy="${cy - 75 * scale}" r="${22 * scale}" fill="#8C5935"/>
    <!-- Dudu Head Contour -->
    <path d="M ${cx - 110 * scale} ${cy}
             C ${cx - 130 * scale} ${cy - 55 * scale}, ${cx - 75 * scale} ${cy - 100 * scale}, ${cx} ${cy - 100 * scale}
             C ${cx + 75 * scale} ${cy - 100 * scale}, ${cx + 130 * scale} ${cy - 55 * scale}, ${cx + 110 * scale} ${cy}
             C ${cx + 130 * scale} ${cy + 55 * scale}, ${cx + 95 * scale} ${cy + 95 * scale}, ${cx} ${cy + 95 * scale}
             C ${cx - 95 * scale} ${cy + 95 * scale}, ${cx - 130 * scale} ${cy + 55 * scale}, ${cx - 110 * scale} ${cy} Z"
          fill="#BA8358" stroke="#3E2723" stroke-width="${8 * scale}" stroke-linejoin="round"/>
    <!-- Snout Muzzle -->
    <ellipse cx="${cx}" cy="${cy + 22 * scale}" rx="${50 * scale}" ry="${36 * scale}" fill="#F5E3D0" stroke="#3E2723" stroke-width="${5 * scale}"/>
    <!-- Blushing Cheeks -->
    <ellipse cx="${cx - 78 * scale}" cy="${cy + 22 * scale}" rx="${28 * scale}" ry="${16 * scale}" fill="url(#duduBlush)"/>
    <ellipse cx="${cx + 78 * scale}" cy="${cy + 22 * scale}" rx="${28 * scale}" ry="${16 * scale}" fill="url(#duduBlush)"/>
  `;
}

function duduEyesNormal(cx, cy, scale = 1) {
  return `
    <!-- Left Eye -->
    <circle cx="${cx - 58 * scale}" cy="${cy - 14 * scale}" r="${14 * scale}" fill="#3E2723"/>
    <circle cx="${cx - 61 * scale}" cy="${cy - 18 * scale}" r="${5 * scale}" fill="#FFFFFF"/>
    <circle cx="${cx - 54 * scale}" cy="${cy - 11 * scale}" r="${2.5 * scale}" fill="#FFFFFF"/>
    <!-- Right Eye -->
    <circle cx="${cx + 58 * scale}" cy="${cy - 14 * scale}" r="${14 * scale}" fill="#3E2723"/>
    <circle cx="${cx + 55 * scale}" cy="${cy - 18 * scale}" r="${5 * scale}" fill="#FFFFFF"/>
    <circle cx="${cx + 62 * scale}" cy="${cy - 11 * scale}" r="${2.5 * scale}" fill="#FFFFFF"/>
    <!-- Nose & Mouth on Snout -->
    <path d="M ${cx - 11 * scale} ${cy + 9 * scale} Q ${cx} ${cy + 3 * scale} ${cx + 11 * scale} ${cy + 9 * scale} Q ${cx} ${cy + 21 * scale} ${cx - 11 * scale} ${cy + 9 * scale} Z"
          fill="#3E2723"/>
    <path d="M ${cx - 11 * scale} ${cy + 26 * scale} C ${cx - 6 * scale} ${cy + 33 * scale}, ${cx} ${cy + 33 * scale}, ${cx} ${cy + 26 * scale} C ${cx} ${cy + 33 * scale}, ${cx + 6 * scale} ${cy + 33 * scale}, ${cx + 11 * scale} ${cy + 26 * scale}"
          fill="none" stroke="#3E2723" stroke-width="${5 * scale}" stroke-linecap="round"/>
  `;
}

function duduEyesHappy(cx, cy, scale = 1) {
  return `
    <!-- Left Happy Eye Curve -->
    <path d="M ${cx - 72 * scale} ${cy - 12 * scale} Q ${cx - 56 * scale} ${cy - 28 * scale} ${cx - 40 * scale} ${cy - 12 * scale}"
          fill="none" stroke="#3E2723" stroke-width="${7.5 * scale}" stroke-linecap="round"/>
    <!-- Right Happy Eye Curve -->
    <path d="M ${cx + 40 * scale} ${cy - 12 * scale} Q ${cx + 56 * scale} ${cy - 28 * scale} ${cx + 72 * scale} ${cy - 12 * scale}"
          fill="none" stroke="#3E2723" stroke-width="${7.5 * scale}" stroke-linecap="round"/>
    <!-- Nose & Open Mouth with Tongue -->
    <path d="M ${cx - 11 * scale} ${cy + 9 * scale} Q ${cx} ${cy + 3 * scale} ${cx + 11 * scale} ${cy + 9 * scale} Q ${cx} ${cy + 21 * scale} ${cx - 11 * scale} ${cy + 9 * scale} Z"
          fill="#3E2723"/>
    <path d="M ${cx - 12 * scale} ${cy + 26 * scale} Q ${cx} ${cy + 42 * scale} ${cx + 12 * scale} ${cy + 26 * scale} Z"
          fill="#FF758C" stroke="#3E2723" stroke-width="${4.5 * scale}"/>
  `;
}

function duduBody(cx, cy, scale = 1) {
  return `
    <!-- Feet -->
    <ellipse cx="${cx - 48 * scale}" cy="${cy + 105 * scale}" rx="${28 * scale}" ry="${20 * scale}" fill="#BA8358" stroke="#3E2723" stroke-width="${7.5 * scale}"/>
    <ellipse cx="${cx + 48 * scale}" cy="${cy + 105 * scale}" rx="${28 * scale}" ry="${20 * scale}" fill="#BA8358" stroke="#3E2723" stroke-width="${7.5 * scale}"/>
    <!-- Chubby Brown Body -->
    <ellipse cx="${cx}" cy="${cy + 30 * scale}" rx="${105 * scale}" ry="${88 * scale}" fill="#BA8358" stroke="#3E2723" stroke-width="${8 * scale}"/>
    <!-- Light Cream Belly -->
    <ellipse cx="${cx}" cy="${cy + 36 * scale}" rx="${60 * scale}" ry="${50 * scale}" fill="#F5E3D0"/>
  `;
}

// -------------------------------------------------------------
// STICKER GENERATOR MAPS
// -------------------------------------------------------------

const BUBU_STICKERS = [
  {
    name: 'bubu_love_heart',
    title: 'Bubu Peluk Hati Cinta (Love Heart)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesNormal(256, 205)}
      <!-- Giant Puffy Heart -->
      <path d="M 256 270 C 256 225, 185 190, 185 250 C 185 305, 256 360, 256 370 C 256 360, 327 305, 327 250 C 327 190, 256 225, 256 270 Z"
            fill="url(#heartPinkGrad)" stroke="#2B2421" stroke-width="7.5" stroke-linejoin="round"/>
      <path d="M 205 240 C 205 220, 228 215, 235 225" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <!-- Hugging Arms -->
      <path d="M 160 300 C 175 320, 205 325, 222 305" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5" stroke-linecap="round"/>
      <path d="M 352 300 C 337 320, 307 325, 290 305" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5" stroke-linecap="round"/>
      <!-- Sparkles -->
      <polygon points="120,165 124,177 136,181 124,185 120,197 116,185 104,181 116,177" fill="#FFD166"/>
      <polygon points="385,280 388,289 397,292 388,295 385,304 382,295 373,292 382,289" fill="#FFD166"/>
    `
  },
  {
    name: 'bubu_wave_hello',
    title: 'Bubu Halo Sayang (Wave Hello)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesHappyClosed(256, 205)}
      <!-- Left Resting Arm -->
      <ellipse cx="165" cy="330" rx="24" ry="18" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5"/>
      <!-- Waving Right Paw -->
      <path d="M 345 285 C 375 250, 395 210, 390 195 C 380 185, 360 215, 335 255 Z" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5" stroke-linejoin="round"/>
      <!-- Motion Wave Lines -->
      <path d="M 405 170 C 418 185, 418 205, 405 220" fill="none" stroke="#FF9E99" stroke-width="5" stroke-linecap="round"/>
      <path d="M 420 160 C 438 185, 438 215, 420 235" fill="none" stroke="#FF9E99" stroke-width="5" stroke-linecap="round"/>
      <!-- Speech Hello Badge -->
      <g transform="translate(70, 75)">
        <rect x="0" y="0" width="105" height="42" rx="21" fill="#FF758C" stroke="#2B2421" stroke-width="4.5"/>
        <text x="52" y="27" font-family="'Nunito', 'Comic Sans MS', sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" text-anchor="middle">Halo! ✨</text>
      </g>
    `
  },
  {
    name: 'bubu_boba_tea',
    title: 'Bubu Minum Boba (Boba Milk Tea)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesHappyClosed(256, 205)}
      <!-- Boba Cup -->
      <g transform="translate(216, 260)">
        <!-- Boba Cup Body -->
        <path d="M 12 40 L 18 110 C 20 120, 60 120, 62 110 L 68 40 Z" fill="url(#bobaGrad)" stroke="#2B2421" stroke-width="6"/>
        <!-- Milk Foam Top -->
        <rect x="10" y="32" width="60" height="15" rx="7" fill="#FFFFFF" stroke="#2B2421" stroke-width="5"/>
        <!-- Straw -->
        <rect x="35" y="-15" width="10" height="55" rx="3" fill="#FF758C" stroke="#2B2421" stroke-width="4" transform="rotate(-12 40 10)"/>
        <!-- Tapioca Pearls -->
        <circle cx="28" cy="100" r="6" fill="#2B2421"/>
        <circle cx="42" cy="104" r="6" fill="#2B2421"/>
        <circle cx="53" cy="98" r="6" fill="#2B2421"/>
        <circle cx="34" cy="88" r="5.5" fill="#2B2421"/>
        <circle cx="48" cy="90" r="5.5" fill="#2B2421"/>
      </g>
      <!-- Paws Holding Cup -->
      <ellipse cx="218" cy="315" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      <ellipse cx="294" cy="315" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
    `
  },
  {
    name: 'bubu_eating_bamboo',
    title: 'Bubu Makan Bambu (Sweet Bamboo)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesHappyClosed(256, 205)}
      <!-- Fresh Green Bamboo Shoot -->
      <g transform="translate(230, 220) rotate(25)">
        <rect x="0" y="0" width="22" height="110" rx="6" fill="#70C050" stroke="#2B2421" stroke-width="6"/>
        <line x1="0" y1="35" x2="22" y2="35" stroke="#2B2421" stroke-width="5"/>
        <line x1="0" y1="75" x2="22" y2="75" stroke="#2B2421" stroke-width="5"/>
        <!-- Leaves -->
        <path d="M 22 25 C 45 10, 60 25, 45 40 Z" fill="#90E060" stroke="#2B2421" stroke-width="4.5"/>
        <path d="M 0 65 C -25 50, -40 65, -25 80 Z" fill="#90E060" stroke="#2B2421" stroke-width="4.5"/>
      </g>
      <!-- Paws Clutching Bamboo -->
      <ellipse cx="230" cy="275" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      <ellipse cx="282" cy="295" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      <!-- Munch Chewing Crumbs -->
      <circle cx="280" cy="235" r="4" fill="#70C050"/>
      <circle cx="288" cy="242" r="3" fill="#70C050"/>
    `
  },
  {
    name: 'bubu_sleep_cloud',
    title: 'Bubu Bobo Cantik di Awan (Sleep Cloud)',
    svg: `
      <!-- Soft Dream Cloud -->
      <path d="M 120 380 
               C 80 380, 50 340, 75 300 
               C 60 260, 110 220, 150 235 
               C 175 190, 245 185, 275 225 
               C 310 195, 375 205, 395 250 
               C 440 260, 460 320, 430 360 
               C 455 400, 405 440, 360 425 
               C 320 450, 240 450, 200 425 
               C 160 445, 115 425, 120 380 Z"
            fill="url(#cloudGrad)" stroke="#3E2723" stroke-width="7" stroke-linejoin="round"/>
      <!-- Sleeping Curled Bubu -->
      <g transform="translate(30, 25)">
        <circle cx="165" cy="180" r="30" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
        <circle cx="310" cy="180" r="30" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
        <ellipse cx="240" cy="235" rx="85" ry="70" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5"/>
        <!-- Sleeping Eye Curves -->
        <path d="M 195 235 Q 210 248 225 235" fill="none" stroke="#2B2421" stroke-width="6" stroke-linecap="round"/>
        <path d="M 260 235 Q 275 248 290 235" fill="none" stroke="#2B2421" stroke-width="6" stroke-linecap="round"/>
        <!-- Soft Blush -->
        <ellipse cx="195" cy="250" rx="20" ry="12" fill="url(#bubuBlush)"/>
        <ellipse cx="290" cy="250" rx="20" ry="12" fill="url(#bubuBlush)"/>
        <!-- Cute Little Mouth -->
        <ellipse cx="242" cy="242" rx="4" ry="3" fill="#2B2421"/>
        <!-- Little Curled Paws -->
        <ellipse cx="225" cy="290" rx="16" ry="13" fill="#FFFFFF" stroke="#2B2421" stroke-width="6"/>
        <ellipse cx="260" cy="290" rx="16" ry="13" fill="#FFFFFF" stroke="#2B2421" stroke-width="6"/>
      </g>
      <!-- Floating Zzz -->
      <g fill="#7AA2F7" font-family="'Nunito', sans-serif" font-weight="900">
        <text x="360" y="160" font-size="28">z</text>
        <text x="390" y="125" font-size="36">Z</text>
        <text x="430" y="85" font-size="44">Z</text>
      </g>
    `
  },
  {
    name: 'bubu_flying_kiss',
    title: 'Bubu Cium Jauh (Flying Kiss)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesWink(256, 205)}
      <!-- Left Paw on Cheek -->
      <ellipse cx="170" cy="265" rx="20" ry="16" fill="#FFFFFF" stroke="#2B2421" stroke-width="7"/>
      <!-- Right Paw Blowing Kiss -->
      <ellipse cx="320" cy="245" rx="20" ry="16" fill="#FFFFFF" stroke="#2B2421" stroke-width="7"/>
      <!-- Floating Heart Kisses Trail -->
      <path d="M 335 220 Q 365 200 375 160 Q 380 120 420 100" fill="none" stroke="#FFA8A3" stroke-width="4" stroke-dasharray="6,6" stroke-linecap="round"/>
      <g transform="translate(370, 130) scale(0.65)">
        <path d="M 40 40 C 40 20, 10 0, 10 30 C 10 55, 40 85, 40 90 C 40 85, 70 55, 70 30 C 70 0, 40 20, 40 40 Z" fill="#FF5277" stroke="#2B2421" stroke-width="6"/>
      </g>
      <g transform="translate(415, 65) scale(0.95)">
        <path d="M 40 40 C 40 20, 10 0, 10 30 C 10 55, 40 85, 40 90 C 40 85, 70 55, 70 30 C 70 0, 40 20, 40 40 Z" fill="#FF5277" stroke="#2B2421" stroke-width="6"/>
      </g>
    `
  },
  {
    name: 'bubu_pout_ngambek',
    title: 'Bubu Ngambek Imut (Cute Pout)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      <!-- Angry Pout Eyes -->
      <path d="M 185 190 Q 200 178 215 190" fill="none" stroke="#2B2421" stroke-width="8" stroke-linecap="round"/>
      <circle cx="200" cy="198" r="9" fill="#2B2421"/>
      <circle cx="197" cy="195" r="3.5" fill="#FFFFFF"/>
      <path d="M 295 190 Q 310 178 325 190" fill="none" stroke="#2B2421" stroke-width="8" stroke-linecap="round"/>
      <circle cx="310" cy="198" r="9" fill="#2B2421"/>
      <circle cx="307" cy="195" r="3.5" fill="#FFFFFF"/>
      <!-- Puffed Pouty Mouth -->
      <path d="M 246 226 Q 256 220 266 226" fill="none" stroke="#2B2421" stroke-width="6" stroke-linecap="round"/>
      <!-- Extra Rosy Red Cheeks -->
      <ellipse cx="170" cy="235" rx="34" ry="22" fill="#FF758C" opacity="0.6"/>
      <ellipse cx="342" cy="235" rx="34" ry="22" fill="#FF758C" opacity="0.6"/>
      <!-- Arms Crossed -->
      <path d="M 175 320 C 210 345, 300 345, 335 320" fill="none" stroke="#2B2421" stroke-width="14" stroke-linecap="round"/>
      <path d="M 175 320 C 210 345, 300 345, 335 320" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
      <!-- Steam Puffs -->
      <path d="M 120 120 Q 100 100 115 80 Q 130 95 120 120 Z" fill="#DCE7F5" stroke="#2B2421" stroke-width="4"/>
      <path d="M 390 120 Q 410 100 395 80 Q 380 95 390 120 Z" fill="#DCE7F5" stroke="#2B2421" stroke-width="4"/>
      <!-- Anger Vein Symbol -->
      <g transform="translate(365, 140)">
        <path d="M 0 10 Q 15 10 15 25 M 10 0 Q 10 15 25 15 M 10 30 Q 10 15 25 15 M 0 20 Q 15 20 15 5" fill="none" stroke="#FF4757" stroke-width="4.5" stroke-linecap="round"/>
      </g>
    `
  },
  {
    name: 'bubu_happy_dance',
    title: 'Bubu Goyang Ceria (Happy Dance)',
    svg: `
      <!-- Tilting Body -->
      <g transform="rotate(6 256 320)">
        ${bubuBody(256, 320)}
        ${bubuHead(256, 205)}
        ${bubuEyesHappyClosed(256, 205)}
        <!-- Joyful Arms Up in the air -->
        <path d="M 170 290 C 145 250, 140 215, 160 205 C 175 195, 195 235, 190 270 Z" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5" stroke-linejoin="round"/>
        <path d="M 342 290 C 367 250, 372 215, 352 205 C 337 195, 317 235, 322 270 Z" fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5" stroke-linejoin="round"/>
      </g>
      <!-- Musical Notes -->
      <g fill="#FF758C" stroke="#2B2421" stroke-width="3.5">
        <path d="M 100 150 L 100 190 A 12 10 0 1 1 88 180 L 88 150 Z" />
        <path d="M 400 150 L 400 190 A 12 10 0 1 1 388 180 L 388 150 Z" />
      </g>
      <!-- Flower on head -->
      <g transform="translate(256, 110)">
        <circle cx="-12" cy="0" r="10" fill="#FFD166"/>
        <circle cx="12" cy="0" r="10" fill="#FFD166"/>
        <circle cx="0" cy="-12" r="10" fill="#FFD166"/>
        <circle cx="0" cy="12" r="10" fill="#FFD166"/>
        <circle cx="0" cy="0" r="8" fill="#FF5277"/>
      </g>
    `
  },
  {
    name: 'bubu_crying_baby',
    title: 'Bubu Menangis Terharu (Sparkle Tears)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      <!-- Big Teary Eyes -->
      <ellipse cx="200" cy="195" rx="22" ry="25" fill="#2B2421"/>
      <ellipse cx="312" cy="195" rx="22" ry="25" fill="#2B2421"/>
      <!-- Giant Glossy Liquid Tear Reflections -->
      <ellipse cx="197" cy="190" rx="14" ry="12" fill="#70A6FF"/>
      <circle cx="194" cy="186" r="6" fill="#FFFFFF"/>
      <circle cx="204" cy="196" r="3" fill="#FFFFFF"/>
      <ellipse cx="309" cy="190" rx="14" ry="12" fill="#70A6FF"/>
      <circle cx="306" cy="186" r="6" fill="#FFFFFF"/>
      <circle cx="316" cy="196" r="3" fill="#FFFFFF"/>
      <!-- Waterfall Stream Tears -->
      <path d="M 180 215 C 160 250, 165 310, 175 350 C 185 390, 155 420, 170 435" fill="none" stroke="#70A6FF" stroke-width="8" stroke-linecap="round"/>
      <path d="M 332 215 C 352 250, 347 310, 337 350 C 327 390, 357 420, 342 435" fill="none" stroke="#70A6FF" stroke-width="8" stroke-linecap="round"/>
      <!-- Sad Quivering Wavy Mouth -->
      <path d="M 242 230 Q 248 238 256 230 Q 264 238 270 230" fill="none" stroke="#2B2421" stroke-width="5.5" stroke-linecap="round"/>
      <!-- Tissue in Paw -->
      <ellipse cx="256" cy="305" rx="20" ry="16" fill="#FFFFFF" stroke="#2B2421" stroke-width="7"/>
      <path d="M 245 305 L 230 345 L 265 340 Z" fill="#E8F0FE" stroke="#2B2421" stroke-width="4.5"/>
    `
  },
  {
    name: 'bubu_blanket_burrito',
    title: 'Bubu Selimut Burrito (Cozy Burrito)',
    svg: `
      <!-- Wrapped Blanket Roll -->
      <ellipse cx="256" cy="330" rx="140" ry="110" fill="#FFB6C1" stroke="#2B2421" stroke-width="8"/>
      <path d="M 120 310 C 160 380, 350 380, 390 310 C 350 240, 160 240, 120 310 Z" fill="#FFA3B1" stroke="#2B2421" stroke-width="6"/>
      <!-- Blanket Stitching / Details -->
      <circle cx="180" cy="330" r="8" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="230" cy="370" r="8" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="310" cy="340" r="8" fill="#FFFFFF" opacity="0.8"/>
      <!-- Bubu Head Peeking Out -->
      ${bubuHead(256, 195, 0.9)}
      ${bubuEyesHappyClosed(256, 195, 0.9)}
      <!-- Little Paws Peeking over edge -->
      <ellipse cx="220" cy="275" rx="16" ry="13" fill="#FFFFFF" stroke="#2B2421" stroke-width="6"/>
      <ellipse cx="292" cy="275" rx="16" ry="13" fill="#FFFFFF" stroke="#2B2421" stroke-width="6"/>
    `
  },
  {
    name: 'bubu_shy_peek',
    title: 'Bubu Mengintip Malu (Shy Peek)',
    svg: `
      <!-- Wooden Wall Frame on Left -->
      <rect x="0" y="50" width="160" height="420" rx="12" fill="#DDB892" stroke="#2B2421" stroke-width="8"/>
      <line x1="160" y1="50" x2="160" y2="470" stroke="#7F5539" stroke-width="6"/>
      <!-- Peeking Head -->
      <g transform="translate(30, 20)">
        ${bubuHead(220, 230)}
        ${bubuEyesNormal(220, 230)}
        <!-- Clinging Paws on the Wall Edge -->
        <ellipse cx="130" cy="200" rx="16" ry="22" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
        <ellipse cx="130" cy="270" rx="16" ry="22" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      </g>
      <!-- Big Blushing Floating Heart -->
      <path d="M 370 160 C 370 140, 345 125, 345 150 C 345 175, 370 195, 370 200 C 370 195, 395 175, 395 150 C 395 125, 370 140, 370 160 Z" fill="#FF758C" stroke="#2B2421" stroke-width="5"/>
    `
  },
  {
    name: 'bubu_sparkle_excited',
    title: 'Bubu Bintang Berbinar (Starry Excited)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      <!-- Star Eyes -->
      <g fill="#FFD166" stroke="#2B2421" stroke-width="5">
        <polygon points="195,175 201,190 216,195 201,200 195,215 189,200 174,195 189,190"/>
        <polygon points="317,175 323,190 338,195 323,200 317,215 311,200 296,195 311,190"/>
      </g>
      <!-- Cheerful Open Mouth -->
      <path d="M 244 220 Q 256 242 268 220 Z" fill="#FF5277" stroke="#2B2421" stroke-width="5"/>
      <!-- Paws Clutched to Cheeks -->
      <ellipse cx="160" cy="245" rx="20" ry="16" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5" transform="rotate(-15 160 245)"/>
      <ellipse cx="352" cy="245" rx="20" ry="16" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5" transform="rotate(15 352 245)"/>
      <!-- Big Surrounding Golden Sparkles -->
      <g fill="#FFD166" stroke="#2B2421" stroke-width="4">
        <polygon points="100,120 106,132 118,136 106,140 100,152 94,140 82,136 94,132"/>
        <polygon points="410,120 416,132 428,136 416,140 410,152 404,140 392,136 404,132"/>
        <polygon points="380,310 384,319 393,322 384,325 380,334 376,325 367,322 376,319"/>
      </g>
    `
  },
  {
    name: 'bubu_eat_strawberry',
    title: 'Bubu Makan Stroberi (Sweet Strawberry)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesHappyClosed(256, 205)}
      <!-- Giant Strawberry -->
      <g transform="translate(256, 305)">
        <path d="M 0 -40 C 45 -40, 55 10, 0 50 C -55 10, -45 -40, 0 -40 Z" fill="#FF4757" stroke="#2B2421" stroke-width="7" stroke-linejoin="round"/>
        <!-- Green Leaves -->
        <path d="M 0 -40 C -15 -60, -35 -45, -25 -35 C 0 -42, 0 -42, 0 -40 Z" fill="#2ED573" stroke="#2B2421" stroke-width="4.5"/>
        <path d="M 0 -40 C 15 -60, 35 -45, 25 -35 C 0 -42, 0 -42, 0 -40 Z" fill="#2ED573" stroke="#2B2421" stroke-width="4.5"/>
        <circle cx="0" cy="-42" r="6" fill="#2ED573"/>
        <!-- Yellow Strawberry Seeds -->
        <ellipse cx="-15" cy="-10" rx="2.5" ry="4" fill="#FFA502"/>
        <ellipse cx="15" cy="-10" rx="2.5" ry="4" fill="#FFA502"/>
        <ellipse cx="0" cy="5" rx="2.5" ry="4" fill="#FFA502"/>
        <ellipse cx="-20" cy="15" rx="2.5" ry="4" fill="#FFA502"/>
        <ellipse cx="18" cy="15" rx="2.5" ry="4" fill="#FFA502"/>
        <ellipse cx="0" cy="28" rx="2" ry="3.5" fill="#FFA502"/>
      </g>
      <!-- Paws Holding Strawberry -->
      <ellipse cx="205" cy="300" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      <ellipse cx="307" cy="300" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
    `
  },
  {
    name: 'bubu_flower_crown',
    title: 'Bubu Mahkota Bunga (Flower Crown)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesNormal(256, 205)}
      <!-- Flower Crown -->
      <g transform="translate(256, 130)">
        <path d="M -90 10 Q 0 -15 90 10" fill="none" stroke="#2ED573" stroke-width="7" stroke-linecap="round"/>
        <!-- Flower 1 -->
        <circle cx="-60" cy="5" r="14" fill="#FF9FF3" stroke="#2B2421" stroke-width="4"/>
        <circle cx="-60" cy="5" r="6" fill="#FECA57"/>
        <!-- Flower 2 (Center) -->
        <circle cx="0" cy="-10" r="18" fill="#FF6B6B" stroke="#2B2421" stroke-width="4"/>
        <circle cx="0" cy="-10" r="8" fill="#FECA57"/>
        <!-- Flower 3 -->
        <circle cx="60" cy="5" r="14" fill="#54A0FF" stroke="#2B2421" stroke-width="4"/>
        <circle cx="60" cy="5" r="6" fill="#FECA57"/>
      </g>
      <!-- Shy Cute Paws -->
      <ellipse cx="225" cy="315" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      <ellipse cx="287" cy="315" rx="18" ry="15" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
    `
  },
  {
    name: 'bubu_cheering_pompoms',
    title: 'Bubu Semangat Pom-Pom (Cheering)',
    svg: `
      ${bubuBody(256, 320)}
      ${bubuHead(256, 205)}
      ${bubuEyesHappyClosed(256, 205)}
      <!-- Left Pom-Pom -->
      <g transform="translate(140, 180)">
        <circle cx="0" cy="0" r="40" fill="#FFD166" stroke="#2B2421" stroke-width="6"/>
        <circle cx="-15" cy="-15" r="25" fill="#FFA502"/>
        <circle cx="15" cy="15" r="25" fill="#FFA502"/>
        <circle cx="0" cy="0" r="20" fill="#FFEAA7"/>
      </g>
      <!-- Right Pom-Pom -->
      <g transform="translate(372, 180)">
        <circle cx="0" cy="0" r="40" fill="#FFD166" stroke="#2B2421" stroke-width="6"/>
        <circle cx="-15" cy="-15" r="25" fill="#FFA502"/>
        <circle cx="15" cy="15" r="25" fill="#FFA502"/>
        <circle cx="0" cy="0" r="20" fill="#FFEAA7"/>
      </g>
      <!-- Cheering Arms Raised -->
      <path d="M 190 280 L 155 200" stroke="#2B2421" stroke-width="14" stroke-linecap="round"/>
      <path d="M 190 280 L 155 200" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
      <path d="M 322 280 L 357 200" stroke="#2B2421" stroke-width="14" stroke-linecap="round"/>
      <path d="M 322 280 L 357 200" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
    `
  }
];

// -------------------------------------------------------------
// DUDU STICKERS (Brown Bear)
// -------------------------------------------------------------

const DUDU_STICKERS = [
  {
    name: 'dudu_giving_rose',
    title: 'Dudu Kasih Mawar Merah (Giving Rose)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Long Stem Red Rose -->
      <g transform="translate(256, 280)">
        <path d="M -30 60 Q 0 20 30 -20" fill="none" stroke="#2ED573" stroke-width="7" stroke-linecap="round"/>
        <path d="M -10 35 C -25 30, -35 40, -25 45 Z" fill="#2ED573" stroke="#3E2723" stroke-width="4"/>
        <!-- Rose Blossom -->
        <g transform="translate(32, -28)">
          <circle cx="0" cy="0" r="22" fill="#D92027" stroke="#3E2723" stroke-width="5"/>
          <path d="M -12 -6 C -6 -18, 12 -18, 14 -6 C 14 12, -6 16, -12 -6 Z" fill="#FF4757"/>
          <circle cx="0" cy="0" r="8" fill="#FF758C"/>
        </g>
      </g>
      <!-- Paws Offering Rose -->
      <ellipse cx="225" cy="315" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
      <ellipse cx="287" cy="295" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
      <!-- Romantic Floating Hearts -->
      <path d="M 130 150 C 130 135, 115 125, 115 140 C 115 155, 130 170, 130 175 C 130 170, 145 155, 145 140 C 145 125, 130 135, 130 150 Z" fill="#FF4757" stroke="#3E2723" stroke-width="4"/>
    `
  },
  {
    name: 'dudu_big_heart',
    title: 'Dudu Peluk Hati Merah (Big Red Heart)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesNormal(256, 205)}
      <!-- Giant Red Heart -->
      <path d="M 256 270 C 256 225, 185 190, 185 250 C 185 305, 256 360, 256 370 C 256 360, 327 305, 327 250 C 327 190, 256 225, 256 270 Z"
            fill="url(#heartRedGrad)" stroke="#3E2723" stroke-width="7.5" stroke-linejoin="round"/>
      <path d="M 205 240 C 205 220, 228 215, 235 225" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <!-- Hugging Arms -->
      <path d="M 160 300 C 175 320, 205 325, 222 305" fill="#BA8358" stroke="#3E2723" stroke-width="7.5" stroke-linecap="round"/>
      <path d="M 352 300 C 337 320, 307 325, 290 305" fill="#BA8358" stroke="#3E2723" stroke-width="7.5" stroke-linecap="round"/>
    `
  },
  {
    name: 'dudu_shy_peek',
    title: 'Dudu Mengintip Malu (Shy Peek)',
    svg: `
      <!-- Wooden Wall Frame on Right -->
      <rect x="352" y="50" width="160" height="420" rx="12" fill="#DDB892" stroke="#3E2723" stroke-width="8"/>
      <line x1="352" y1="50" x2="352" y2="470" stroke="#7F5539" stroke-width="6"/>
      <!-- Peeking Dudu -->
      <g transform="translate(-10, 20)">
        ${duduHead(270, 230)}
        ${duduEyesNormal(270, 230)}
        <!-- Clinging Paws on the Wall Edge -->
        <ellipse cx="360" cy="200" rx="16" ry="22" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
        <ellipse cx="360" cy="270" rx="16" ry="22" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      </g>
    `
  },
  {
    name: 'dudu_hungry_burger',
    title: 'Dudu Mau Burger Lezat (Hungry Burger)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Delicious Double Burger -->
      <g transform="translate(256, 310)">
        <!-- Top Bun -->
        <path d="M -45 -10 C -45 -35, 45 -35, 45 -10 Z" fill="#E5A65D" stroke="#3E2723" stroke-width="6"/>
        <ellipse cx="-20" cy="-22" rx="3" ry="1.5" fill="#FFF"/>
        <ellipse cx="0" cy="-25" rx="3" ry="1.5" fill="#FFF"/>
        <ellipse cx="22" cy="-20" rx="3" ry="1.5" fill="#FFF"/>
        <!-- Lettuce -->
        <path d="M -48 -10 Q -35 -2 -25 -10 Q -10 -2 0 -10 Q 15 -2 28 -10 Q 40 -2 48 -10" fill="none" stroke="#2ED573" stroke-width="6" stroke-linecap="round"/>
        <!-- Patty & Melted Cheese -->
        <rect x="-42" y="-5" width="84" height="12" rx="5" fill="#5D3A1A" stroke="#3E2723" stroke-width="5"/>
        <polygon points="-30,7 -15,16 0,7 18,17 35,7" fill="#FFA502"/>
        <!-- Bottom Bun -->
        <rect x="-44" y="10" width="88" height="16" rx="6" fill="#E5A65D" stroke="#3E2723" stroke-width="6"/>
      </g>
      <!-- Paws Holding Burger -->
      <ellipse cx="195" cy="315" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      <ellipse cx="317" cy="315" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      <!-- Drool Drop -->
      <path d="M 270 238 C 275 245, 275 255, 270 258 C 265 255, 265 245, 270 238 Z" fill="#70A6FF"/>
    `
  },
  {
    name: 'dudu_thumbs_up',
    title: 'Dudu Jempol Mantap (Thumbs Up)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Left Thumbs Up -->
      <g transform="translate(150, 260) rotate(-15)">
        <ellipse cx="0" cy="0" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
        <path d="M -5 -10 L -5 -32 C -5 -40, 10 -40, 10 -32 L 10 -10 Z" fill="#BA8358" stroke="#3E2723" stroke-width="6"/>
      </g>
      <!-- Right Thumbs Up -->
      <g transform="translate(362, 260) rotate(15)">
        <ellipse cx="0" cy="0" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
        <path d="M -10 -10 L -10 -32 C -10 -40, 5 -40, 5 -32 L 5 -10 Z" fill="#BA8358" stroke="#3E2723" stroke-width="6"/>
      </g>
      <!-- Glowing Stars -->
      <polygon points="256,60 262,75 278,78 265,89 269,105 256,96 243,105 247,89 234,78 250,75" fill="#FFD166" stroke="#3E2723" stroke-width="4"/>
    `
  },
  {
    name: 'dudu_sleepy_yawn',
    title: 'Dudu Mengantuk Menguap (Sleepy Yawn)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      <!-- Sleepy Nightcap on Head -->
      <g transform="translate(256, 125)">
        <path d="M -80 0 Q 0 -60 120 20 Q 80 40 0 10 Z" fill="#54A0FF" stroke="#3E2723" stroke-width="7"/>
        <line x1="-50" y1="-5" x2="-35" y2="10" stroke="#FFFFFF" stroke-width="8"/>
        <line x1="-15" y1="-20" x2="0" y2="-5" stroke="#FFFFFF" stroke-width="8"/>
        <line x1="25" y1="-15" x2="40" y2="0" stroke="#FFFFFF" stroke-width="8"/>
        <circle cx="120" cy="20" r="16" fill="#FFFFFF" stroke="#3E2723" stroke-width="5"/>
      </g>
      <!-- Closed Sleepy Eyes -->
      <path d="M 185 195 Q 200 205 215 195" fill="none" stroke="#3E2723" stroke-width="7" stroke-linecap="round"/>
      <path d="M 297 195 Q 312 205 327 195" fill="none" stroke="#3E2723" stroke-width="7" stroke-linecap="round"/>
      <!-- Giant Yawning Mouth -->
      <ellipse cx="256" cy="235" rx="22" ry="26" fill="#FF6B6B" stroke="#3E2723" stroke-width="6"/>
      <ellipse cx="256" cy="245" rx="14" ry="10" fill="#FF8E85"/>
      <!-- Sleep Bubble -->
      <circle cx="285" cy="180" r="16" fill="#DCE7F5" stroke="#3E2723" stroke-width="4" opacity="0.8"/>
      <circle cx="282" cy="176" r="4" fill="#FFFFFF"/>
    `
  },
  {
    name: 'dudu_crying_sniff',
    title: 'Dudu Menangis Meler (Crying Sniffle)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      <!-- Teary Eyes -->
      <circle cx="198" cy="192" r="15" fill="#3E2723"/>
      <ellipse cx="195" cy="188" rx="8" ry="6" fill="#70A6FF"/>
      <circle cx="193" cy="186" r="3" fill="#FFFFFF"/>
      <circle cx="314" cy="192" r="15" fill="#3E2723"/>
      <ellipse cx="311" cy="188" rx="8" ry="6" fill="#70A6FF"/>
      <circle cx="309" cy="186" r="3" fill="#FFFFFF"/>
      <!-- Stream Tears -->
      <path d="M 180 205 C 165 240, 168 280, 172 320" fill="none" stroke="#70A6FF" stroke-width="7" stroke-linecap="round"/>
      <path d="M 332 205 C 347 240, 344 280, 340 320" fill="none" stroke="#70A6FF" stroke-width="7" stroke-linecap="round"/>
      <!-- Runny Nose Snot -->
      <path d="M 256 226 C 256 235, 252 245, 256 250 C 260 245, 256 235, 256 226 Z" fill="#70A6FF"/>
      <!-- Paws Holding Handkerchief -->
      <ellipse cx="240" cy="305" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      <path d="M 230 300 L 210 340 L 250 335 Z" fill="#FFFFFF" stroke="#3E2723" stroke-width="4.5"/>
    `
  },
  {
    name: 'dudu_cool_sunglasses',
    title: 'Dudu Kacamata Keren (Cool Shades)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      <!-- Stylish Black Sunglasses -->
      <g transform="translate(256, 195)">
        <path d="M -80 -15 L -10 -15 L -20 22 L -70 22 Z" fill="#222222" stroke="#3E2723" stroke-width="6" stroke-linejoin="round"/>
        <line x1="-72" y1="-5" x2="-35" y2="15" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
        <line x1="-10" y1="-5" x2="10" y2="-5" stroke="#3E2723" stroke-width="6"/>
        <path d="M 10 -15 L 80 -15 L 70 22 L 20 22 Z" fill="#222222" stroke="#3E2723" stroke-width="6" stroke-linejoin="round"/>
        <line x1="18" y1="-5" x2="55" y2="15" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
      </g>
      <!-- Confident Smirk -->
      <path d="M 250 236 Q 262 244 274 232" fill="none" stroke="#3E2723" stroke-width="5.5" stroke-linecap="round"/>
      <!-- Sparkle on Glasses -->
      <polygon points="340,175 344,183 352,185 344,187 340,195 336,187 328,185 336,183" fill="#FFFFFF"/>
    `
  },
  {
    name: 'dudu_studying_laptop',
    title: 'Dudu Belajar Kerja Laptop (Hard Working)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesNormal(256, 205)}
      <!-- Desk Surface -->
      <rect x="90" y="360" width="332" height="20" rx="10" fill="#DDB892" stroke="#3E2723" stroke-width="7"/>
      <!-- Silver Laptop -->
      <g transform="translate(256, 335)">
        <!-- Screen -->
        <polygon points="-55,-60 55,-60 48,0 -48,0" fill="#E2E8F0" stroke="#3E2723" stroke-width="6"/>
        <polygon points="-46,-52 46,-52 40,-6 -40,-6" fill="#93C5FD"/>
        <!-- Apple/Bear logo on screen -->
        <circle cx="0" cy="-30" r="8" fill="#FFFFFF"/>
        <!-- Keyboard Base -->
        <polygon points="-65,25 65,25 50,0 -50,0" fill="#CBD5E1" stroke="#3E2723" stroke-width="6"/>
      </g>
      <!-- Coffee Mug with Steam -->
      <g transform="translate(140, 325)">
        <rect x="0" y="0" width="28" height="35" rx="5" fill="#FF758C" stroke="#3E2723" stroke-width="5"/>
        <path d="M 28 8 C 38 8, 38 25, 28 25" fill="none" stroke="#3E2723" stroke-width="4.5"/>
        <path d="M 10 -5 Q 15 -15 10 -22" fill="none" stroke="#FFA8A3" stroke-width="3" stroke-linecap="round"/>
      </g>
    `
  },
  {
    name: 'dudu_panic_sweat',
    title: 'Dudu Panik Kaget (Panic Shock)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      <!-- Shocked Tiny Dot Eyes -->
      <circle cx="198" cy="192" r="8" fill="#3E2723"/>
      <circle cx="314" cy="192" r="8" fill="#3E2723"/>
      <!-- Comical Wavy Mouth -->
      <path d="M 235 235 Q 242 225 250 235 Q 258 245 266 235 Q 274 225 280 235" fill="none" stroke="#3E2723" stroke-width="6" stroke-linecap="round"/>
      <!-- Giant Comic Sweat Drop -->
      <g transform="translate(350, 140)">
        <path d="M 0 0 C 15 20, 25 35, 15 50 C 5 62, -15 62, -25 50 C -35 35, -15 20, 0 0 Z" fill="#70A6FF" stroke="#3E2723" stroke-width="5"/>
        <ellipse cx="-5" cy="42" rx="5" ry="8" fill="#FFFFFF" opacity="0.8"/>
      </g>
      <!-- Panic Lines -->
      <line x1="120" y1="160" x2="90" y2="150" stroke="#3E2723" stroke-width="5" stroke-linecap="round"/>
      <line x1="115" y1="180" x2="85" y2="180" stroke="#3E2723" stroke-width="5" stroke-linecap="round"/>
      <line x1="120" y1="200" x2="90" y2="210" stroke="#3E2723" stroke-width="5" stroke-linecap="round"/>
    `
  },
  {
    name: 'dudu_boba_cheers',
    title: 'Dudu Bersulang Boba (Boba Cheers)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Large Boba Cup Held High -->
      <g transform="translate(300, 210) rotate(15)">
        <path d="M 12 40 L 18 110 C 20 120, 60 120, 62 110 L 68 40 Z" fill="url(#bobaGrad)" stroke="#3E2723" stroke-width="6"/>
        <rect x="10" y="32" width="60" height="15" rx="7" fill="#FFFFFF" stroke="#3E2723" stroke-width="5"/>
        <rect x="35" y="-15" width="10" height="55" rx="3" fill="#54A0FF" stroke="#3E2723" stroke-width="4" transform="rotate(-10 40 10)"/>
        <!-- Pearls -->
        <circle cx="28" cy="100" r="6" fill="#3E2723"/>
        <circle cx="42" cy="104" r="6" fill="#3E2723"/>
        <circle cx="53" cy="98" r="6" fill="#3E2723"/>
      </g>
      <!-- Raising Paw -->
      <ellipse cx="320" cy="270" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
    `
  },
  {
    name: 'dudu_cheer_pompoms',
    title: 'Dudu Sorak Semangat (Cheer Pompom)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Left Orange Pom-Pom -->
      <g transform="translate(140, 180)">
        <circle cx="0" cy="0" r="40" fill="#FFA502" stroke="#3E2723" stroke-width="6"/>
        <circle cx="-15" cy="-15" r="25" fill="#FF7F50"/>
        <circle cx="15" cy="15" r="25" fill="#FF7F50"/>
        <circle cx="0" cy="0" r="20" fill="#FFD166"/>
      </g>
      <!-- Right Orange Pom-Pom -->
      <g transform="translate(372, 180)">
        <circle cx="0" cy="0" r="40" fill="#FFA502" stroke="#3E2723" stroke-width="6"/>
        <circle cx="-15" cy="-15" r="25" fill="#FF7F50"/>
        <circle cx="15" cy="15" r="25" fill="#FF7F50"/>
        <circle cx="0" cy="0" r="20" fill="#FFD166"/>
      </g>
      <!-- Arms Raised -->
      <path d="M 190 280 L 155 200" stroke="#3E2723" stroke-width="14" stroke-linecap="round"/>
      <path d="M 190 280 L 155 200" stroke="#BA8358" stroke-width="8" stroke-linecap="round"/>
      <path d="M 322 280 L 357 200" stroke="#3E2723" stroke-width="14" stroke-linecap="round"/>
      <path d="M 322 280 L 357 200" stroke="#BA8358" stroke-width="8" stroke-linecap="round"/>
    `
  },
  {
    name: 'dudu_belly_pat',
    title: 'Dudu Kenyang Tepuk Perut (Full Tummy)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Both Paws Patting Round Belly -->
      <ellipse cx="205" cy="355" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
      <ellipse cx="307" cy="355" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
      <!-- Satisfied Sound Lines -->
      <path d="M 230 405 C 245 415, 267 415, 282 405" fill="none" stroke="#FF7F50" stroke-width="5" stroke-linecap="round"/>
    `
  },
  {
    name: 'dudu_confused_scratch',
    title: 'Dudu Bingung Garuk Kepala (Confused Question)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      <!-- Tilted Asymmetric Eyes -->
      <circle cx="198" cy="188" r="14" fill="#3E2723"/>
      <circle cx="195" cy="184" r="5" fill="#FFFFFF"/>
      <circle cx="314" cy="196" r="11" fill="#3E2723"/>
      <circle cx="312" cy="193" r="4" fill="#FFFFFF"/>
      <!-- Wavy Skeptical Mouth -->
      <path d="M 245 235 Q 256 226 267 235" fill="none" stroke="#3E2723" stroke-width="5.5" stroke-linecap="round"/>
      <!-- Paw Scratching Ear -->
      <path d="M 330 280 C 365 240, 375 160, 350 140 C 335 130, 315 150, 335 180 Z" fill="#BA8358" stroke="#3E2723" stroke-width="7" stroke-linejoin="round"/>
      <!-- Giant Comic Question Mark -->
      <g transform="translate(100, 90)">
        <text x="0" y="50" font-family="'Nunito', sans-serif" font-size="70" font-weight="900" fill="#FF7F50" stroke="#3E2723" stroke-width="4">?</text>
      </g>
    `
  },
  {
    name: 'dudu_guitar_serenade',
    title: 'Dudu Main Gitar Lagu Cinta (Guitar Serenade)',
    svg: `
      ${duduBody(256, 320)}
      ${duduHead(256, 205)}
      ${duduEyesHappy(256, 205)}
      <!-- Acoustic Guitar -->
      <g transform="translate(256, 330) rotate(-25)">
        <!-- Neck -->
        <rect x="-10" y="-120" width="20" height="90" fill="#8C5935" stroke="#3E2723" stroke-width="5"/>
        <rect x="-14" y="-140" width="28" height="25" rx="4" fill="#5D3A1A" stroke="#3E2723" stroke-width="4"/>
        <!-- Body 8-shape -->
        <circle cx="0" cy="-15" r="32" fill="#E5A65D" stroke="#3E2723" stroke-width="6"/>
        <circle cx="0" cy="30" r="46" fill="#E5A65D" stroke="#3E2723" stroke-width="6"/>
        <!-- Soundhole -->
        <circle cx="0" cy="0" r="14" fill="#3E2723"/>
      </g>
      <!-- Strumming Paws -->
      <ellipse cx="205" cy="300" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      <ellipse cx="280" cy="340" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      <!-- Floating Colorful Musical Notes -->
      <g fill="#FF4757" stroke="#3E2723" stroke-width="3">
        <path d="M 380 140 L 380 175 A 10 8 0 1 1 370 167 L 370 140 Z" />
        <path d="M 120 180 L 120 215 A 10 8 0 1 1 110 207 L 110 180 Z" />
      </g>
    `
  }
];

// -------------------------------------------------------------
// COUPLE STICKERS (Bubu & Dudu Berdua)
// -------------------------------------------------------------

const COUPLE_STICKERS = [
  {
    name: 'couple_warm_hug',
    title: 'Pelukan Hangat Berdua (Warm Loving Hug)',
    svg: `
      <!-- Dudu Body & Head (Right) -->
      ${duduBody(315, 310, 0.95)}
      ${duduHead(315, 205, 0.95)}
      ${duduEyesHappy(315, 205, 0.95)}
      <!-- Bubu Body & Head (Left) Leaning In -->
      <g transform="translate(-10, 10)">
        ${bubuBody(195, 310, 0.95)}
        ${bubuHead(195, 205, 0.95)}
        ${bubuEyesHappyClosed(195, 205, 0.95)}
      </g>
      <!-- Hugging Arms Wrapped Around Each Other -->
      <!-- Dudu Arm Hugging Bubu -->
      <path d="M 340 280 C 290 310, 200 310, 175 270" fill="none" stroke="#3E2723" stroke-width="16" stroke-linecap="round"/>
      <path d="M 340 280 C 290 310, 200 310, 175 270" fill="none" stroke="#BA8358" stroke-width="10" stroke-linecap="round"/>
      <!-- Bubu Arm Hugging Dudu -->
      <path d="M 170 290 C 220 320, 310 320, 335 280" fill="none" stroke="#2B2421" stroke-width="16" stroke-linecap="round"/>
      <path d="M 170 290 C 220 320, 310 320, 335 280" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>
      <!-- Giant Sweet Floating Heart Above Heads -->
      <g transform="translate(256, 100) scale(1.1)">
        <path d="M 0 -20 C 0 -45, -35 -45, -35 -15 C -35 15, 0 45, 0 50 C 0 45, 35 15, 35 -15 C 35 -45, 0 -45, 0 -20 Z"
              fill="url(#heartPinkGrad)" stroke="#2B2421" stroke-width="6"/>
      </g>
    `
  },
  {
    name: 'couple_cheek_squish',
    title: 'Cubitan Pipi Manis (Cheek Squish)',
    svg: `
      <!-- Dudu Sitting Proud -->
      ${duduBody(330, 320, 0.9)}
      ${duduHead(330, 215, 0.9)}
      ${duduEyesHappy(330, 215, 0.9)}
      <!-- Bubu with Cheeks Stretched -->
      <g transform="translate(-15, 10)">
        ${bubuBody(185, 320, 0.9)}
        <!-- Bubu Head with Squished Cheeks -->
        <circle cx="105" cy="155" r="32" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
        <circle cx="265" cy="155" r="32" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
        <!-- Extra Wide Squished Face Shape -->
        <path d="M 85 220 C 70 170, 120 130, 185 130 C 250 130, 300 170, 285 220 C 310 260, 260 300, 185 300 C 110 300, 60 260, 85 220 Z"
              fill="#FFFFFF" stroke="#2B2421" stroke-width="7.5"/>
        <!-- Silly Squished Eyes -->
        <ellipse cx="145" cy="210" rx="15" ry="18" fill="#2B2421"/>
        <circle cx="143" cy="207" r="5" fill="#FFFFFF"/>
        <ellipse cx="225" cy="210" rx="15" ry="18" fill="#2B2421"/>
        <circle cx="223" cy="207" r="5" fill="#FFFFFF"/>
        <!-- Squished Round Pucker Mouth -->
        <circle cx="185" cy="235" r="8" fill="#FF5277" stroke="#2B2421" stroke-width="4"/>
      </g>
      <!-- Dudu Paws Pinching Cheeks -->
      <ellipse cx="145" cy="245" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6"/>
      <ellipse cx="245" cy="245" rx="18" ry="15" fill="#BA8358" stroke="#3E2723" stroke-width="6"/>
      <!-- Heart Bubbles -->
      <path d="M 200 110 C 200 95, 185 85, 185 100 C 185 115, 200 130, 200 135 C 200 130, 215 115, 215 100 C 215 85, 200 95, 200 110 Z" fill="#FF758C" stroke="#2B2421" stroke-width="4"/>
    `
  },
  {
    name: 'couple_sleeping_cloud',
    title: 'Tidur Berdua di Awan (Sleeping Together)',
    svg: `
      <!-- Fluffy Cloud -->
      <path d="M 100 400 
               C 60 400, 30 350, 60 310 
               C 40 260, 100 220, 150 240 
               C 180 190, 270 180, 320 225 
               C 360 195, 435 210, 455 265 
               C 500 280, 500 355, 460 390 
               C 475 440, 410 465, 360 440 
               C 310 465, 200 465, 160 440 
               C 120 455, 80 435, 100 400 Z"
            fill="url(#cloudGrad)" stroke="#3E2723" stroke-width="7.5" stroke-linejoin="round"/>
      <!-- Curled Sleeping Dudu (Right) -->
      <g transform="translate(110, 15)">
        <circle cx="230" cy="180" r="28" fill="#BA8358" stroke="#3E2723" stroke-width="6"/>
        <ellipse cx="190" cy="240" rx="75" ry="60" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
        <ellipse cx="180" cy="250" rx="35" ry="25" fill="#F5E3D0"/>
        <path d="M 170 235 Q 185 245 200 235" fill="none" stroke="#3E2723" stroke-width="6" stroke-linecap="round"/>
      </g>
      <!-- Curled Sleeping Bubu (Left) Snuggled into Dudu -->
      <g transform="translate(-10, 30)">
        <circle cx="160" cy="185" r="28" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
        <ellipse cx="200" cy="235" rx="75" ry="60" fill="#FFFFFF" stroke="#2B2421" stroke-width="7"/>
        <path d="M 180 230 Q 195 242 210 230" fill="none" stroke="#2B2421" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="180" cy="245" rx="18" ry="10" fill="url(#bubuBlush)"/>
      </g>
      <!-- Starry Night Blanket Over Bodies -->
      <path d="M 160 280 C 230 250, 330 250, 390 290 C 370 370, 180 370, 160 280 Z" fill="#7AA2F7" stroke="#3E2723" stroke-width="7"/>
      <!-- Stars on Blanket -->
      <polygon points="240,300 243,306 250,308 243,310 240,316 237,310 230,308 237,306" fill="#FFEAA7"/>
      <polygon points="310,310 313,316 320,318 313,320 310,326 307,320 300,318 307,316" fill="#FFEAA7"/>
      <!-- Double Zzz -->
      <text x="360" y="140" font-family="'Nunito', sans-serif" font-size="28" font-weight="900" fill="#FF758C">Zzz...</text>
    `
  },
  {
    name: 'couple_share_boba',
    title: 'Bagi Boba Berdua (Share Boba Milk Tea)',
    svg: `
      <!-- Bubu (Left) -->
      ${bubuBody(180, 310, 0.9)}
      ${bubuHead(180, 205, 0.9)}
      ${bubuEyesHappyClosed(180, 205, 0.9)}
      <!-- Dudu (Right) -->
      ${duduBody(332, 310, 0.9)}
      ${duduHead(332, 205, 0.9)}
      ${duduEyesHappy(332, 205, 0.9)}
      <!-- Center Shared Jumbo Boba Cup -->
      <g transform="translate(256, 280)">
        <path d="M -30 30 L -22 110 C -20 125, 20 125, 22 110 L 30 30 Z" fill="url(#bobaGrad)" stroke="#3E2723" stroke-width="6.5"/>
        <rect x="-34" y="20" width="68" height="18" rx="8" fill="#FFFFFF" stroke="#3E2723" stroke-width="5"/>
        <!-- Straw to Bubu (Left) -->
        <path d="M -8 20 L -12 -15 L -45 -35" fill="none" stroke="#FF758C" stroke-width="7" stroke-linecap="round"/>
        <!-- Straw to Dudu (Right) -->
        <path d="M 8 20 L 12 -15 L 45 -35" fill="none" stroke="#54A0FF" stroke-width="7" stroke-linecap="round"/>
        <!-- Pearls -->
        <circle cx="-10" cy="95" r="7" fill="#3E2723"/>
        <circle cx="10" cy="98" r="7" fill="#3E2723"/>
        <circle cx="0" cy="85" r="6.5" fill="#3E2723"/>
      </g>
      <!-- Hearts -->
      <path d="M 256 160 C 256 145, 240 135, 240 150 C 240 165, 256 180, 256 185 C 256 180, 272 165, 272 150 C 272 135, 256 145, 256 160 Z" fill="#FF4757" stroke="#3E2723" stroke-width="4"/>
    `
  },
  {
    name: 'couple_forehead_kiss',
    title: 'Cium Kening Mesra (Forehead Kiss)',
    svg: `
      <!-- Bubu (Left) with closed bliss eyes and blushing -->
      ${bubuBody(190, 310, 0.95)}
      ${bubuHead(190, 215, 0.95)}
      ${bubuEyesHappyClosed(190, 215, 0.95)}
      <!-- Dudu (Right) Leaning in kissing forehead -->
      <g transform="translate(45, -10) rotate(-15 320 220)">
        ${duduBody(300, 310, 0.95)}
        ${duduHead(300, 205, 0.95)}
        ${duduEyesHappy(300, 205, 0.95)}
      </g>
      <!-- Tender Loving Hearts -->
      <g transform="translate(230, 110)">
        <path d="M 20 20 C 20 5, 0 -5, 0 10 C 0 25, 20 40, 20 45 C 20 40, 40 25, 40 10 C 40 -5, 20 5, 20 20 Z" fill="#FF5277" stroke="#2B2421" stroke-width="4.5"/>
      </g>
    `
  },
  {
    name: 'couple_piggyback',
    title: 'Gendong Punggung Manis (Piggyback Ride)',
    svg: `
      <!-- Dudu Carrying (Bottom) -->
      ${duduBody(256, 340, 1.05)}
      ${duduHead(256, 250, 1.0)}
      ${duduEyesHappy(256, 250, 1.0)}
      <!-- Bubu on Dudu Shoulders (Top) -->
      <g transform="translate(0, -110)">
        ${bubuHead(256, 200, 0.9)}
        ${bubuEyesHappyClosed(256, 200, 0.9)}
        <!-- Bubu Arms Raised Cheering -->
        <ellipse cx="160" cy="180" rx="18" ry="14" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
        <ellipse cx="352" cy="180" rx="18" ry="14" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
      </g>
      <!-- Dudu Hands Holding Bubu Legs -->
      <ellipse cx="170" cy="310" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
      <ellipse cx="342" cy="310" rx="20" ry="16" fill="#BA8358" stroke="#3E2723" stroke-width="7"/>
    `
  },
  {
    name: 'couple_umbrella_rain',
    title: 'Payung Daun Berdua (Leaf Umbrella)',
    svg: `
      <!-- Rain Droplets Background -->
      <g stroke="#70A6FF" stroke-width="4" stroke-linecap="round">
        <line x1="80" y1="80" x2="65" y2="120"/>
        <line x1="120" y1="200" x2="105" y2="240"/>
        <line x1="430" y1="90" x2="415" y2="130"/>
        <line x1="450" y1="230" x2="435" y2="270"/>
      </g>
      <!-- Bubu & Dudu Snuggled Under Leaf -->
      ${bubuBody(190, 330, 0.9)}
      ${bubuHead(190, 235, 0.9)}
      ${bubuEyesHappyClosed(190, 235, 0.9)}
      ${duduBody(322, 330, 0.9)}
      ${duduHead(322, 235, 0.9)}
      ${duduEyesHappy(322, 235, 0.9)}
      <!-- Giant Green Leaf Umbrella -->
      <g transform="translate(256, 120)">
        <!-- Stem held by Dudu -->
        <path d="M 60 170 Q 50 80 0 10" fill="none" stroke="#2ED573" stroke-width="9" stroke-linecap="round"/>
        <!-- Big Leaf Canopy -->
        <path d="M -160 20 C -120 -60, 120 -60, 160 20 C 80 10, -80 10, -160 20 Z" fill="#2ED573" stroke="#3E2723" stroke-width="7" stroke-linejoin="round"/>
        <!-- Leaf Veins -->
        <path d="M 0 -35 L 0 15 M -80 -10 L -40 -5 M 80 -10 L 40 -5" stroke="#10AC84" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Water drop slipping off leaf edge -->
        <circle cx="160" cy="28" r="5" fill="#70A6FF"/>
      </g>
    `
  },
  {
    name: 'couple_eating_pizza',
    title: 'Makan Pizza Keju Bareng (Pizza Date)',
    svg: `
      ${bubuBody(180, 310, 0.9)}
      ${bubuHead(180, 205, 0.9)}
      ${bubuEyesHappyClosed(180, 205, 0.9)}
      ${duduBody(332, 310, 0.9)}
      ${duduHead(332, 205, 0.9)}
      ${duduEyesHappy(332, 205, 0.9)}
      <!-- Slice of Pizza with Stretching Cheese -->
      <g transform="translate(256, 290)">
        <polygon points="-40,-10 0,45 40,-10" fill="#FFA502" stroke="#3E2723" stroke-width="6"/>
        <!-- Crust -->
        <path d="M -45 -10 Q 0 -22 45 -10" fill="none" stroke="#E5A65D" stroke-width="12" stroke-linecap="round"/>
        <!-- Pepperoni -->
        <circle cx="-12" cy="5" r="7" fill="#D92027"/>
        <circle cx="12" cy="8" r="6" fill="#D92027"/>
        <!-- Stretching Melted Cheese Strands to Mouths -->
        <path d="M -15 -10 Q -45 -40 -60 -45" fill="none" stroke="#FFD166" stroke-width="5" stroke-linecap="round"/>
        <path d="M 15 -10 Q 45 -40 60 -45" fill="none" stroke="#FFD166" stroke-width="5" stroke-linecap="round"/>
      </g>
      <!-- Paws Holding Pizza -->
      <ellipse cx="210" cy="305" rx="16" ry="14" fill="#FFFFFF" stroke="#2B2421" stroke-width="6"/>
      <ellipse cx="302" cy="305" rx="16" ry="14" fill="#BA8358" stroke="#3E2723" stroke-width="6"/>
    `
  },
  {
    name: 'couple_game_switch',
    title: 'Mabar Nintendo Switch (Game Time)',
    svg: `
      ${bubuBody(180, 310, 0.9)}
      ${bubuHead(180, 205, 0.9)}
      ${bubuEyesNormal(180, 205, 0.9)}
      ${duduBody(332, 310, 0.9)}
      ${duduHead(332, 205, 0.9)}
      ${duduEyesNormal(332, 205, 0.9)}
      <!-- Bubu Blue Joycon -->
      <g transform="translate(200, 290) rotate(15)">
        <rect x="-14" y="-28" width="28" height="56" rx="12" fill="#54A0FF" stroke="#2B2421" stroke-width="5"/>
        <circle cx="0" cy="-12" r="6" fill="#2B2421"/>
        <circle cx="0" cy="10" r="4" fill="#2B2421"/>
      </g>
      <!-- Dudu Red Joycon -->
      <g transform="translate(312, 290) rotate(-15)">
        <rect x="-14" y="-28" width="28" height="56" rx="12" fill="#FF4757" stroke="#3E2723" stroke-width="5"/>
        <circle cx="0" cy="-12" r="6" fill="#2B2421"/>
        <circle cx="0" cy="10" r="4" fill="#2B2421"/>
      </g>
      <!-- Victory Sparkles -->
      <polygon points="256,120 260,132 272,135 260,138 256,150 252,138 240,135 252,132" fill="#FFD166"/>
    `
  },
  {
    name: 'couple_head_pat',
    title: 'Elusan Kepala Lembut (Head Pat)',
    svg: `
      <!-- Bubu (Left) Looking up happily purring -->
      ${bubuBody(190, 320, 0.9)}
      ${bubuHead(190, 225, 0.9)}
      ${bubuEyesHappyClosed(190, 225, 0.9)}
      <!-- Dudu (Right) Gently Patting Bubu -->
      ${duduBody(330, 310, 0.95)}
      ${duduHead(330, 205, 0.95)}
      ${duduEyesHappy(330, 205, 0.95)}
      <!-- Dudu Arm Extended to Bubu Head -->
      <path d="M 310 270 Q 250 180 195 155" fill="none" stroke="#3E2723" stroke-width="15" stroke-linecap="round"/>
      <path d="M 310 270 Q 250 180 195 155" fill="none" stroke="#BA8358" stroke-width="9" stroke-linecap="round"/>
      <!-- Dudu Paw on Bubu Head -->
      <ellipse cx="190" cy="150" rx="26" ry="18" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      <!-- Soft Warmth Sparkles -->
      <g fill="#FF758C">
        <circle cx="160" cy="120" r="6"/>
        <circle cx="215" cy="115" r="8"/>
        <circle cx="140" cy="140" r="5"/>
      </g>
    `
  },
  {
    name: 'couple_holding_hands',
    title: 'Gandengan Tangan Bahagia (Holding Hands)',
    svg: `
      <!-- Bubu (Left) Walking -->
      ${bubuBody(190, 310, 0.95)}
      ${bubuHead(190, 205, 0.95)}
      ${bubuEyesHappyClosed(190, 205, 0.95)}
      <!-- Dudu (Right) Walking -->
      ${duduBody(322, 310, 0.95)}
      ${duduHead(322, 205, 0.95)}
      ${duduEyesHappy(322, 205, 0.95)}
      <!-- Paws Interlocked Holding Hands in Center -->
      <g transform="translate(256, 315)">
        <ellipse cx="-12" cy="0" rx="18" ry="14" fill="#FFFFFF" stroke="#2B2421" stroke-width="6.5"/>
        <ellipse cx="12" cy="0" rx="18" ry="14" fill="#BA8358" stroke="#3E2723" stroke-width="6.5"/>
      </g>
      <!-- Floating Hearts -->
      <path d="M 256 120 C 256 100, 230 90, 230 110 C 230 130, 256 150, 256 155 C 256 150, 282 130, 282 110 C 282 90, 256 100, 256 120 Z" fill="#FF5277" stroke="#2B2421" stroke-width="5"/>
    `
  },
  {
    name: 'couple_blanket_cuddle',
    title: 'Selimutan Hangat Cokelat (Blanket Cuddle)',
    svg: `
      <!-- Night Sky Backdrop Pill -->
      <rect x="70" y="80" width="372" height="360" rx="40" fill="#2D3436" stroke="#3E2723" stroke-width="7"/>
      <!-- Moon & Stars inside window -->
      <circle cx="370" cy="140" r="28" fill="#FEEAA7"/>
      <circle cx="380" cy="135" r="24" fill="#2D3436"/>
      <circle cx="130" cy="140" r="4" fill="#FFF"/>
      <circle cx="180" cy="115" r="3" fill="#FFF"/>
      <circle cx="280" cy="120" r="3" fill="#FFF"/>
      <!-- Heads Side by Side -->
      ${bubuHead(200, 240, 0.85)}
      ${bubuEyesHappyClosed(200, 240, 0.85)}
      ${duduHead(312, 240, 0.85)}
      ${duduEyesHappy(312, 240, 0.85)}
      <!-- Warm Quilt Covering Bodies -->
      <path d="M 100 290 C 210 260, 310 260, 412 290 L 412 430 L 100 430 Z" fill="#E17055" stroke="#3E2723" stroke-width="7"/>
      <!-- Quilt Pattern -->
      <line x1="100" y1="360" x2="412" y2="360" stroke="#FAB1A0" stroke-width="5"/>
      <line x1="256" y1="290" x2="256" y2="430" stroke="#FAB1A0" stroke-width="5"/>
      <!-- Steaming Hot Cocoa Mug -->
      <g transform="translate(256, 340)">
        <rect x="-18" y="0" width="36" height="35" rx="6" fill="#F8EFBA" stroke="#3E2723" stroke-width="4.5"/>
        <path d="M -4 -8 Q 0 -18 -4 -25" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
        <path d="M 4 -8 Q 8 -18 4 -25" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      </g>
    `
  }
];

// -------------------------------------------------------------
// Generation & Export Execution
// -------------------------------------------------------------

function generateCategory(list, outDir) {
  console.log(`Generating ${list.length} stickers in ${outDir}...`);
  for (const item of list) {
    const svgContent = wrapSvg(item.svg);
    const svgPath = path.join(outDir, `${item.name}.svg`);
    const pngPath = path.join(outDir, `${item.name}.png`);
    
    fs.writeFileSync(svgPath, svgContent, 'utf8');
    
    // Render to 512x512 crisp PNG with transparent background
    try {
      execSync(`magick -background none "${svgPath}" -resize 512x512 "${pngPath}"`);
    } catch (err) {
      console.error(`Error rendering ${item.name}:`, err.message);
    }
  }
}

generateCategory(BUBU_STICKERS, BUBU_DIR);
generateCategory(DUDU_STICKERS, DUDU_DIR);
generateCategory(COUPLE_STICKERS, COUPLE_DIR);

console.log('All stickers generated successfully!');
