// Chat Room & App Wallpaper Engine with Dudu Bubu Presets & Custom Upload
(() => {
  const PRESETS = [
    {
      id: 'default',
      name: 'Pola Doodle Klasik',
      category: 'doodle',
      style: 'background-color: #FAF5EE; background-image: url("assets/chat_doodle_bg.svg"); background-repeat: repeat; background-size: 200px 200px;',
      preview: 'background-color: #FAF5EE; background-image: url("assets/chat_doodle_bg.svg"); background-size: 55px 55px;'
    },
    {
      id: 'dudu-bubu-room',
      name: 'Kamar Dudu & Bubu 🐻🐼',
      category: 'dudu_bubu',
      imgSrc: 'assets/wallpapers/wallpaper_dudu_bubu_room.jpg',
      style: 'background-image: url("assets/wallpapers/wallpaper_dudu_bubu_room.jpg"); background-size: cover; background-position: center; background-repeat: no-repeat;',
      preview: 'background-image: url("assets/wallpapers/wallpaper_dudu_bubu_room.jpg"); background-size: cover; background-position: center;'
    },
    {
      id: 'dudu-room',
      name: 'Kamar Santai Dudu 🐻',
      category: 'dudu_bubu',
      imgSrc: 'assets/wallpapers/wallpaper_dudu_room.jpg',
      style: 'background-image: url("assets/wallpapers/wallpaper_dudu_room.jpg"); background-size: cover; background-position: center; background-repeat: no-repeat;',
      preview: 'background-image: url("assets/wallpapers/wallpaper_dudu_room.jpg"); background-size: cover; background-position: center;'
    },
    {
      id: 'bubu-room',
      name: 'Kamar Cantik Bubu 🐼',
      category: 'dudu_bubu',
      imgSrc: 'assets/wallpapers/wallpaper_bubu_room.jpg',
      style: 'background-image: url("assets/wallpapers/wallpaper_bubu_room.jpg"); background-size: cover; background-position: center; background-repeat: no-repeat;',
      preview: 'background-image: url("assets/wallpapers/wallpaper_bubu_room.jpg"); background-size: cover; background-position: center;'
    },
    {
      id: 'couple-stage',
      name: 'Panggung Berdua 🐻🐼',
      category: 'dudu_bubu',
      imgSrc: 'assets/wallpapers/wallpaper_couple_stage.jpg',
      style: 'background-image: url("assets/wallpapers/wallpaper_couple_stage.jpg"); background-size: cover; background-position: center; background-repeat: no-repeat;',
      preview: 'background-image: url("assets/wallpapers/wallpaper_couple_stage.jpg"); background-size: cover; background-position: center;'
    },
    {
      id: 'couple-stargazing',
      name: 'Bintang Malam ✨',
      category: 'dudu_bubu',
      imgSrc: 'assets/wallpapers/wallpaper_stargazing.jpg',
      style: 'background-image: url("assets/wallpapers/wallpaper_stargazing.jpg"); background-size: cover; background-position: center; background-repeat: no-repeat;',
      preview: 'background-image: url("assets/wallpapers/wallpaper_stargazing.jpg"); background-size: cover; background-position: center;'
    },
    {
      id: 'couple-adventure',
      name: 'Petualangan Manis 🌸',
      category: 'dudu_bubu',
      imgSrc: 'assets/wallpapers/wallpaper_adventure.jpg',
      style: 'background-image: url("assets/wallpapers/wallpaper_adventure.jpg"); background-size: cover; background-position: center; background-repeat: no-repeat;',
      preview: 'background-image: url("assets/wallpapers/wallpaper_adventure.jpg"); background-size: cover; background-position: center;'
    },
    {
      id: 'peach-sunset',
      name: 'Peach Sunset 🌅',
      category: 'aesthetic',
      style: 'background: linear-gradient(135deg, rgba(255, 241, 229, 0.95) 0%, rgba(253, 176, 176, 0.8) 50%, rgba(254, 215, 226, 0.9) 100%);',
      preview: 'background: linear-gradient(135deg, #fff1e5 0%, #fdb0b0 50%, #fed7e2 100%);'
    },
    {
      id: 'sweet-hearts',
      name: 'Sweet Hearts 💖',
      category: 'aesthetic',
      style: "background-color: #FFF5F0; background-image: url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23f2a6a6' fill-opacity='0.22'/%3E%3C/svg%3E\"); background-size: 28px 28px;",
      preview: 'background: #fff8f4; background-image: radial-gradient(#f2a6a6 2px, transparent 2px); background-size: 10px 10px;'
    },
    {
      id: 'lavender-dream',
      name: 'Lavender Dream 💜',
      category: 'aesthetic',
      style: 'background: linear-gradient(135deg, #F5EEFD 0%, #E9D5FF 50%, #FCE7F3 100%);',
      preview: 'background: linear-gradient(135deg, #F5EEFD 0%, #E9D5FF 50%, #FCE7F3 100%);'
    },
    {
      id: 'warm-honey',
      name: 'Warm Honey 🍯',
      category: 'aesthetic',
      style: 'background: linear-gradient(135deg, #FFFBEB 0%, #FDE68A 50%, #FED7AA 100%);',
      preview: 'background: linear-gradient(135deg, #FFFBEB 0%, #FDE68A 50%, #FED7AA 100%);'
    },
    {
      id: 'night-twilight',
      name: 'Night Twilight 🌙',
      category: 'aesthetic',
      style: 'background: linear-gradient(160deg, #241620 0%, #150E18 100%); background-image: radial-gradient(rgba(255, 230, 200, 0.25) 1px, transparent 1px); background-size: 22px 22px;',
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
        currentWallpaper = { type: 'preset', id: 'default', opacity: 0.85, scope: 'chat' };
      }
    } catch (e) {
      currentWallpaper = { type: 'preset', id: 'default', opacity: 0.85, scope: 'chat' };
    }
    if (!currentWallpaper.opacity) currentWallpaper.opacity = 0.85;
    if (!currentWallpaper.scope) currentWallpaper.scope = 'chat';
    applyWallpaper();
  }

  function applyWallpaper() {
    const chatLayer = document.getElementById('chat-wallpaper-layer');
    const globalLayer = document.getElementById('global-app-wallpaper-layer');

    const hasCustom = currentWallpaper && currentWallpaper.type === 'custom' && currentWallpaper.dataUrl;
    const isDefault = !currentWallpaper || (currentWallpaper.type === 'preset' && currentWallpaper.id === 'default');

    const opacity = currentWallpaper?.opacity ?? 0.85;
    const isGlobal = currentWallpaper?.scope === 'all';

    // Apply to chat layer
    if (chatLayer) {
      if (isDefault) {
        chatLayer.style.display = 'none';
        chatLayer.style.backgroundImage = 'none';
      } else {
        chatLayer.style.display = 'block';
        chatLayer.style.opacity = String(opacity);
        if (hasCustom) {
          chatLayer.style.cssText = `display: block; opacity: ${opacity}; background-image: url("${currentWallpaper.dataUrl}"); background-size: cover; background-position: center; background-repeat: no-repeat;`;
        } else {
          const preset = PRESETS.find(p => p.id === currentWallpaper.id) || PRESETS[0];
          chatLayer.style.cssText = `display: block; opacity: ${opacity}; ${preset.style}`;
        }
      }
    }

    // Apply to global app layer if scope is 'all'
    if (globalLayer) {
      if (isDefault || !isGlobal) {
        globalLayer.style.display = 'none';
        globalLayer.style.backgroundImage = 'none';
      } else {
        const softOpacity = Math.min(opacity, 0.45); // Softer for app readability
        globalLayer.style.display = 'block';
        if (hasCustom) {
          globalLayer.style.cssText = `display: block; opacity: ${softOpacity}; background-image: url("${currentWallpaper.dataUrl}"); background-size: cover; background-position: center; background-repeat: no-repeat;`;
        } else {
          const preset = PRESETS.find(p => p.id === currentWallpaper.id) || PRESETS[0];
          globalLayer.style.cssText = `display: block; opacity: ${softOpacity}; ${preset.style}`;
        }
      }
    }
  }

  function setPresetWallpaper(presetId) {
    const opacity = currentWallpaper?.opacity ?? 0.85;
    const scope = currentWallpaper?.scope ?? 'chat';
    currentWallpaper = { type: 'preset', id: presetId, opacity, scope };
    saveAndApply();
  }

  function setCustomWallpaper(dataUrl) {
    const opacity = currentWallpaper?.opacity ?? 0.85;
    const scope = currentWallpaper?.scope ?? 'chat';
    currentWallpaper = { type: 'custom', id: 'custom', dataUrl, opacity, scope };
    saveAndApply();
  }

  function setOpacity(val) {
    if (!currentWallpaper) currentWallpaper = { type: 'preset', id: 'default', opacity: 0.85, scope: 'chat' };
    currentWallpaper.opacity = val;
    saveAndApply(false);
  }

  function setScope(scope) {
    if (!currentWallpaper) currentWallpaper = { type: 'preset', id: 'default', opacity: 0.85, scope: 'chat' };
    currentWallpaper.scope = scope;
    saveAndApply();
  }

  function resetWallpaper() {
    currentWallpaper = { type: 'preset', id: 'default', opacity: 0.85, scope: 'chat' };
    saveAndApply();
  }

  function saveAndApply(showNotification = true) {
    try {
      localStorage.setItem('dudu_chat_wallpaper', JSON.stringify(currentWallpaper));
    } catch (e) {
      console.warn('Wallpaper quota exceeded, saving without custom image url');
    }
    applyWallpaper();
    if (showNotification) {
      const msg = 'Wallpaper diperbarui! 🖼️✨';
      if (typeof window.showFeedbackToast === 'function') {
        window.showFeedbackToast(msg);
      } else if (typeof window.showToast === 'function') {
        window.showToast(msg);
      }
    }
  }

  function openWallpaperModal() {
    const modal = document.getElementById('modal-chat-wallpaper');
    if (!modal) return;
    renderWallpaperOptions();
    syncControlsState();
    modal.classList.remove('hidden');
  }

  function closeWallpaperModal() {
    const modal = document.getElementById('modal-chat-wallpaper');
    if (modal) modal.classList.add('hidden');
  }

  function syncControlsState() {
    // Opacity slider
    const slider = document.getElementById('wallpaper-opacity-slider');
    const valText = document.getElementById('wallpaper-opacity-val');
    if (slider) {
      const percent = Math.round((currentWallpaper?.opacity ?? 0.85) * 100);
      slider.value = percent;
      if (valText) valText.textContent = `${percent}%`;
    }

    // Scope buttons
    const btnChat = document.getElementById('btn-scope-chat');
    const btnAll = document.getElementById('btn-scope-all');
    const isAll = currentWallpaper?.scope === 'all';
    if (btnChat && btnAll) {
      if (isAll) {
        btnAll.className = 'wallpaper-scope-btn px-3 py-1.5 rounded-full text-xs font-bold bg-[#8D5B4C] text-white shadow-xs cursor-pointer';
        btnChat.className = 'wallpaper-scope-btn px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-stone-700 text-[#4A3222] dark:text-stone-200 border border-[#E8DACB] dark:border-stone-600 cursor-pointer';
      } else {
        btnChat.className = 'wallpaper-scope-btn px-3 py-1.5 rounded-full text-xs font-bold bg-[#8D5B4C] text-white shadow-xs cursor-pointer';
        btnAll.className = 'wallpaper-scope-btn px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-stone-700 text-[#4A3222] dark:text-stone-200 border border-[#E8DACB] dark:border-stone-600 cursor-pointer';
      }
    }

    // Custom preview box
    const customBox = document.getElementById('wallpaper-custom-preview-box');
    const customImg = document.getElementById('wallpaper-custom-preview-img');
    if (customBox && customImg) {
      if (currentWallpaper?.type === 'custom' && currentWallpaper?.dataUrl) {
        customImg.src = currentWallpaper.dataUrl;
        customBox.classList.remove('hidden');
      } else {
        customBox.classList.add('hidden');
      }
    }
  }

  function renderWallpaperOptions() {
    const containerDudu = document.getElementById('wallpaper-dudububu-grid');
    const containerAesthetic = document.getElementById('wallpaper-aesthetic-grid');

    const duduPresets = PRESETS.filter(p => p.category === 'dudu_bubu' || p.category === 'doodle');
    const aestheticPresets = PRESETS.filter(p => p.category === 'aesthetic');

    const renderCards = (presets) => presets.map(preset => {
      const isSelected = currentWallpaper?.type === 'preset' && currentWallpaper?.id === preset.id;
      return `
        <button type="button" class="preset-wallpaper-card button-press flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-[#8D5B4C] ring-2 ring-[#8D5B4C]/30 bg-[#8D5B4C]/5' : 'border-[#E8DACB]/60 dark:border-stone-700 hover:border-[#8D5B4C]/60 bg-white dark:bg-stone-800'}" data-preset-id="${preset.id}">
          <div class="w-full h-16 rounded-xl border border-black/10 dark:border-white/10 shadow-xs relative overflow-hidden" style="${preset.preview}">
            ${isSelected ? '<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8D5B4C] text-white flex items-center justify-center text-[10px]">✓</span>' : ''}
          </div>
          <span class="text-[11px] font-bold text-primary dark:text-stone-200 truncate max-w-full">${preset.name}</span>
        </button>
      `;
    }).join('');

    if (containerDudu) containerDudu.innerHTML = renderCards(duduPresets);
    if (containerAesthetic) containerAesthetic.innerHTML = renderCards(aestheticPresets);

    document.querySelectorAll('.preset-wallpaper-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preset-id');
        setPresetWallpaper(id);
        renderWallpaperOptions();
        syncControlsState();
      });
    });
  }

  function compressImage(file, maxDimension = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  function init() {
    loadSavedWallpaper();

    // Trigger buttons
    document.getElementById('btn-chat-wallpaper')?.addEventListener('click', openWallpaperModal);
    document.getElementById('btn-close-wallpaper-modal')?.addEventListener('click', closeWallpaperModal);
    document.getElementById('btn-reset-wallpaper')?.addEventListener('click', () => {
      resetWallpaper();
      renderWallpaperOptions();
      syncControlsState();
    });

    // Scope toggle
    document.getElementById('btn-scope-chat')?.addEventListener('click', () => {
      setScope('chat');
      syncControlsState();
    });
    document.getElementById('btn-scope-all')?.addEventListener('click', () => {
      setScope('all');
      syncControlsState();
    });

    // Opacity slider
    const slider = document.getElementById('wallpaper-opacity-slider');
    const valText = document.getElementById('wallpaper-opacity-val');
    slider?.addEventListener('input', (e) => {
      const percent = parseInt(e.target.value, 10);
      if (valText) valText.textContent = `${percent}%`;
      setOpacity(percent / 100);
    });

    // Custom upload input
    const fileInput = document.getElementById('input-custom-wallpaper-file');
    const uploadBtn = document.getElementById('btn-upload-custom-wallpaper');
    uploadBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressedDataUrl = await compressImage(file, 1280, 0.82);
        setCustomWallpaper(compressedDataUrl);
        renderWallpaperOptions();
        syncControlsState();
      } catch (err) {
        console.error('Failed to load custom wallpaper:', err);
      }
      fileInput.value = '';
    });

    // Remove custom wallpaper button
    document.getElementById('btn-remove-custom-wallpaper')?.addEventListener('click', () => {
      resetWallpaper();
      renderWallpaperOptions();
      syncControlsState();
    });

    // Modal click outside to dismiss
    const modal = document.getElementById('modal-chat-wallpaper');
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeWallpaperModal();
    });
  }

  window.DuduWallpaper = {
    init,
    openModal: openWallpaperModal,
    closeModal: closeWallpaperModal,
    setPreset: setPresetWallpaper,
    setCustom: setCustomWallpaper,
    reset: resetWallpaper,
    apply: applyWallpaper,
    getPresets: () => PRESETS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
