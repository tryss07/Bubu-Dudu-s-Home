// Chat Room Wallpaper Engine & Preset Manager
(() => {
  const PRESETS = [
    {
      id: 'default',
      name: 'Default Clean',
      style: 'background-color: transparent;',
      preview: 'background: var(--color-surface, #fff8f4);'
    },
    {
      id: 'cozy-grid',
      name: 'Cozy Grid',
      style: 'background-color: var(--color-surface-container-low, #fff1e5); background-image: radial-gradient(rgba(138, 77, 78, 0.18) 1px, transparent 1px); background-size: 16px 16px;',
      preview: 'background-color: #fff1e5; background-image: radial-gradient(#8a4d4e 1px, transparent 1px); background-size: 8px 8px;'
    },
    {
      id: 'sweet-hearts',
      name: 'Sweet Hearts',
      style: `background-color: var(--color-surface, #fff8f4); background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23f2a6a6' fill-opacity='0.16'/%3E%3C/svg%3E"); background-size: 28px 28px;`,
      preview: 'background: #fff8f4; background-image: radial-gradient(#f2a6a6 2px, transparent 2px); background-size: 10px 10px;'
    },
    {
      id: 'peach-sunset',
      name: 'Peach Sunset',
      style: 'background: linear-gradient(135deg, rgba(255, 241, 229, 0.85) 0%, rgba(253, 176, 176, 0.45) 50%, rgba(254, 215, 226, 0.6) 100%);',
      preview: 'background: linear-gradient(135deg, #fff1e5 0%, #fdb0b0 50%, #fed7e2 100%);'
    },
    {
      id: 'night-twilight',
      name: 'Night Twilight',
      style: 'background: linear-gradient(160deg, rgba(46, 31, 36, 0.9) 0%, rgba(32, 22, 26, 0.95) 100%); background-image: radial-gradient(rgba(255, 230, 200, 0.25) 1px, transparent 1px); background-size: 20px 20px;',
      preview: 'background: linear-gradient(160deg, #2e1f24 0%, #20161a 100%);'
    }
  ];

  let currentWallpaper = null;

  function loadSavedWallpaper() {
    try {
      const saved = localStorage.getItem('dudu_chat_wallpaper');
      if (saved) {
        currentWallpaper = JSON.parse(saved);
      } else {
        currentWallpaper = { type: 'preset', id: 'default' };
      }
    } catch (e) {
      currentWallpaper = { type: 'preset', id: 'default' };
    }
    applyWallpaper();
  }

  function applyWallpaper() {
    const layer = document.getElementById('chat-wallpaper-layer');
    if (!layer) return;

    if (!currentWallpaper || currentWallpaper.id === 'default') {
      layer.style.cssText = 'display: none;';
      return;
    }

    layer.style.cssText = ''; // reset
    if (currentWallpaper.type === 'custom' && currentWallpaper.dataUrl) {
      layer.style.backgroundImage = `url("${currentWallpaper.dataUrl}")`;
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = 'center';
      layer.style.backgroundRepeat = 'no-repeat';
      layer.style.opacity = currentWallpaper.opacity || '0.75';
      layer.style.display = 'block';
    } else {
      const preset = PRESETS.find(p => p.id === currentWallpaper.id) || PRESETS[0];
      layer.style.cssText = preset.style;
      layer.style.display = 'block';
      if (currentWallpaper.opacity) {
        layer.style.opacity = currentWallpaper.opacity;
      }
    }
  }

  function setPresetWallpaper(presetId) {
    currentWallpaper = { type: 'preset', id: presetId };
    saveAndApply();
  }

  function setCustomWallpaper(dataUrl) {
    currentWallpaper = { type: 'custom', id: 'custom', dataUrl, opacity: '0.75' };
    saveAndApply();
  }

  function resetWallpaper() {
    currentWallpaper = { type: 'preset', id: 'default' };
    saveAndApply();
  }

  function saveAndApply() {
    try {
      localStorage.setItem('dudu_chat_wallpaper', JSON.stringify(currentWallpaper));
    } catch (e) {}
    applyWallpaper();
    if (window.showToast) {
      window.showToast(window.DuduI18n ? window.DuduI18n.t('wallpaper_saved') : 'Wallpaper updated');
    }
  }

  function openWallpaperModal() {
    const modal = document.getElementById('modal-chat-wallpaper');
    if (!modal) return;
    renderWallpaperOptions();
    modal.classList.remove('hidden');
  }

  function closeWallpaperModal() {
    const modal = document.getElementById('modal-chat-wallpaper');
    if (modal) modal.classList.add('hidden');
  }

  function renderWallpaperOptions() {
    const container = document.getElementById('wallpaper-presets-grid');
    if (!container) return;

    container.innerHTML = PRESETS.map(preset => {
      const isSelected = currentWallpaper?.id === preset.id;
      return `
        <button type="button" class="preset-wallpaper-card button-press flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-secondary ring-2 ring-secondary/30' : 'border-outline-variant/30 hover:border-secondary/60'}" data-preset-id="${preset.id}">
          <div class="w-full h-16 rounded-xl border border-outline-variant/20 shadow-xs" style="${preset.preview}"></div>
          <span class="text-[11px] font-bold text-primary truncate">${preset.name}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.preset-wallpaper-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preset-id');
        setPresetWallpaper(id);
        renderWallpaperOptions();
      });
    });
  }

  function init() {
    loadSavedWallpaper();

    // Trigger button
    document.getElementById('btn-chat-wallpaper')?.addEventListener('click', openWallpaperModal);
    document.getElementById('btn-close-wallpaper-modal')?.addEventListener('click', closeWallpaperModal);
    document.getElementById('btn-reset-wallpaper')?.addEventListener('click', () => {
      resetWallpaper();
      renderWallpaperOptions();
    });

    const modal = document.getElementById('modal-chat-wallpaper');
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeWallpaperModal();
    });

    // Custom upload input
    const fileInput = document.getElementById('input-custom-wallpaper-file');
    const uploadBtn = document.getElementById('btn-upload-custom-wallpaper');
    uploadBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomWallpaper(event.target.result);
        renderWallpaperOptions();
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
  }

  window.DuduWallpaper = {
    init,
    openModal: openWallpaperModal,
    closeModal: closeWallpaperModal,
    setPreset: setPresetWallpaper,
    setCustom: setCustomWallpaper,
    reset: resetWallpaper,
    apply: applyWallpaper
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
