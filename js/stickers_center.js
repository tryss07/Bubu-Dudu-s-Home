/**
 * Dudu & Bubu - Sticker Centre & Local Offline Storage Engine
 * Manages Core 300 startup download, modular sticker packs, and IndexedDB blob persistence.
 */

(function () {
  'use strict';

  const DB_NAME = 'DuduStickersDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'stickers';
  const DOWNLOADED_PACKS_KEY = 'dudu_downloaded_packs';
  const CORE_PACK_ID = 'core_300';
  const PACK_CHUNK_SIZE = 60;

  let dbPromise = null;
  const MAX_MEMORY_BLOB_URLS = 64; // Guardrail: Max 64 active blob URLs in memory (~8-10MB max)
  const memoryBlobUrls = new Map(); // file -> objectUrl (LRU tracked)
  const downloadedFilesSet = new Set();
  const downloadedPacksSet = new Set();
  let isDownloading = false;
  let currentDownloadInfo = null;

  function touchBlobUrl(file, url) {
    if (!file || !url) return url;
    if (memoryBlobUrls.has(file)) {
      memoryBlobUrls.delete(file);
    } else if (memoryBlobUrls.size >= MAX_MEMORY_BLOB_URLS) {
      // Evict oldest blob URL to prevent OOM
      const oldestKey = memoryBlobUrls.keys().next().value;
      if (oldestKey) {
        const oldUrl = memoryBlobUrls.get(oldestKey);
        try {
          URL.revokeObjectURL(oldUrl);
        } catch (_) {}
        memoryBlobUrls.delete(oldestKey);
      }
    }
    memoryBlobUrls.set(file, url);
    return url;
  }

  // Initialize downloaded packs from localStorage
  try {
    const savedPacks = JSON.parse(localStorage.getItem(DOWNLOADED_PACKS_KEY) || '[]');
    if (Array.isArray(savedPacks)) {
      savedPacks.forEach(id => downloadedPacksSet.add(id));
    }
  } catch (_) {}

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'file' });
          store.createIndex('packId', 'packId', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => {
        console.error('[StickersDB] Open error:', e.target.error);
        resolve(null);
      };
    });
    return dbPromise;
  }

  async function getStoredBlob(file) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(file);
        req.onsuccess = () => resolve(req.result ? req.result.blob : null);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function saveStoredBlob(file, category, blob, packId) {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const record = {
          file,
          category,
          blob,
          packId,
          savedAt: Date.now()
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  async function deleteStoredBlob(file) {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(file);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  // Define All Sticker Packs Partition
  let stickerPacks = null;

  function buildPacks() {
    if (stickerPacks) return stickerPacks;

    const catalog = window.DUDU_STICKERS_CATALOG || { dudu: [], bubu: [], couple: [] };
    const allDudu = catalog.dudu || [];
    const allBubu = catalog.bubu || [];
    const allCouple = catalog.couple || [];

    // Core 300: 100 Dudu, 100 Bubu, 100 Couple
    const coreDudu = allDudu.slice(0, 100);
    const coreBubu = allBubu.slice(0, 100);
    const coreCouple = allCouple.slice(0, 100);
    const coreFiles = [...coreDudu, ...coreBubu, ...coreCouple];

    const corePack = {
      id: CORE_PACK_ID,
      title: 'Default Sticker Pack',
      title_id: 'Paket Stiker Bawaan',
      category: 'core',
      isCore: true,
      count: coreFiles.length,
      files: coreFiles,
      previews: [
        coreDudu[0] || '',
        coreBubu[0] || '',
        coreCouple[0] || '',
        coreDudu[1] || ''
      ],
      description: '300 essential stickers (100 Dudu, 100 Bubu, 100 Couple). Loads first for instant offline chat.',
      description_id: '300 stiker bawaan (100 Dudu, 100 Bubu, 100 Berdua). Diunduh pertama agar chat offline instan.'
    };

    const packs = [corePack];

    // Helper to divide array into chunks
    function createCategoryPacks(files, catName, catKey, emoji) {
      let packIndex = 1;
      for (let i = 100; i < files.length; i += PACK_CHUNK_SIZE) {
        const chunk = files.slice(i, i + PACK_CHUNK_SIZE);
        const packId = `${catKey}_pack_${packIndex}`;
        const titleEn = `${catName} Pack ${packIndex}`;
        const titleId = `Paket ${catName} ${packIndex}`;

        packs.push({
          id: packId,
          title: titleEn,
          title_id: titleId,
          category: catKey,
          isCore: false,
          count: chunk.length,
          files: chunk,
          previews: [
            chunk[0] || '',
            chunk[1] || '',
            chunk[2] || '',
            chunk[3] || ''
          ],
          description: `${chunk.length} expressive animated stickers of ${catName}.`,
          description_id: `${chunk.length} stiker animasi ekspresif ${catName}.`
        });
        packIndex++;
      }
    }

    // Partition remaining stickers
    createCategoryPacks(allDudu, 'Dudu', 'dudu', '🐻');
    createCategoryPacks(allBubu, 'Bubu', 'bubu', '🐼');
    createCategoryPacks(allCouple, 'Couple', 'couple', '🐻🐼');

    stickerPacks = packs;
    return packs;
  }

  function getHttpBase() {
    return window.DuduChatSocket?.getHttpBaseUrl?.() || 'https://chat.nexora-v1.my.id';
  }

  function getRemoteUrlForFile(file) {
    const catalog = window.DUDU_STICKERS_CATALOG;
    if (!catalog) return `${getHttpBase()}/assets/stickers_dudu/${file}`;
    const canonical = catalog.getCanonical(file);
    const cat = catalog.getCategory(canonical);
    return `${getHttpBase()}/assets/stickers_${cat}/${canonical}`;
  }

  // Crashproof Zero-RAM Initialization: Load only keys into memory on init (<50KB RAM)
  async function init() {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }
    buildPacks();
    const db = await openDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        const finishInit = () => {
          // Verify core pack status
          const corePack = getPackById(CORE_PACK_ID);
          if (corePack) {
            const coreDownloadedCount = corePack.files.filter(f => downloadedFilesSet.has(f)).length;
            if (coreDownloadedCount >= corePack.files.length * 0.95) {
              downloadedPacksSet.add(CORE_PACK_ID);
              savePacksState();
            }
          }

          dispatchStickersUpdated();
          resolve();

          // Check if core 300 stickers need startup download gently after UI settles
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => checkStartupCoreDownload(), { timeout: 3000 });
          } else {
            setTimeout(() => checkStartupCoreDownload(), 1500);
          }
        };

        if (typeof store.getAllKeys === 'function') {
          const req = store.getAllKeys();
          req.onsuccess = () => {
            const keys = req.result || [];
            for (let i = 0; i < keys.length; i++) {
              downloadedFilesSet.add(keys[i]);
            }
            finishInit();
          };
          req.onerror = () => finishInit();
        } else {
          const req = store.openKeyCursor ? store.openKeyCursor() : store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const fileKey = cursor.key || cursor.primaryKey || cursor.value?.file;
              if (fileKey) downloadedFilesSet.add(fileKey);
              cursor.continue();
            } else {
              finishInit();
            }
          };
          req.onerror = () => finishInit();
        }
      } catch (_) {
        resolve();
      }
    });
  }

  function savePacksState() {
    try {
      localStorage.setItem(DOWNLOADED_PACKS_KEY, JSON.stringify([...downloadedPacksSet]));
    } catch (_) {}
  }

  function getPackById(packId) {
    const packs = buildPacks();
    return packs.find(p => p.id === packId) || null;
  }

  function isPackDownloaded(packId) {
    if (downloadedPacksSet.has(packId)) return true;
    const pack = getPackById(packId);
    if (!pack) return false;
    // If 95% of files are in storage, consider it downloaded
    const downloadedCount = pack.files.filter(f => downloadedFilesSet.has(f)).length;
    return downloadedCount >= Math.floor(pack.files.length * 0.95);
  }

  function isFileDownloaded(file) {
    if (!file) return false;
    const base = file.split('/').pop();
    return downloadedFilesSet.has(base);
  }

  function getStickerUrl(file) {
    if (!file) return '';
    const base = file.split('/').pop();
    if (memoryBlobUrls.has(base)) {
      const url = memoryBlobUrls.get(base);
      touchBlobUrl(base, url);
      return `${url}#${base}`;
    }
    const catalog = window.DUDU_STICKERS_CATALOG;
    if (catalog?.resolveStickerPath) {
      return catalog.resolveStickerPath(base);
    }
    return `assets/stickers_dudu/${base}`;
  }

  function getDownloadedStickers(category = 'all') {
    const catalog = window.DUDU_STICKERS_CATALOG;
    if (!catalog) return [];

    const isEn = (window.DuduI18n?.getLanguage?.() || 'id') === 'en';
    const result = [];
    const seen = new Set();

    // Iterate through all files that are locally downloaded
    for (const file of downloadedFilesSet) {
      const canonical = catalog.getCanonical(file);
      if (seen.has(canonical)) continue;
      seen.add(canonical);

      const cat = catalog.getCategory(canonical);
      if (category !== 'all' && category !== 'fav' && category !== 'gif' && cat !== category) {
        continue;
      }

      const filePath = memoryBlobUrls.get(file) || catalog.resolveStickerPath(canonical);
      const label = cat === 'bubu' ? 'Bubu' : (cat === 'couple' ? (isEn ? 'Dudu & Bubu' : 'Berdua') : 'Dudu');

      result.push({
        file,
        canonical,
        filePath,
        category: cat,
        title: `${label} #${result.length + 1}`
      });
    }

    return result;
  }

  const downloadQueue = [];

  // Concurrent Batch Downloader
  async function downloadPack(packId, options = {}) {
    if (isDownloading) {
      return new Promise((resolve) => {
        downloadQueue.push({
          packId,
          options: {
            ...options,
            onComplete: (pack) => {
              options.onComplete?.(pack);
              resolve(true);
            },
            onError: (err) => {
              options.onError?.(err);
              resolve(false);
            }
          }
        });
      });
    }

    const pack = getPackById(packId);
    if (!pack) {
      if (options.onError) options.onError(new Error('Pack not found'));
      return false;
    }

    isDownloading = true;
    const total = pack.files.length;
    let completed = 0;
    const catalog = window.DUDU_STICKERS_CATALOG;

    currentDownloadInfo = {
      packId,
      packTitle: pack.title,
      total,
      completed: 0,
      percent: 0
    };

    dispatchProgress();

    // Download pool worker - gentle concurrency to protect low-end mobile devices & WebView
    const CONCURRENCY = 4;
    let fileIndex = 0;
    let lastProgressTime = 0;

    function throttleProgress(force = false) {
      const now = Date.now();
      if (force || now - lastProgressTime > 80 || completed >= total) {
        lastProgressTime = now;
        if (options.onProgress) {
          options.onProgress(currentDownloadInfo);
        }
        dispatchProgress();
      }
    }

    async function worker() {
      while (fileIndex < total) {
        const idx = fileIndex++;
        const file = pack.files[idx];
        if (!file) continue;

        // Skip if already in memory
        if (!memoryBlobUrls.has(file)) {
          const canonical = catalog?.getCanonical(file) || file;
          const cat = catalog?.getCategory(canonical) || 'dudu';
          const remoteUrl = `${getHttpBase()}/assets/stickers_${cat}/${canonical}`;

          try {
            const res = await fetch(remoteUrl, { mode: 'cors', cache: 'default', signal: AbortSignal.timeout(8000) });
            if (res.ok) {
              const blob = await res.blob();
              await saveStoredBlob(file, cat, blob, packId);
              downloadedFilesSet.add(file);
              const objectUrl = URL.createObjectURL(blob);
              touchBlobUrl(file, objectUrl);
            }
          } catch (err) {
            // Silently continue for resilience; retry on next run
          }
        } else {
          downloadedFilesSet.add(file);
        }

        completed++;
        currentDownloadInfo.completed = completed;
        currentDownloadInfo.percent = Math.round((completed / total) * 100);
        throttleProgress();

        // Small yield to prevent event loop starvation and garbage collection pressure
        await new Promise(r => setTimeout(r, 15));
      }
    }

    const workers = [];
    for (let w = 0; w < CONCURRENCY; w++) {
      workers.push(worker());
    }

    await Promise.all(workers);

    downloadedPacksSet.add(packId);
    savePacksState();

    isDownloading = false;
    currentDownloadInfo = null;
    dispatchProgress();
    dispatchStickersUpdated();

    if (options.onComplete) {
      options.onComplete(pack);
    }

    if (downloadQueue.length > 0) {
      const next = downloadQueue.shift();
      downloadPack(next.packId, next.options);
    }

    if (window.showToast) {
      const isEn = (window.DuduI18n?.getLanguage?.() || 'id') === 'en';
      window.showToast(isEn ? `${pack.title} downloaded!` : `${pack.title_id || pack.title} berhasil diunduh!`);
    }

    return true;
  }

  async function deletePack(packId) {
    if (packId === CORE_PACK_ID) {
      if (window.showToast) {
        const isEn = (window.DuduI18n?.getLanguage?.() || 'id') === 'en';
        window.showToast(isEn ? 'Core pack cannot be deleted' : 'Paket utama tidak dapat dihapus');
      }
      return false;
    }

    const pack = getPackById(packId);
    if (!pack) return false;

    // Delete non-core files
    for (const file of pack.files) {
      await deleteStoredBlob(file);
      downloadedFilesSet.delete(file);
      if (memoryBlobUrls.has(file)) {
        try {
          URL.revokeObjectURL(memoryBlobUrls.get(file));
        } catch (_) {}
        memoryBlobUrls.delete(file);
      }
    }

    downloadedPacksSet.delete(packId);
    savePacksState();

    dispatchStickersUpdated();

    if (window.showToast) {
      const isEn = (window.DuduI18n?.getLanguage?.() || 'id') === 'en';
      window.showToast(isEn ? `${pack.title} deleted` : `${pack.title_id || pack.title} dihapus`);
    }

    return true;
  }

  function dispatchProgress() {
    window.dispatchEvent(new CustomEvent('dudu-sticker-progress', {
      detail: currentDownloadInfo ? { ...currentDownloadInfo } : null
    }));
  }

  function dispatchStickersUpdated() {
    window.dispatchEvent(new CustomEvent('dudu-stickers-updated', {
      detail: {
        totalDownloaded: downloadedFilesSet.size,
        packsDownloaded: [...downloadedPacksSet]
      }
    }));
  }

  // Automatic Core 300 Download on Startup
  function checkStartupCoreDownload() {
    const corePack = getPackById(CORE_PACK_ID);
    if (!corePack) return;

    const downloadedCount = corePack.files.filter(f => downloadedFilesSet.has(f)).length;
    if (downloadedCount < corePack.files.length) {
      // Small timeout to allow DOM to finish rendering
      setTimeout(() => {
        downloadPack(CORE_PACK_ID, {
          onProgress: (info) => {
            renderTopProgressBar(info);
          },
          onComplete: () => {
            renderTopProgressBar(null);
            renderStickerCenterUI();
            if (window.DuduChatUI?.refreshStickers) {
              window.DuduChatUI.refreshStickers();
            }
          }
        });
      }, 600);
    }
  }

  // ==========================================
  // STICKER CENTRE PANEL UI RENDERING
  // ==========================================

  let currentCategoryFilter = 'all';

  function renderTopProgressBar(progressInfo) {
    const container = document.getElementById('sticker-center-progress-bar-container');
    if (!container) return;

    const isEn = (window.DuduI18n?.getLanguage?.() || 'id') === 'en';

    if (progressInfo && progressInfo.percent < 100) {
      container.classList.remove('hidden');
      container.innerHTML = `
        <div class="bg-white/95 dark:bg-stone-800/95 backdrop-blur-md border border-[#E8DACB] dark:border-stone-700 rounded-2xl p-3 plush-shadow flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs font-heading">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="font-extrabold text-[#8D5B4C] dark:text-[#F5C7A9] truncate">
                ${isEn ? 'Downloading:' : 'Mengunduh:'} ${escapeHtml(progressInfo.packTitle)}
              </span>
            </div>
            <span class="font-black text-[#4A3222] dark:text-stone-100 shrink-0">
              ${progressInfo.completed} / ${progressInfo.total} (${progressInfo.percent}%)
            </span>
          </div>
          <div class="w-full bg-[#E8DACB]/40 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden p-0.5">
            <div class="bg-gradient-to-r from-[#D48B70] via-[#8D5B4C] to-[#5C4033] h-full rounded-full transition-all duration-200" style="width: ${progressInfo.percent}%"></div>
          </div>
        </div>
      `;
    } else {
      // Idle / ready state summary
      const totalDownloaded = downloadedFilesSet.size;
      const totalAll = buildPacks().reduce((sum, p) => sum + p.count, 0);
      container.classList.remove('hidden');
      container.innerHTML = `
        <div class="bg-white/90 dark:bg-stone-800/90 rounded-2xl p-2.5 border border-[#E8DACB]/80 dark:border-stone-700 plush-shadow flex items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">📦</span>
            <span class="font-heading font-extrabold text-[#4A3222] dark:text-stone-200">
              ${isEn ? 'Downloaded:' : 'Terunduh:'} 
              <span class="text-[#8D5B4C] dark:text-[#F5C7A9]">${totalDownloaded.toLocaleString()}</span> / ${totalAll.toLocaleString()}
            </span>
          </div>
          <button id="btn-sync-core-stickers" type="button" class="px-2.5 py-1 rounded-full bg-[#FAF5EE] dark:bg-stone-700 hover:bg-[#F5C7A9]/40 border border-[#E8DACB] text-[10px] font-bold text-[#8D5B4C] dark:text-stone-200 cursor-pointer button-press">
            ${isEn ? 'Check Updates' : 'Cek Pembaruan'}
          </button>
        </div>
      `;

      document.getElementById('btn-sync-core-stickers')?.addEventListener('click', () => {
        downloadPack(CORE_PACK_ID, {
          onProgress: renderTopProgressBar,
          onComplete: () => {
            renderTopProgressBar(null);
            renderStickerCenterUI();
          }
        });
      });
    }
  }

  function renderStickerCenterUI() {
    const listContainer = document.getElementById('sticker-packs-list');
    if (!listContainer) return;

    const isEn = (window.DuduI18n?.getLanguage?.() || 'id') === 'en';
    const packs = buildPacks();

    renderTopProgressBar(currentDownloadInfo);

    let filtered = packs;
    if (currentCategoryFilter === 'core') {
      filtered = packs.filter(p => p.isCore);
    } else if (currentCategoryFilter === 'dudu') {
      filtered = packs.filter(p => p.category === 'dudu');
    } else if (currentCategoryFilter === 'bubu') {
      filtered = packs.filter(p => p.category === 'bubu');
    } else if (currentCategoryFilter === 'couple') {
      filtered = packs.filter(p => p.category === 'couple');
    } else if (currentCategoryFilter === 'downloaded') {
      filtered = packs.filter(p => isPackDownloaded(p.id));
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="col-span-full py-12 flex flex-col items-center justify-center text-center">
          <span class="text-4xl mb-2">🐾</span>
          <p class="text-xs text-stone-500 dark:text-stone-400 font-heading">
            ${isEn ? 'No sticker packs found in this category' : 'Tidak ada paket stiker dalam kategori ini'}
          </p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(pack => {
      const downloaded = isPackDownloaded(pack.id);
      const isCurrentlyDownloading = isDownloading && currentDownloadInfo?.packId === pack.id;
      const title = isEn ? pack.title : (pack.title_id || pack.title);
      const desc = isEn ? pack.description : (pack.description_id || pack.description);

      const categoryBadge = pack.isCore 
        ? (isEn ? '🌟 Default Pack' : '🌟 Paket Bawaan')
        : (pack.category === 'bubu' ? '🐼 Bubu' : (pack.category === 'couple' ? '🐻🐼 Couple' : '🐻 Dudu'));

      const previewsHtml = (pack.previews || []).slice(0, 4).map(file => {
        const url = getRemoteUrlForFile(file);
        return `
          <div class="w-12 h-12 rounded-xl bg-[#FAF5EE] dark:bg-stone-700/60 p-1 flex items-center justify-center border border-[#E8DACB]/60 dark:border-stone-600/50">
            <img src="${url}" alt="Preview" loading="lazy" class="max-w-full max-h-full object-contain filter drop-shadow-xs" onerror="window.DuduStickers?.handleImageError?.(this);">
          </div>
        `;
      }).join('');

      let actionButtonHtml = '';
      if (isCurrentlyDownloading) {
        actionButtonHtml = `
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-[#8D5B4C]">${currentDownloadInfo.percent}%</span>
            <button disabled class="px-3.5 py-1.5 rounded-full bg-[#E8DACB] text-[#4A3222] text-xs font-extrabold opacity-75 cursor-not-allowed">
              ${isEn ? 'Downloading...' : 'Mengunduh...'}
            </button>
          </div>
        `;
      } else if (downloaded) {
        actionButtonHtml = `
          <div class="flex items-center gap-1.5">
            <span class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center" title="${isEn ? 'Downloaded' : 'Sudah Terunduh'}">
              <span class="material-symbols-outlined text-lg">check_circle</span>
            </span>
            ${!pack.isCore ? `
              <button type="button" data-delete-pack="${pack.id}" class="w-8 h-8 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 dark:bg-stone-700 flex items-center justify-center cursor-pointer button-press transition-colors" title="${isEn ? 'Delete to free space' : 'Hapus untuk kosongkan ruang'}">
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            ` : ''}
          </div>
        `;
      } else {
        actionButtonHtml = `
          <button type="button" data-download-pack="${pack.id}" class="px-4 py-1.5 rounded-full bg-[#8D5B4C] hover:bg-[#9E6959] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer button-press plush-shadow">
            <span class="material-symbols-outlined text-base">download</span>
            ${isEn ? `Download (${pack.count})` : `Unduh (${pack.count})`}
          </button>
        `;
      }

      return `
        <div class="bg-white dark:bg-stone-800 rounded-3xl p-4 plush-shadow border border-[#E8DACB] dark:border-stone-700 flex flex-col justify-between gap-3 transition-all hover:border-[#8D5B4C]/40">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8D5B4C]/10 text-[#8D5B4C] dark:text-[#F5C7A9]">
                  ${categoryBadge}
                </span>
                <span class="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  ${pack.count} ${isEn ? 'stickers' : 'stiker'}
                </span>
              </div>
              <h3 class="font-heading font-extrabold text-sm text-[#4A3222] dark:text-stone-100">
                ${escapeHtml(title)}
              </h3>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                ${escapeHtml(desc)}
              </p>
            </div>
            ${actionButtonHtml}
          </div>

          <!-- Sticker Thumbnails Preview -->
          <div class="flex items-center gap-2 pt-2 border-t border-[#E8DACB]/40 dark:border-stone-700/60 overflow-x-auto no-scrollbar">
            ${previewsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    listContainer.querySelectorAll('[data-download-pack]').forEach(btn => {
      btn.addEventListener('click', () => {
        const packId = btn.getAttribute('data-download-pack');
        downloadPack(packId, {
          onProgress: (info) => {
            renderTopProgressBar(info);
            renderStickerCenterUI();
          },
          onComplete: () => {
            renderTopProgressBar(null);
            renderStickerCenterUI();
            if (window.DuduChatUI?.refreshStickers) {
              window.DuduChatUI.refreshStickers();
            }
          }
        });
      });
    });

    listContainer.querySelectorAll('[data-delete-pack]').forEach(btn => {
      btn.addEventListener('click', () => {
        const packId = btn.getAttribute('data-delete-pack');
        deletePack(packId).then(() => {
          renderStickerCenterUI();
          if (window.DuduChatUI?.refreshStickers) {
            window.DuduChatUI.refreshStickers();
          }
        });
      });
    });
  }

  function initFilterButtons() {
    document.querySelectorAll('.stk-center-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.stk-center-filter-btn').forEach(b => {
          b.classList.remove('bg-[#8D5B4C]', 'text-white', 'shadow-xs');
          b.classList.add('bg-[#FAF5EE]', 'dark:bg-stone-700', 'text-[#4A3222]', 'dark:text-stone-300');
        });
        btn.classList.add('bg-[#8D5B4C]', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-[#FAF5EE]', 'dark:bg-stone-700', 'text-[#4A3222]', 'dark:text-stone-300');
        currentCategoryFilter = btn.getAttribute('data-filter') || 'all';
        renderStickerCenterUI();
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Global Exports
  window.DuduStickerStore = {
    init,
    buildPacks,
    getPackById,
    isPackDownloaded,
    isFileDownloaded,
    getStickerUrl,
    getStoredBlob,
    touchBlobUrl,
    getDownloadedStickers,
    downloadPack,
    deletePack,
    get isDownloading() { return isDownloading; },
    downloadedFilesSet,
    downloadedPacksSet,
    renderStickerCenterUI,
    CORE_PACK_ID
  };

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initFilterButtons();
    });
  } else {
    init();
    initFilterButtons();
  }

  window.addEventListener('dudu-sticker-progress', (e) => {
    renderTopProgressBar(e.detail);
  });

  window.addEventListener('dudu-stickers-updated', () => {
    renderStickerCenterUI();
  });

  window.addEventListener('dudu-language-changed', () => {
    renderStickerCenterUI();
  });
})();
