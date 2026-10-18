/**
 * Original Custom Wallpaper Generator for Dudu and Bubu (Huang Xiao B style)
 * Creates 1080x1920 mobile wallpapers from scratch with zero dependence on user files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_DIR = path.resolve(__dirname, '../assets/wallpapers');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function bubuMini(cx, cy, scale = 1) {
  return `
    <g transform="translate(${cx}, ${cy}) scale(${scale})">
      <!-- Ears -->
      <circle cx="-55" cy="-45" r="22" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
      <circle cx="55" cy="-45" r="22" fill="#2B2421" stroke="#2B2421" stroke-width="4"/>
      <!-- Body -->
      <ellipse cx="0" cy="55" rx="65" ry="50" fill="#FFFFFF" stroke="#2B2421" stroke-width="5"/>
      <!-- Feet -->
      <ellipse cx="-30" cy="95" rx="18" ry="12" fill="#FFFFFF" stroke="#2B2421" stroke-width="4.5"/>
      <ellipse cx="30" cy="95" rx="18" ry="12" fill="#FFFFFF" stroke="#2B2421" stroke-width="4.5"/>
      <!-- Head -->
      <ellipse cx="0" cy="0" rx="70" ry="58" fill="#FFFFFF" stroke="#2B2421" stroke-width="5.5"/>
      <!-- Cheeks -->
      <ellipse cx="-45" cy="15" rx="18" ry="10" fill="#FFA8A3" opacity="0.85"/>
      <ellipse cx="45" cy="15" rx="18" ry="10" fill="#FFA8A3" opacity="0.85"/>
      <!-- Eyes (Pure Huang Xiao B Solid Chocolate Dots, No Patches, No Highlights) -->
      <circle cx="-32" cy="-5" r="9" fill="#2B2421"/>
      <circle cx="32" cy="-5" r="9" fill="#2B2421"/>
      <!-- Iconic Cute ω Mouth Directly on Fur -->
      <path d="M -9 8 Q -4.5 13 0 9 Q 4.5 13 9 8" fill="none" stroke="#2B2421" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Signature Dark Chocolate Bowtie Collar Ribbon -->
      <path d="M 0 54 L -14 47 L -12 61 Z M 0 54 L 14 47 L 12 61 Z" fill="#2B2421"/>
      <circle cx="0" cy="54" r="4" fill="#2B2421"/>
    </g>
  `;
}

function duduMini(cx, cy, scale = 1) {
  return `
    <g transform="translate(${cx}, ${cy}) scale(${scale})">
      <!-- Ears -->
      <circle cx="-55" cy="-45" r="22" fill="#BA8358" stroke="#3E2723" stroke-width="5"/>
      <circle cx="-55" cy="-45" r="12" fill="#4A2E1B"/>
      <circle cx="55" cy="-45" r="22" fill="#BA8358" stroke="#3E2723" stroke-width="5"/>
      <circle cx="55" cy="-45" r="12" fill="#4A2E1B"/>
      <!-- Body (Solid Honey Brown, NO Belly Patch) -->
      <ellipse cx="0" cy="55" rx="65" ry="50" fill="#BA8358" stroke="#3E2723" stroke-width="5"/>
      <!-- Feet -->
      <ellipse cx="-30" cy="95" rx="18" ry="12" fill="#BA8358" stroke="#3E2723" stroke-width="4.5"/>
      <ellipse cx="30" cy="95" rx="18" ry="12" fill="#BA8358" stroke="#3E2723" stroke-width="4.5"/>
      <!-- Head (Chubby Honey Brown Face, NO Muzzle Patch) -->
      <ellipse cx="0" cy="0" rx="70" ry="58" fill="#BA8358" stroke="#3E2723" stroke-width="5.5"/>
      <!-- Cheeks -->
      <ellipse cx="-45" cy="15" rx="18" ry="10" fill="#F6A77E" opacity="0.85"/>
      <ellipse cx="45" cy="15" rx="18" ry="10" fill="#F6A77E" opacity="0.85"/>
      <!-- Eyes (Pure Huang Xiao B Solid Chocolate Dots, No Highlights) -->
      <circle cx="-32" cy="-5" r="9" fill="#3E2723"/>
      <circle cx="32" cy="-5" r="9" fill="#3E2723"/>
      <!-- Iconic Cute ω Mouth Directly on Honey Brown Fur -->
      <path d="M -9 8 Q -4.5 13 0 9 Q 4.5 13 9 8" fill="none" stroke="#3E2723" stroke-width="3.5" stroke-linecap="round"/>
    </g>
  `;
}

// -------------------------------------------------------------
// 1. Cozy Bedroom Wallpaper (Kamar Hangat Dudu & Bubu)
// -------------------------------------------------------------
function generateCozyRoomSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FDFBF7"/>
        <stop offset="60%" stop-color="#F5EFE6"/>
        <stop offset="100%" stop-color="#EBDDCB"/>
      </linearGradient>
      <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#D4A373"/>
        <stop offset="100%" stop-color="#BC8A5F"/>
      </linearGradient>
      <linearGradient id="windowSunset" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFD6A5"/>
        <stop offset="50%" stop-color="#FFADAD"/>
        <stop offset="100%" stop-color="#FDFFB6"/>
      </linearGradient>
    </defs>

    <!-- Room Wall -->
    <rect width="1080" height="1350" fill="url(#wallGrad)"/>
    
    <!-- Floor -->
    <rect y="1350" width="1080" height="570" fill="url(#floorGrad)"/>
    <!-- Floor Planks -->
    <line x1="0" y1="1480" x2="1080" y2="1480" stroke="#A7744E" stroke-width="4"/>
    <line x1="0" y1="1620" x2="1080" y2="1620" stroke="#A7744E" stroke-width="4"/>
    <line x1="0" y1="1770" x2="1080" y2="1770" stroke="#A7744E" stroke-width="4"/>
    <line x1="320" y1="1350" x2="320" y2="1480" stroke="#A7744E" stroke-width="3"/>
    <line x1="720" y1="1350" x2="720" y2="1480" stroke="#A7744E" stroke-width="3"/>
    <line x1="500" y1="1480" x2="500" y2="1620" stroke="#A7744E" stroke-width="3"/>
    <line x1="880" y1="1480" x2="880" y2="1620" stroke="#A7744E" stroke-width="3"/>

    <!-- Round Sunset Window -->
    <circle cx="540" cy="550" r="260" fill="url(#windowSunset)" stroke="#FFFFFF" stroke-width="24"/>
    <line x1="540" y1="290" x2="540" y2="810" stroke="#FFFFFF" stroke-width="12"/>
    <line x1="280" y1="550" x2="800" y2="550" stroke="#FFFFFF" stroke-width="12"/>
    <!-- Small bird silhouettes outside -->
    <path d="M 450 420 Q 460 410 470 420 Q 480 410 490 420" fill="none" stroke="#E29578" stroke-width="4" stroke-linecap="round"/>
    <path d="M 580 380 Q 590 370 600 380 Q 610 370 620 380" fill="none" stroke="#E29578" stroke-width="4" stroke-linecap="round"/>

    <!-- Hanging Fairy Lights -->
    <path d="M 50 140 Q 280 260 540 180 Q 800 260 1030 140" fill="none" stroke="#8D5B4C" stroke-width="4"/>
    <circle cx="160" cy="190" r="14" fill="#FFE066" filter="drop-shadow(0 0 8px #FFD166)"/>
    <circle cx="280" cy="225" r="14" fill="#FF9E99" filter="drop-shadow(0 0 8px #FF9E99)"/>
    <circle cx="410" cy="210" r="14" fill="#A8DADC" filter="drop-shadow(0 0 8px #A8DADC)"/>
    <circle cx="540" cy="180" r="15" fill="#FFE066" filter="drop-shadow(0 0 8px #FFD166)"/>
    <circle cx="670" cy="210" r="14" fill="#A8DADC" filter="drop-shadow(0 0 8px #A8DADC)"/>
    <circle cx="800" cy="225" r="14" fill="#FF9E99" filter="drop-shadow(0 0 8px #FF9E99)"/>
    <circle cx="920" cy="190" r="14" fill="#FFE066" filter="drop-shadow(0 0 8px #FFD166)"/>

    <!-- Wooden Shelf with Potted Cactus & Books -->
    <rect x="80" y="700" width="280" height="24" rx="8" fill="#C59B6D" stroke="#5D3A1A" stroke-width="5"/>
    <!-- Plant Pot -->
    <polygon points="120,700 130,640 170,640 180,700" fill="#E07A5F" stroke="#5D3A1A" stroke-width="4"/>
    <circle cx="150" cy="625" r="22" fill="#81B29A" stroke="#5D3A1A" stroke-width="4"/>
    <!-- Books -->
    <rect x="220" y="630" width="22" height="70" rx="4" fill="#FFB4A2" stroke="#5D3A1A" stroke-width="3"/>
    <rect x="245" y="640" width="20" height="60" rx="4" fill="#B5E48C" stroke="#5D3A1A" stroke-width="3"/>
    <rect x="268" y="620" width="24" height="80" rx="4" fill="#99D98C" stroke="#5D3A1A" stroke-width="3"/>

    <!-- Fluffy Oval Bedroom Rug -->
    <ellipse cx="540" cy="1540" rx="440" ry="220" fill="#FFF8F0" stroke="#E8DACB" stroke-width="12"/>
    <ellipse cx="540" cy="1540" rx="410" ry="195" fill="none" stroke="#F5EAE0" stroke-width="6" stroke-dasharray="15,15"/>

    <!-- Dudu & Bubu Sitting Together on the Rug -->
    ${bubuMini(420, 1420, 2.2)}
    ${duduMini(660, 1420, 2.2)}

    <!-- Hot Cocoa Mugs in Center -->
    <rect x="515" y="1520" width="24" height="28" rx="5" fill="#FF9E99" stroke="#5D3A1A" stroke-width="3.5"/>
    <path d="M 539 1526 Q 548 1533 539 1540" fill="none" stroke="#5D3A1A" stroke-width="3"/>
    <rect x="548" y="1520" width="24" height="28" rx="5" fill="#A8DADC" stroke="#5D3A1A" stroke-width="3.5"/>
    <path d="M 572 1526 Q 581 1533 572 1540" fill="none" stroke="#5D3A1A" stroke-width="3"/>
    <!-- Steam -->
    <path d="M 527 1515 Q 523 1505 528 1495" fill="none" stroke="#FFA8A3" stroke-width="3" stroke-linecap="round"/>
    <path d="M 560 1515 Q 564 1505 559 1495" fill="none" stroke="#A8DADC" stroke-width="3" stroke-linecap="round"/>

    <!-- Warm Loving Floating Heart -->
    <path d="M 540 1200 C 540 1160, 480 1130, 480 1180 C 480 1230, 540 1280, 540 1290 C 540 1280, 600 1230, 600 1180 C 600 1130, 540 1160, 540 1200 Z" fill="#FF758C" stroke="#2B2421" stroke-width="8"/>
  </svg>`;
}

// -------------------------------------------------------------
// 2. Starry Night Wallpaper (Malam Berbintang Berdua)
// -------------------------------------------------------------
function generateStargazingSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="45%" stop-color="#1E1B4B"/>
        <stop offset="80%" stop-color="#311042"/>
        <stop offset="100%" stop-color="#4C1D95"/>
      </linearGradient>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFBEB"/>
        <stop offset="40%" stop-color="#FEF08A"/>
        <stop offset="80%" stop-color="#FDE047" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#FDE047" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
    </defs>

    <!-- Night Sky -->
    <rect width="1080" height="1920" fill="url(#nightSky)"/>

    <!-- Glowing Moon Halo & Crescent -->
    <circle cx="800" cy="380" r="280" fill="url(#moonGlow)"/>
    <circle cx="800" cy="380" r="140" fill="#FFFDEB"/>
    <circle cx="845" cy="350" r="130" fill="#1A1838"/>

    <!-- Stars Constellations -->
    <g fill="#FFFFFF" opacity="0.9">
      <circle cx="150" cy="220" r="4"/>
      <circle cx="280" cy="180" r="5.5"/>
      <circle cx="380" cy="260" r="3.5"/>
      <circle cx="220" cy="340" r="6"/>
      <circle cx="490" cy="150" r="4"/>
      <circle cx="620" cy="220" r="5"/>
      <circle cx="120" cy="460" r="3"/>
      <circle cx="340" cy="520" r="4.5"/>
      <circle cx="580" cy="440" r="3.5"/>
      <circle cx="200" cy="680" r="5"/>
      <circle cx="450" cy="720" r="4"/>
      <circle cx="780" cy="750" r="3"/>
      <circle cx="920" cy="620" r="4.5"/>
      <circle cx="950" cy="220" r="5"/>
    </g>
    <!-- Bear Paw Constellation lines -->
    <path d="M 220 340 L 280 180 L 380 260 M 280 180 L 150 220" fill="none" stroke="#A5B4FC" stroke-width="2" opacity="0.5"/>

    <!-- Shooting Stars -->
    <line x1="180" y1="520" x2="350" y2="400" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <line x1="180" y1="520" x2="280" y2="450" stroke="#FDE047" stroke-width="1.5" opacity="0.6"/>

    <!-- Soft Rolling Dark Hills -->
    <path d="M -50 1520 Q 350 1380 750 1500 Q 950 1550 1150 1480 L 1150 1920 L -50 1920 Z" fill="url(#hillGrad)"/>
    <path d="M -50 1620 Q 400 1500 850 1640 L 1150 1600 L 1150 1920 L -50 1920 Z" fill="#0B1120"/>

    <!-- Soft Hilltop Grass Grass Blips -->
    <path d="M 280 1440 L 285 1425 L 290 1440" stroke="#334155" stroke-width="3"/>
    <path d="M 780 1510 L 785 1495 L 790 1510" stroke="#334155" stroke-width="3"/>

    <!-- Dudu & Bubu Sitting Together Under Starlight -->
    ${bubuMini(430, 1460, 2.3)}
    ${duduMini(660, 1460, 2.3)}

    <!-- Warm Quilt Blanket Over Shoulders -->
    <path d="M 320 1520 C 440 1480, 650 1480, 770 1520 C 740 1660, 350 1660, 320 1520 Z" fill="#F43F5E" stroke="#2B2421" stroke-width="8"/>
    <polygon points="500,1540 505,1552 518,1554 507,1560 511,1572 500,1564 489,1572 493,1560 482,1554 495,1552" fill="#FDE047"/>
    <polygon points="590,1550 595,1562 608,1564 597,1570 601,1582 590,1574 579,1582 583,1570 572,1564 585,1562" fill="#FDE047"/>

    <!-- Floating Starlight Sparkles -->
    <polygon points="540,1180 545,1198 563,1203 545,1208 540,1226 535,1208 517,1203 535,1198" fill="#FDE047"/>
  </svg>`;
}

// -------------------------------------------------------------
// 3. Spring Picnic Date Wallpaper (Kencan Piknik Musim Semi)
// -------------------------------------------------------------
function generateSpringPicnicSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="springSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#BAE6FD"/>
        <stop offset="60%" stop-color="#E0F2FE"/>
        <stop offset="100%" stop-color="#FEF9C3"/>
      </linearGradient>
      <linearGradient id="meadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86EFAC"/>
        <stop offset="60%" stop-color="#4ADE80"/>
        <stop offset="100%" stop-color="#22C55E"/>
      </linearGradient>
      <pattern id="picnicGingham" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#FFFFFF"/>
        <rect width="20" height="20" fill="#FECDD3"/>
        <rect x="20" y="20" width="20" height="20" fill="#FECDD3"/>
        <rect width="40" height="20" fill="#FDA4AF" opacity="0.4"/>
        <rect width="20" height="40" fill="#FDA4AF" opacity="0.4"/>
      </pattern>
    </defs>

    <!-- Spring Sky -->
    <rect width="1080" height="1920" fill="url(#springSky)"/>

    <!-- Sun with soft glow -->
    <circle cx="900" cy="250" r="120" fill="#FEF08A" opacity="0.6"/>
    <circle cx="900" cy="250" r="75" fill="#FDE047"/>

    <!-- Sakura Cherry Blossom Branches at Top -->
    <path d="M 0 0 Q 300 120 600 40" fill="none" stroke="#78350F" stroke-width="16" stroke-linecap="round"/>
    <path d="M 250 80 Q 350 220 450 200" fill="none" stroke="#78350F" stroke-width="10" stroke-linecap="round"/>
    <!-- Blossom Flowers -->
    <g fill="#FBCFE8" stroke="#F472B6" stroke-width="2">
      <circle cx="150" cy="80" r="26"/><circle cx="140" cy="65" r="20"/><circle cx="165" cy="65" r="20"/>
      <circle cx="280" cy="110" r="28"/><circle cx="380" cy="160" r="26"/><circle cx="440" cy="200" r="30"/>
      <circle cx="520" cy="80" r="25"/>
    </g>

    <!-- Floating Sakura Petals -->
    <g fill="#F472B6" opacity="0.8">
      <path d="M 220 400 C 230 380, 250 410, 235 430 Z"/>
      <path d="M 380 580 C 390 560, 410 590, 395 610 Z"/>
      <path d="M 720 480 C 730 460, 750 490, 735 510 Z"/>
      <path d="M 850 720 C 860 700, 880 730, 865 750 Z"/>
      <path d="M 180 850 C 190 830, 210 860, 195 880 Z"/>
    </g>

    <!-- Green Meadow Hills -->
    <path d="M -50 1250 Q 350 1080 750 1200 Q 950 1250 1150 1180 L 1150 1920 L -50 1920 Z" fill="#BBF7D0"/>
    <path d="M -50 1380 Q 400 1240 850 1380 L 1150 1340 L 1150 1920 L -50 1920 Z" fill="url(#meadowGrad)"/>

    <!-- Red Checked Picnic Blanket -->
    <polygon points="120,1580 960,1580 860,1880 220,1880" fill="url(#picnicGingham)" stroke="#E11D48" stroke-width="8"/>

    <!-- Woven Picnic Basket -->
    <g transform="translate(180, 1500)">
      <rect x="0" y="30" width="140" height="90" rx="16" fill="#D97706" stroke="#78350F" stroke-width="6"/>
      <line x1="0" y1="60" x2="140" y2="60" stroke="#78350F" stroke-width="4"/>
      <line x1="0" y1="90" x2="140" y2="90" stroke="#78350F" stroke-width="4"/>
      <path d="M 30 30 Q 70 -20 110 30" fill="none" stroke="#78350F" stroke-width="6"/>
      <!-- Strawberries poking out -->
      <circle cx="50" cy="25" r="14" fill="#EF4444"/>
      <circle cx="80" cy="20" r="14" fill="#EF4444"/>
    </g>

    <!-- Dudu & Bubu on Picnic Blanket -->
    ${bubuMini(460, 1460, 2.4)}
    ${duduMini(700, 1460, 2.4)}

    <!-- Boba Drinks on Blanket -->
    <g transform="translate(540, 1600)">
      <rect x="0" y="0" width="30" height="45" rx="6" fill="#FDE68A" stroke="#78350F" stroke-width="4"/>
      <rect x="12" y="-15" width="6" height="25" fill="#F43F5E"/>
      <circle cx="8" cy="35" r="4" fill="#78350F"/>
      <circle cx="18" cy="38" r="4" fill="#78350F"/>
      <circle cx="22" cy="32" r="4" fill="#78350F"/>
    </g>
  </svg>`;
}

// -------------------------------------------------------------
// 4. Sweet Dreams on Cloud Wallpaper (Mimpi Indah di Awan)
// -------------------------------------------------------------
function generateSweetDreamsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="twilightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FDF2F8"/>
        <stop offset="30%" stop-color="#EDE9FE"/>
        <stop offset="70%" stop-color="#DDD6FE"/>
        <stop offset="100%" stop-color="#C4B5FD"/>
      </linearGradient>
      <linearGradient id="dreamCloud" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F3E8FF"/>
      </linearGradient>
    </defs>

    <!-- Twilight Background -->
    <rect width="1080" height="1920" fill="url(#twilightGrad)"/>

    <!-- Floating Star Pillows -->
    <g fill="#FDE047" stroke="#CA8A04" stroke-width="4">
      <polygon points="200,320 210,350 240,355 218,375 224,405 200,390 176,405 182,375 160,355 190,350" transform="rotate(-15 200 360)"/>
      <polygon points="850,450 860,480 890,485 868,505 874,535 850,520 826,535 832,505 810,485 840,480" transform="rotate(20 850 490)"/>
      <polygon points="150,850 158,874 182,878 164,894 169,918 150,906 131,918 136,894 118,878 142,874" transform="rotate(10 150 880)"/>
    </g>

    <!-- Crescent Moon Cushion -->
    <path d="M 540 380 C 460 380, 400 450, 420 540 C 430 460, 500 420, 560 430 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="5" transform="scale(1.8) translate(-160, -100)"/>

    <!-- Giant Puffy Center Cloud -->
    <g transform="translate(140, 1150) scale(1.6)">
      <path d="M 50 180 
               C 10 180, -20 140, 5 100 
               C -10 60, 40 20, 80 35 
               C 105 -10, 175 -15, 205 25 
               C 240 -5, 305 5, 325 50 
               C 370 60, 390 120, 360 160 
               C 385 200, 335 240, 290 225 
               C 250 250, 170 250, 130 225 
               C 90 245, 45 225, 50 180 Z"
            fill="url(#dreamCloud)" stroke="#8B5CF6" stroke-width="7" stroke-linejoin="round"/>
    </g>

    <!-- Sleeping Curled Dudu & Bubu -->
    ${bubuMini(430, 1320, 2.3)}
    ${duduMini(650, 1320, 2.3)}

    <!-- Starry Night Duvet / Blanket -->
    <path d="M 330 1380 C 440 1340, 640 1340, 750 1380 C 720 1520, 360 1520, 330 1380 Z" fill="#818CF8" stroke="#312E81" stroke-width="7"/>
    <circle cx="450" cy="1440" r="8" fill="#FDE047"/>
    <circle cx="540" cy="1420" r="10" fill="#FDE047"/>
    <circle cx="630" cy="1440" r="8" fill="#FDE047"/>

    <!-- Floating Zzz -->
    <g fill="#A78BFA" font-family="'Nunito', sans-serif" font-weight="900">
      <text x="690" y="1180" font-size="45">z</text>
      <text x="740" y="1120" font-size="60">Z</text>
      <text x="800" y="1050" font-size="80">Z</text>
    </g>
  </svg>`;
}

// -------------------------------------------------------------
// 5. Sweet Cafe Bakery Wallpaper (Kafe Manis Dudu Bubu)
// -------------------------------------------------------------
function generateSweetCafeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="cafeWall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF7"/>
        <stop offset="60%" stop-color="#FDF6EB"/>
        <stop offset="100%" stop-color="#F5E6CC"/>
      </linearGradient>
      <linearGradient id="counterWood" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#C59B6D"/>
        <stop offset="100%" stop-color="#A47148"/>
      </linearGradient>
    </defs>

    <!-- Warm Wall -->
    <rect width="1080" height="1920" fill="url(#cafeWall)"/>

    <!-- Cafe Menu Board at Top -->
    <g transform="translate(240, 200)">
      <rect x="0" y="0" width="600" height="260" rx="20" fill="#33272A" stroke="#C59B6D" stroke-width="12"/>
      <text x="300" y="70" font-family="'Nunito', sans-serif" font-size="34" font-weight="900" fill="#FEEAA7" text-anchor="middle">♡ DUDU &amp; BUBU CAFE ♡</text>
      <line x1="80" y1="95" x2="520" y2="95" stroke="#FEEAA7" stroke-width="2" stroke-dasharray="10,8"/>
      <text x="140" y="145" font-family="'Nunito', sans-serif" font-size="24" font-weight="700" fill="#FFF">Strawberry Cake 🍰</text>
      <text x="460" y="145" font-family="'Nunito', sans-serif" font-size="24" font-weight="700" fill="#FEEAA7">100%</text>
      <text x="140" y="195" font-family="'Nunito', sans-serif" font-size="24" font-weight="700" fill="#FFF">Boba Milk Tea 🧋</text>
      <text x="460" y="195" font-family="'Nunito', sans-serif" font-size="24" font-weight="700" fill="#FEEAA7">Sweet</text>
      <text x="140" y="240" font-family="'Nunito', sans-serif" font-size="20" font-weight="700" fill="#FDA4AF">Made with Pure Love ♡</text>
    </g>

    <!-- Wooden Counter -->
    <rect y="1320" width="1080" height="600" fill="url(#counterWood)"/>
    <rect y="1300" width="1080" height="35" rx="10" fill="#EBD2B4" stroke="#78350F" stroke-width="6"/>

    <!-- Hanging Kitchen Whisk, Spoon, Spatula -->
    <g stroke="#78350F" stroke-width="5" stroke-linecap="round">
      <line x1="180" y1="560" x2="180" y2="700"/>
      <circle cx="180" cy="720" r="18" fill="#F43F5E"/>
      <line x1="900" y1="560" x2="900" y2="700"/>
      <path d="M 890 700 L 910 700 L 905 735 L 895 735 Z" fill="#3B82F6"/>
    </g>

    <!-- Dudu & Bubu Behind Counter with Baker Hats -->
    ${bubuMini(420, 1140, 2.5)}
    ${duduMini(680, 1140, 2.5)}

    <!-- Chef Hats on Heads -->
    <!-- Bubu Hat -->
    <path d="M 360 990 C 340 930, 480 930, 460 990 Z" fill="#FFFFFF" stroke="#2B2421" stroke-width="6"/>
    <rect x="365" y="990" width="90" height="22" rx="6" fill="#FFFFFF" stroke="#2B2421" stroke-width="5"/>
    <!-- Dudu Hat -->
    <path d="M 620 990 C 600 930, 740 930, 720 990 Z" fill="#FFFFFF" stroke="#3E2723" stroke-width="6"/>
    <rect x="625" y="990" width="90" height="22" rx="6" fill="#FFFFFF" stroke="#3E2723" stroke-width="5"/>

    <!-- Tray of Heart Cookies on Counter -->
    <g transform="translate(540, 1310)">
      <ellipse cx="0" cy="0" rx="160" ry="40" fill="#E2E8F0" stroke="#475569" stroke-width="6"/>
      <!-- Heart Cookies -->
      <path d="M -80 -10 C -80 -25, -55 -25, -55 -10 C -55 5, -80 20, -80 25 C -80 20, -105 5, -105 -10 C -105 -25, -80 -25, -80 -10 Z" fill="#D97706"/>
      <path d="M 0 -10 C 0 -25, 25 -25, 25 -10 C 25 5, 0 20, 0 25 C 0 20, -25 5, -25 -10 C -25 -25, 0 -25, 0 -10 Z" fill="#EF4444"/>
      <path d="M 80 -10 C 80 -25, 105 -25, 105 -10 C 105 5, 80 20, 80 25 C 80 20, 55 5, 55 -10 C 55 -25, 80 -25, 80 -10 Z" fill="#D97706"/>
    </g>
  </svg>`;
}

// -------------------------------------------------------------
// 6. Cute Doodles & Hearts Seamless Pattern Wallpaper
// -------------------------------------------------------------
function generateDoodleHeartsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <rect width="1080" height="1920" fill="#FFFBF5"/>

    <!-- Subtle repeating grid dots -->
    <defs>
      <pattern id="dotGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="30" cy="30" r="2" fill="#E8DACB" opacity="0.6"/>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="url(#dotGrid)"/>

    <!-- Dudu & Bubu Illustrations in Aesthetic Grid -->
    <!-- Row 1 -->
    ${bubuMini(270, 280, 1.4)}
    ${duduMini(810, 280, 1.4)}

    <!-- Row 2 -->
    ${duduMini(270, 720, 1.4)}
    ${bubuMini(810, 720, 1.4)}

    <!-- Row 3 (Center Together) -->
    ${bubuMini(420, 1160, 1.6)}
    ${duduMini(660, 1160, 1.6)}

    <!-- Row 4 -->
    ${bubuMini(270, 1600, 1.4)}
    ${duduMini(810, 1600, 1.4)}

    <!-- Floating Doodle Accents & Hearts between cells -->
    <g fill="#FF758C" stroke="#2B2421" stroke-width="4">
      <!-- Hearts -->
      <path d="M 540 240 C 540 220, 520 210, 520 225 C 520 240, 540 255, 540 260 C 540 255, 560 240, 560 225 C 560 210, 540 220, 540 240 Z"/>
      <path d="M 540 680 C 540 660, 520 650, 520 665 C 520 680, 540 695, 540 700 C 540 695, 560 680, 560 665 C 560 650, 540 660, 540 680 Z"/>
      <path d="M 540 1020 C 540 990, 505 975, 505 1000 C 505 1025, 540 1050, 540 1060 C 540 1050, 575 1025, 575 1000 C 575 975, 540 990, 540 1020 Z"/>
      <path d="M 540 1560 C 540 1540, 520 1530, 520 1545 C 520 1560, 540 1575, 540 1580 C 540 1575, 560 1560, 560 1545 C 560 1530, 540 1540, 540 1560 Z"/>
    </g>

    <!-- Boba cups and stars -->
    <g fill="#FDE047" stroke="#CA8A04" stroke-width="3">
      <polygon points="540,460 544,472 556,474 546,480 550,492 540,486 530,492 534,480 524,474 536,472"/>
      <polygon points="540,880 544,892 556,894 546,900 550,912 540,906 530,912 534,900 524,894 536,892"/>
      <polygon points="540,1360 544,1372 556,1374 546,1380 550,1392 540,1386 530,1392 534,1380 524,1374 536,1372"/>
    </g>
  </svg>`;
}

// -------------------------------------------------------------
// Generation Pipeline
// -------------------------------------------------------------

const WALLPAPERS = [
  { name: 'wallpaper_dudu_bubu_room', fn: generateCozyRoomSvg },
  { name: 'wallpaper_stargazing', fn: generateStargazingSvg },
  { name: 'wallpaper_adventure', fn: generateSpringPicnicSvg },
  { name: 'wallpaper_sweet_dreams', fn: generateSweetDreamsSvg },
  { name: 'wallpaper_couple_stage', fn: generateSweetCafeSvg },
  { name: 'wallpaper_bubu_room', fn: generateDoodleHeartsSvg },
  { name: 'wallpaper_dudu_room', fn: generateCozyRoomSvg }
];

console.log('Generating 1080x1920 original Dudu & Bubu wallpapers...');
for (const wp of WALLPAPERS) {
  const svg = wp.fn();
  const svgPath = path.join(OUT_DIR, `${wp.name}.svg`);
  const jpgPath = path.join(OUT_DIR, `${wp.name}.jpg`);

  fs.writeFileSync(svgPath, svg, 'utf8');
  execSync(`magick "${svgPath}" -quality 95 "${jpgPath}"`);
  console.log(`✅ Generated ${wp.name}.jpg (1080x1920)`);
}

console.log('All custom wallpapers created successfully!');
