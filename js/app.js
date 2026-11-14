/**
 * Undangan Pernikahan Digital - Interactive Application Logic
 * Modern, Responsive, & Elegant
 */

document.addEventListener('DOMContentLoaded', () => {
  initGuestName();
  initCoverGate();
  initAudioPlayer();
  initCountdownTimer();
  initClipboardButtons();
  initGuestbookRSVP();
  initGalleryLightbox();
  initScrollSpy();
  initPetalAnimation();
});

/* ==========================================================================
   1. Dynamic Guest Name from URL Parameter
   ========================================================================== */
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  // Mendukung parameter: ?to=Nama+Tamu atau ?u=Nama+Tamu atau ?guest=Nama+Tamu
  const guestName = urlParams.get('to') || urlParams.get('u') || urlParams.get('guest');
  
  const guestDisplay = document.getElementById('guest-name');
  const rsvpNameInput = document.getElementById('rsvp-name');
  
  if (guestName && guestName.trim() !== '') {
    const formattedName = decodeURIComponent(guestName.replace(/\+/g, ' '));
    if (guestDisplay) {
      guestDisplay.textContent = formattedName;
    }
    if (rsvpNameInput) {
      rsvpNameInput.value = formattedName;
    }
  } else {
    if (guestDisplay) {
      guestDisplay.textContent = 'Tamu Undangan';
    }
  }
}

/* ==========================================================================
   2. Cover Gate & Open Invitation Trigger
   ========================================================================== */
function initCoverGate() {
  const coverGate = document.getElementById('cover-gate');
  const btnOpen = document.getElementById('btn-open-invitation');
  
  if (!coverGate || !btnOpen) return;

  const urlParams = new URLSearchParams(window.location.search);
  const previewMode = urlParams.get('preview');

  if (previewMode === 'couple') {
    coverGate.style.display = 'none';
    const heroEl = document.getElementById('hero');
    if (heroEl) heroEl.style.display = 'none';
    document.body.style.overflow = 'auto';
  } else if (previewMode === 'event') {
    coverGate.style.display = 'none';
    const heroEl = document.getElementById('hero');
    const coupleEl = document.getElementById('mempelai');
    if (heroEl) heroEl.style.display = 'none';
    if (coupleEl) coupleEl.style.display = 'none';
    document.body.style.overflow = 'auto';
  } else if (urlParams.get('opened') === 'true') {
    coverGate.classList.add('opened');
    document.body.style.overflow = 'auto';
  } else {
    // Kunci scroll saat cover masih tertutup
    document.body.style.overflow = 'hidden';
  }

  btnOpen.addEventListener('click', () => {
    coverGate.classList.add('opened');
    document.body.style.overflow = 'auto';

    // Mulai musik saat tamu mengklik tombol (memenuhi policy browser autoplay)
    if (window.weddingAudio) {
      window.weddingAudio.play();
    }

    // Scroll halus ke seksi pembuka setelah transisi cover
    setTimeout(() => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 400);
  });
}

/* ==========================================================================
   3. Background Music & Web Audio Fallback
   ========================================================================== */
