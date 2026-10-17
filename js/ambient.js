// Aesthetic Ambient Background Particles Engine for Dudu & Bubu Companion
(() => {
  function initAmbient() {
    let container = document.getElementById('aesthetic-ambient-bg');
    if (!container) {
      container = document.createElement('div');
      container.id = 'aesthetic-ambient-bg';
      container.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
      document.body.prepend(container);
    }

    // Generate 12 gentle floating particles
    const particleTypes = ['heart', 'sparkle', 'orb', 'heart', 'sparkle'];
    const colors = ['#f2a6a6', '#fdb0b0', '#ede0d4', '#e6ccb2'];

    const html = [];
    for (let i = 0; i < 14; i++) {
      const type = particleTypes[i % particleTypes.length];
      const color = colors[i % colors.length];
      const left = Math.floor(Math.random() * 94) + 3;
      const top = Math.floor(Math.random() * 92) + 4;
      const size = Math.floor(Math.random() * 14) + 12; // 12px to 26px
      const duration = (Math.random() * 6 + 7).toFixed(1); // 7s to 13s
      const delay = (Math.random() * 5).toFixed(1);

      if (type === 'heart') {
        html.push(`
          <div class="ambient-particle float-heart select-none" style="position: absolute; left: ${left}%; top: ${top}%; font-size: ${size}px; color: ${color}; animation: ambientFloat ${duration}s ease-in-out infinite alternate; animation-delay: ${delay}s; opacity: 0.16;">
            ♥
          </div>
        `);
      } else if (type === 'sparkle') {
        html.push(`
          <div class="ambient-particle float-sparkle select-none" style="position: absolute; left: ${left}%; top: ${top}%; font-size: ${size}px; color: ${color}; animation: ambientTwinkle ${duration}s ease-in-out infinite alternate; animation-delay: ${delay}s; opacity: 0.2;">
            ✨
          </div>
        `);
      } else {
        html.push(`
          <div class="ambient-particle float-orb select-none rounded-full" style="position: absolute; left: ${left}%; top: ${top}%; width: ${size * 1.5}px; height: ${size * 1.5}px; background: radial-gradient(circle, ${color} 0%, transparent 70%); animation: ambientFloat ${duration * 1.2}s ease-in-out infinite alternate; animation-delay: ${delay}s; opacity: 0.18;">
          </div>
        `);
      }
    }
    container.innerHTML = html.join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbient);
  } else {
    initAmbient();
  }
})();