function initAudioPlayer() {
  const audioEl = document.getElementById('bg-audio');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const discAnim = document.getElementById('music-disc');
  const iconPlaying = document.getElementById('icon-music-playing');
  const iconMuted = document.getElementById('icon-music-muted');

  let isPlaying = false;
  let audioContext = null;
  let synthLoopTimeout = null;

  // Fallback Audio Synthesizer (Harmoni piano/harp santai jika file audio remote diblokir/offline)
  function startSynthesizerHarp() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) {
        audioContext = new AudioContext();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Progresi akord romantis: C - G/B - Am - F
      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C major
        [246.94, 293.66, 392.00, 493.88], // G/B
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 220.00, 261.63, 349.23], // F major
      ];

      let chordIndex = 0;
      function playChordArpeggio() {
        if (!isPlaying) return;
        const currentChord = chords[chordIndex % chords.length];
        currentChord.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.28);
          
          gain.gain.setValueAtTime(0.001, audioContext.currentTime + i * 0.28);
          gain.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + i * 0.28 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + i * 0.28 + 1.8);

          osc.connect(gain);
          gain.connect(audioContext.destination);

          osc.start(audioContext.currentTime + i * 0.28);
          osc.stop(audioContext.currentTime + i * 0.28 + 2.0);
        });

        chordIndex++;
        synthLoopTimeout = setTimeout(playChordArpeggio, 2200);
      }

      playChordArpeggio();
    } catch (e) {
      console.warn('Web Audio synthesis not supported', e);
    }
  }

  function stopSynthesizerHarp() {
    if (synthLoopTimeout) {
      clearTimeout(synthLoopTimeout);
      synthLoopTimeout = null;
    }
    if (audioContext && audioContext.state === 'running') {
      audioContext.suspend();
    }
  }

  function play() {
    isPlaying = true;
    if (audioEl) {
      audioEl.play().catch(() => {
        // Jika file mp3 gagal diputar atau CORS, jalankan synthesizer melodi
        startSynthesizerHarp();
      });
    } else {
      startSynthesizerHarp();
    }

    if (discAnim) discAnim.classList.add('animate-spin-slow');
    if (iconPlaying) iconPlaying.classList.remove('hidden');
    if (iconMuted) iconMuted.classList.add('hidden');
  }

  function pause() {
    isPlaying = false;
    if (audioEl) audioEl.pause();
    stopSynthesizerHarp();

    if (discAnim) discAnim.classList.remove('animate-spin-slow');
    if (iconPlaying) iconPlaying.classList.add('hidden');
    if (iconMuted) iconMuted.classList.remove('hidden');
  }

  window.weddingAudio = { play, pause, isPlaying: () => isPlaying };

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', () => {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    });
  }
}

/* ==========================================================================
   4. Real-time Countdown Timer
   ========================================================================== */
function initCountdownTimer() {
  // Tanggal target acara (Format ISO: YYYY-MM-DDTHH:mm:ss)
  // Default: 28 November 2026 pukul 09:00 WIB
  const targetDateStr = '2026-11-28T09:00:00+07:00';
  const targetDate = new Date(targetDateStr).getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   5. Copy to Clipboard & Toast Notification
   ========================================================================== */
function initClipboardButtons() {
  const copyButtons = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.remove('hide');
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
    }, 2800);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      const label = btn.getAttribute('data-copy-label') || 'Teks';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`${label} berhasil disalin ke clipboard!`);
        }).catch(() => {
          fallbackCopyText(textToCopy, label);
        });
      } else {
        fallbackCopyText(textToCopy, label);
      }
    });
  });

  function fallbackCopyText(text, label) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(`${label} berhasil disalin!`);
    } catch (err) {
      showToast(`Gagal menyalin ${label}`);
    }
    document.body.removeChild(tempInput);
  }
}

/* ==========================================================================
   6. Guestbook & RSVP (Local Storage + Live Rendering)
   ========================================================================== */
function initGuestbookRSVP() {
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesListContainer = document.getElementById('wishes-list');
  const totalWishesCount = document.getElementById('total-wishes-count');
  const STORAGE_KEY = 'wedding_dimas_sarah_wishes';

  // Data ucapan default awal agar buku tamu langsung terlihat hangat & meriah
  const defaultWishes = [
    {
      name: 'Rahmat & Keluarga',
      attendance: 'hadir',
      pax: 2,
      message: 'Selamat menempuh hidup baru Dimas & Sarah! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Bahagia selalu sampai akhir hayat.',
      time: '1 jam yang lalu'
    },
    {
      name: 'Annisa Pratiwi',
      attendance: 'hadir',
      pax: 1,
      message: 'MasyaAllah tabarakallah Sarah cantik banget! Selamat yaa buat kalian berdua, lancar-lancar acaranya sampai hari H.',
      time: '3 jam yang lalu'
    },
    {
      name: 'Budi Santoso',
      attendance: 'ragu',
      pax: 1,
      message: 'Happy wedding bro Dimas! Semoga dilancarkan semua rangkaian acaranya. Doa terbaik untuk kalian berdua!',
      time: 'Kemarin'
    }
  ];

  function getStoredWishes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWishes));
      return defaultWishes;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return defaultWishes;
    }
  }

  function renderWishes() {
    if (!wishesListContainer) return;
    const wishes = getStoredWishes();

    if (totalWishesCount) {
      totalWishesCount.textContent = `(${wishes.length} Doa & Ucapan)`;
    }

    wishesListContainer.innerHTML = '';
    wishes.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'glass-card p-4 rounded-xl border border-emerald-900/60 relative';

      // Badge kehadiran
      let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      let badgeText = 'Hadir';
      if (item.attendance === 'tidak') {
        badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        badgeText = 'Berhalangan';
      } else if (item.attendance === 'ragu') {
        badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        badgeText = 'Masih Ragu';
      }

      const paxInfo = item.pax ? ` • ${item.pax} Orang` : '';

      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-emerald-950 font-serif">
              ${item.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="font-semibold text-sm text-amber-200">${escapeHtml(item.name)}</h4>
              <span class="text-[11px] text-emerald-300/60">${item.time || 'Baru saja'}</span>
            </div>
          </div>
          <span class="text-xs px-2.5 py-0.5 rounded-full border ${badgeClass}">
            ${badgeText}${paxInfo}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed pl-10">${escapeHtml(item.message)}</p>
      `;
      wishesListContainer.appendChild(card);
    });
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('rsvp-name');
      const attendanceInput = document.getElementById('rsvp-attendance');
      const paxInput = document.getElementById('rsvp-pax');
      const messageInput = document.getElementById('rsvp-message');

      if (!nameInput.value.trim() || !messageInput.value.trim()) {
        alert('Mohon isi nama dan doa ucapan Anda.');
        return;
      }

      const newWish = {
        name: nameInput.value.trim(),
        attendance: attendanceInput ? attendanceInput.value : 'hadir',
        pax: paxInput ? parseInt(paxInput.value, 10) : 1,
        message: messageInput.value.trim(),
        time: 'Baru saja'
      };

      const wishes = getStoredWishes();
      wishes.unshift(newWish);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));

      // Reset form pesan saja, simpan nama jika dari link
      messageInput.value = '';
      renderWishes();

      // Feedback toast
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toast-message');
      if (toast && toastMessage) {
        toastMessage.textContent = 'Terima kasih atas doa & konfirmasi kehadiran Anda!';
        toast.classList.remove('hide');
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          toast.classList.add('hide');
        }, 3200);
      }
    });
  }

  renderWishes();
}

/* ==========================================================================
   7. Gallery Lightbox Modal
   ========================================================================== */
function initGalleryLightbox() {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  const galleryItems = Array.from(document.querySelectorAll('[data-gallery-src]'));

  if (!lightboxModal || !lightboxImg || galleryItems.length === 0) return;

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    const src = item.getAttribute('data-gallery-src') || item.src;
    lightboxImg.src = src;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  if (btnClose) btnClose.addEventListener('click', closeLightbox);
  if (btnNext) btnNext.addEventListener('click', nextImage);
  if (btnPrev) btnPrev.addEventListener('click', prevImage);

  // Close on backdrop click
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
}

/* ==========================================================================
   8. Scroll Spy & Floating Bottom Navigation
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.bottom-nav-item');

  if (sections.length === 0 || navItems.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navItems.forEach((btn) => {
      const target = btn.getAttribute('data-target');
      if (target === currentId) {
        btn.classList.add('text-amber-300');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('text-amber-300');
        btn.classList.add('text-slate-400');
      }
    });
  });

  // Smooth scroll click
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   9. Falling Petals / Sparkle Particle Animation
   ========================================================================== */
function initPetalAnimation() {
  const container = document.getElementById('petal-container');
  if (!container) return;

  const maxPetals = 16;
  for (let i = 0; i < maxPetals; i++) {
    createPetal(container);
  }

  function createPetal(parent) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = Math.random() * 8 + 6;
    const startX = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * 5;

    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left = `${startX}%`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;

    parent.appendChild(petal);

    // Re-spawn setelah animasi selesai
    petal.addEventListener('animationiteration', () => {
      petal.style.left = `${Math.random() * 100}%`;
    });
  }
}
