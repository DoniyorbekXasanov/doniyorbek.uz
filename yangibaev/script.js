/**
 * Teacher's Day Tribute — Scroll animations & interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // Intersection Observer for reveal animations
  // ============================
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Don't unobserve — we want to keep the state
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  // Observe all reveal items
  document.querySelectorAll('.reveal-item').forEach((el) => {
    revealObserver.observe(el);
  });

  // ============================
  // Timeline items — staggered reveal
  // ============================
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.stage, 10) * 150;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.timeline-item').forEach((el) => {
    timelineObserver.observe(el);
  });

  // ============================
  // Lesson cards — staggered reveal
  // ============================
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Find the card index among siblings
          const card = entry.target;
          const cards = Array.from(card.parentElement.children);
          const cardIndex = cards.indexOf(card);
          setTimeout(() => {
            card.classList.add('revealed');
          }, cardIndex * 100);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.lesson-card').forEach((el) => {
    cardObserver.observe(el);
  });

  // ============================
  // Timeline progress line
  // ============================
  const timelineSection = document.querySelector('.timeline');
  const timelineProgress = document.querySelector('.timeline-line-progress');

  if (timelineSection && timelineProgress) {
    const updateTimeline = () => {
      const rect = timelineSection.getBoundingClientRect();
      const viewH = window.innerHeight;

      // Calculate how much of the timeline is scrolled through
      const start = rect.top;
      const end = rect.bottom;
      const totalHeight = end - start;

      // Progress: 0 when top of timeline is at bottom of viewport,
      // 1 when bottom of timeline is at top of viewport
      const scrolled = (viewH - start) / (totalHeight + viewH);
      const progress = Math.max(0, Math.min(1, scrolled));

      timelineProgress.style.height = `${progress * 100}%`;
    };

    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  // ============================
  // Publication cards — staggered reveal
  // ============================
  const pubCardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const cards = Array.from(card.parentElement.children);
          const cardIndex = cards.indexOf(card);
          setTimeout(() => {
            card.classList.add('revealed');
          }, cardIndex * 150);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.publication-card').forEach((el) => {
    pubCardObserver.observe(el);
  });

  // ============================
  // Scopus field tags — staggered fade in
  // ============================
  const fieldTagsContainer = document.querySelector('.scopus-fields');
  if (fieldTagsContainer) {
    const fieldTagObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tags = entry.target.querySelectorAll('.scopus-field-tag');
            tags.forEach((tag, i) => {
              tag.style.opacity = '0';
              tag.style.transform = 'translateY(10px) scale(0.9)';
              tag.style.transition = `opacity 0.5s ${i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s ${i * 0.08}s cubic-bezier(0.16, 1, 0.3, 1)`;
              setTimeout(() => {
                tag.style.opacity = '1';
                tag.style.transform = 'translateY(0) scale(1)';
              }, 50);
            });
            fieldTagObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    fieldTagObserver.observe(fieldTagsContainer);
  }

  // ============================
  // Tribute lines — staggered delay
  // ============================
  const tributeLines = document.querySelectorAll('.tribute-line');
  const tributeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const lines = Array.from(el.parentElement.children);
          const lineIndex = lines.indexOf(el);
          setTimeout(() => {
            el.classList.add('revealed');
          }, lineIndex * 200);
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  tributeLines.forEach((el) => {
    tributeObserver.observe(el);
  });

  // ============================
  // Scroll indicator hide
  // ============================
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    let hidden = false;
    window.addEventListener('scroll', () => {
      if (!hidden && window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.transition = 'opacity 0.5s ease';
        hidden = true;
      }
    }, { passive: true });
  }

  // ============================
  // Smooth section fades with parallax-like effect
  // ============================
  const messageParagraphs = document.querySelectorAll('.message-content p');
  const messageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  messageParagraphs.forEach((p, i) => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(20px)';
    p.style.transition = `opacity 0.7s ${i * 0.1}s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s ${i * 0.1}s cubic-bezier(0.16, 1, 0.3, 1)`;
    messageObserver.observe(p);
  });

  // ============================
  // Final section — reveal
  // ============================
  const finalElements = document.querySelectorAll('.final-heading, .final-message, .final-signature, .final-decoration');
  const finalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  finalElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = `opacity 0.8s ${i * 0.15}s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s ${i * 0.15}s cubic-bezier(0.16, 1, 0.3, 1)`;
    finalObserver.observe(el);
  });

  // ============================
  // Appreciation section — special reveal
  // ============================
  const appreciationQuote = document.querySelector('.appreciation-quote');
  if (appreciationQuote) {
    const apprObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            appreciationQuote.style.opacity = '1';
            appreciationQuote.style.transform = 'scale(1)';
          }
        });
      },
      { threshold: 0.3 }
    );

    appreciationQuote.style.opacity = '0';
    appreciationQuote.style.transform = 'scale(0.95)';
    appreciationQuote.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    apprObserver.observe(appreciationQuote);
  }

  // ============================================================
  // INTERACTIVE CELEBRATION, CANVASES, HOTLINE & ML LAB
  // ============================================================

  // 1. SOUND SYSTEM (Web Audio API - Synthesized, No external audio files needed)
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function playChime(kind = 'celebrate') {
    if (!soundEnabled) return;
    if (kind === 'celebrate') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.28, 0.09), idx * 80);
      });
    } else if (kind === 'coffee') {
      playTone(440, 'sine', 0.15, 0.06);
      setTimeout(() => playTone(880, 'sine', 0.22, 0.07), 100);
    } else if (kind === 'respect') {
      playTone(659.25, 'sine', 0.15, 0.07);
      setTimeout(() => playTone(987.77, 'sine', 0.22, 0.08), 80);
    } else if (kind === 'tree') {
      [440, 554.37, 659.25].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.2, 0.06), idx * 70);
      });
    } else if (kind === 'ac') {
      [587.33, 739.99, 880.00, 1174.66].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.35, 0.1), idx * 75);
      });
    }
  }

  // 2. TOAST SYSTEM
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, icon = '🎉') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 350);
    }, 3800);
  }

  // 3. CONFETTI ENGINE (Pure Canvas)
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiPieces = [];
  let confettiRunning = false;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  const confettiColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];

  class Confetto {
    constructor(x, y, isCannon = false) {
      this.x = x !== undefined ? x : Math.random() * confettiCanvas.width;
      this.y = y !== undefined ? y : -10;
      this.size = Math.random() * 8 + 6;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      if (isCannon) {
        const angle = Math.random() * Math.PI - Math.PI;
        const speed = Math.random() * 16 + 10;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      } else {
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 3 + 2;
      }
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.opacity = 1;
      this.gravity = 0.35;
      this.drag = 0.985;
      this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    }

    update() {
      this.vx *= this.drag;
      this.vy += this.gravity;
      this.vy *= this.drag;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      if (this.y > confettiCanvas.height - 50) {
        this.opacity -= 0.02;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function launchConfetti(originX, originY, count = 70) {
    if (!confettiCanvas) return;
    const x = originX !== undefined ? originX : confettiCanvas.width / 2;
    const y = originY !== undefined ? originY : confettiCanvas.height / 2;

    for (let i = 0; i < count; i++) {
      confettiPieces.push(new Confetto(x, y, true));
    }

    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(runConfetti);
    }
  }

  function runConfetti() {
    if (!confettiCtx || !confettiPieces.length) {
      confettiRunning = false;
      if (confettiCtx) confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let i = confettiPieces.length - 1; i >= 0; i--) {
      const p = confettiPieces[i];
      p.update();
      p.draw(confettiCtx);
      if (p.opacity <= 0 || p.y > confettiCanvas.height + 20) {
        confettiPieces.splice(i, 1);
      }
    }
    requestAnimationFrame(runConfetti);
  }

  // 4. AMBIENT ALGORITHM CONSTELLATION CANVAS
  const ambientCanvas = document.getElementById('ambient-canvas');
  if (ambientCanvas) {
    const actx = ambientCanvas.getContext('2d');
    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const symbols = ['0', '1', '{ }', 'O(1)', 'AC', 'λ', '🌲', 'Tree', 'ICPC', 'cout<<'];
    const particles = [];
    const particleCount = Math.min(36, Math.floor(window.innerWidth / 40));

    let mousePos = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        isSymbol: Math.random() > 0.45,
      });
    }

    function renderAmbient() {
      actx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw particle or code symbol
        if (p.isSymbol) {
          actx.font = '10px "JetBrains Mono", monospace';
          actx.fillStyle = 'rgba(59, 130, 246, 0.28)';
          actx.fillText(p.symbol, p.x, p.y);
        } else {
          actx.beginPath();
          actx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          actx.fillStyle = 'rgba(139, 92, 246, 0.35)';
          actx.fill();
        }

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            actx.beginPath();
            actx.moveTo(p.x, p.y);
            actx.lineTo(p2.x, p2.y);
            actx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - dist / 115)})`;
            actx.lineWidth = 0.8;
            actx.stroke();
          }
        }

        // Connection to mouse
        const mdx = p.x - mousePos.x;
        const mdy = p.y - mousePos.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 130) {
          actx.beginPath();
          actx.moveTo(p.x, p.y);
          actx.lineTo(mousePos.x, mousePos.y);
          actx.strokeStyle = `rgba(6, 182, 212, ${0.22 * (1 - mdist / 130)})`;
          actx.lineWidth = 1;
          actx.stroke();
        }
      }

      requestAnimationFrame(renderAmbient);
    }
    requestAnimationFrame(renderAmbient);
  }

  // 5. RESPECT & GRATITUDE COUNTER
  let respectCount = parseInt(localStorage.getItem('prof_yangibaev_respect') || '1024', 10);
  const floatingCountEl = document.getElementById('floating-count');
  function updateRespectUI() {
    if (floatingCountEl) floatingCountEl.textContent = respectCount.toLocaleString();
  }
  updateRespectUI();

  const particlePraiseList = [
    '+1000 Aura! ⚡',
    'Infinite Respect! 🎓',
    'Fresh Espresso! ☕',
    'AC (0.00ms) 🟢',
    'Pure Decision Tree! 🌲',
    'ICPC Legend! 🏆',
    'O(1) Wisdom! 💡',
    'Thank You, Professor! ❤️',
  ];

  function spawnFlyingParticle(x, y, customText = null) {
    const particle = document.createElement('div');
    particle.className = 'flying-particle';
    particle.textContent = customText || particlePraiseList[Math.floor(Math.random() * particlePraiseList.length)];
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 80}px`);
    particle.style.color = Math.random() > 0.5 ? '#38bdf8' : '#a855f7';
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1400);
  }

  function addRespect(e, amount = 1, customToast = null) {
    respectCount += amount;
    localStorage.setItem('prof_yangibaev_respect', respectCount.toString());
    updateRespectUI();

    const clientX = e && e.clientX ? e.clientX : window.innerWidth / 2;
    const clientY = e && e.clientY ? e.clientY : window.innerHeight / 2;

    spawnFlyingParticle(clientX - 30, clientY - 20);
    playChime('respect');

    if (customToast) {
      showToast(customToast, '🎓');
    } else if (respectCount % 10 === 0) {
      showToast(`Respect count reached ${respectCount}! Professor's patience remains infinite! ☕`, '🏆');
    }
  }

  // Floating Respect Button
  const floatingRespectBtn = document.getElementById('floating-respect-btn');
  if (floatingRespectBtn) {
    floatingRespectBtn.addEventListener('click', (e) => {
      addRespect(e, 1);
      launchConfetti(e.clientX, e.clientY, 35);
    });
  }

  // Floating Quick Action Buttons
  const floatingConfettiBtn = document.getElementById('floating-confetti-btn');
  if (floatingConfettiBtn) {
    floatingConfettiBtn.addEventListener('click', (e) => {
      playChime('celebrate');
      launchConfetti(e.clientX, e.clientY, 70);
      showToast("Celebration launched for Teacher's Day! 🎉", '✨');
    });
  }

  const floatingCoffeeBtn = document.getElementById('floating-coffee-btn');
  if (floatingCoffeeBtn) {
    floatingCoffeeBtn.addEventListener('click', (e) => {
      playChime('coffee');
      spawnFlyingParticle(e.clientX, e.clientY, '☕ Fresh Espresso (+1000 Energy)');
      showToast("Hot espresso delivered to Professor Yangibaev's office! ☕", '☕');
    });
  }

  const floatingSoundBtn = document.getElementById('floating-sound-btn');
  if (floatingSoundBtn) {
    floatingSoundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      floatingSoundBtn.textContent = soundEnabled ? '🔔' : '🔕';
      floatingSoundBtn.title = soundEnabled ? 'Sound Enabled' : 'Sound Muted';
      showToast(soundEnabled ? 'Chime sound effects enabled!' : 'Sound muted.', soundEnabled ? '🔔' : '🔕');
      if (soundEnabled) playTone(880, 'sine', 0.15, 0.08);
    });
  }

  // Hero Photo Badges Click Actions
  document.querySelectorAll('.photo-badge').forEach((badge) => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      const soundKind = badge.dataset.badgeSound || 'celebrate';
      playChime(soundKind);
      launchConfetti(e.clientX, e.clientY, 40);
      const text = badge.querySelector('.badge-text')?.textContent || 'Respect';
      spawnFlyingParticle(e.clientX - 20, e.clientY - 20, `+100 Respect (${text})! 🌟`);
      addRespect(e, 5);
      showToast(`Professor Yangibaev: ${text} recognized! 🎓`, '🌟');
    });
  });

  // 3D TILT EFFECT ON CARDS
  const tiltElements = document.querySelectorAll('.hero-photo-frame, .lesson-card, .publication-card, .timeline-card');
  tiltElements.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 10. SECRET KEYBOARD EASTER EGG (Press 'P' for Professor or 'T' for Teacher's Day)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 't' || e.key === 'T') {
      playChime('celebrate');
      launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 90);
      showToast("Easter Egg Unlocked: Best Professor Award! 🏆", '🎓');
    }
  });

  // ============================================================
  // 11. COMEDY SCENE: "A VERY IMPORTANT PROGRAMMING SKILL"
  // ============================================================
  const comedyScene = document.getElementById('comedy-scene');
  const dialogueStream = document.getElementById('dialogue-stream');
  const typoWord = document.getElementById('typo-word');
  const typoHighlightRow = document.getElementById('typo-highlight-row');
  const comedyConsole = document.getElementById('comedy-console');
  const comedicReveal = document.getElementById('comedic-reveal');
  const terminalStepBadge = document.getElementById('terminal-step-badge');
  const comedyProgressBar = document.getElementById('comedy-progress-bar');
  const btnReplayDebug = document.getElementById('btn-replay-debug');
  const btnAskProf = document.getElementById('btn-ask-prof');
  const profChatDrawer = document.getElementById('prof-chat-drawer');
  const chatMessages = document.getElementById('chat-messages');
  const secretPromptBtn = document.getElementById('secret-prompt-btn');
  const easterEggBox = document.getElementById('easter-egg-box');
  const easterResponse = document.getElementById('easter-response');

  let comedyTimers = [];
  let comedyHasAutoPlayed = false;
  let easterClickCount = 0;

  function clearComedyTimers() {
    comedyTimers.forEach(id => clearTimeout(id));
    comedyTimers = [];
  }

  function appendDialogueMsg(speaker, text, isProf = false) {
    if (!dialogueStream) return;
    const msg = document.createElement('div');
    msg.className = `dialogue-msg ${isProf ? 'msg-prof' : 'msg-student'}`;
    msg.innerHTML = `
      <span class="speaker-label ${isProf ? 'label-prof' : 'label-student'}">${speaker}:</span>
      <span class="speaker-text">${text}</span>
    `;
    dialogueStream.appendChild(msg);
  }

  function startComedyAnimation() {
    if (!comedyScene) return;
    clearComedyTimers();

    // Reset visual state
    if (dialogueStream) dialogueStream.innerHTML = '';
    if (typoWord) typoWord.classList.remove('typo-active');
    if (typoHighlightRow) typoHighlightRow.style.display = 'none';
    if (comedyConsole) comedyConsole.style.display = 'none';
    if (comedicReveal) comedicReveal.style.display = 'none';
    if (profChatDrawer) profChatDrawer.style.display = 'none';
    if (easterEggBox) easterEggBox.style.display = 'none';

    if (terminalStepBadge) {
      terminalStepBadge.textContent = 'Student Mode: Panicking';
      terminalStepBadge.classList.remove('status-solved');
    }

    if (comedyProgressBar) {
      comedyProgressBar.style.transition = 'none';
      comedyProgressBar.style.width = '0%';
      setTimeout(() => {
        comedyProgressBar.style.transition = 'width 11s linear';
        comedyProgressBar.style.width = '100%';
      }, 50);
    }

    // Step 1: Student reaches out (t = 600ms)
    comedyTimers.push(setTimeout(() => {
      appendDialogueMsg('Student', 'Professor, something is wrong with my code 😭', false);
      playTone(400, 'sine', 0.12, 0.05);
    }, 600));

    // Step 2: Professor responds calmly (t = 2200ms)
    comedyTimers.push(setTimeout(() => {
      appendDialogueMsg('Professor', 'What seems to be the problem?', true);
      playTone(550, 'triangle', 0.15, 0.06);
    }, 2200));

    // Step 3: Classic student response (t = 3800ms)
    comedyTimers.push(setTimeout(() => {
      appendDialogueMsg('Student', "I don't know. It just doesn't work.", false);
      playTone(420, 'sine', 0.12, 0.05);
    }, 3800));

    // Step 4: Python execution & realistic NameError (t = 5200ms)
    comedyTimers.push(setTimeout(() => {
      if (comedyConsole) {
        comedyConsole.style.display = 'block';
        comedyConsole.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (terminalStepBadge) {
        terminalStepBadge.textContent = 'Status: NameError 💥';
      }
      playTone(280, 'sawtooth', 0.25, 0.07);
    }, 5200));

    // Step 5: Highlight typo 'pritn' with glowing wavy underline & pointer (t = 7000ms)
    comedyTimers.push(setTimeout(() => {
      if (typoWord) typoWord.classList.add('typo-active');
      if (typoHighlightRow) typoHighlightRow.style.display = 'flex';
      playTone(600, 'sine', 0.1, 0.05);
    }, 7000));

    // Step 6: Professor points out the obvious (t = 8200ms)
    comedyTimers.push(setTimeout(() => {
      appendDialogueMsg('Professor', '...print', true);
      playTone(659.25, 'triangle', 0.18, 0.07);
    }, 8200));

    // Step 7: Student realizes (t = 9400ms)
    comedyTimers.push(setTimeout(() => {
      appendDialogueMsg('Student', 'Oh.', false);
      playTone(520, 'sine', 0.12, 0.05);
    }, 9400));

    // Step 8: Student full realization (t = 10300ms)
    comedyTimers.push(setTimeout(() => {
      appendDialogueMsg('Student', 'Ohhhhh.', false);
      playTone(480, 'sine', 0.15, 0.05);
    }, 10300));

    // Step 9: Comedic Reveal Punchline (t = 11200ms)
    comedyTimers.push(setTimeout(() => {
      if (comedicReveal) {
        comedicReveal.style.display = 'block';
      }
      if (terminalStepBadge) {
        terminalStepBadge.textContent = 'Status: Problem Solved ✅';
        terminalStepBadge.classList.add('status-solved');
      }
      playChime('respect');
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 45);
    }, 11200));
  }

  // IntersectionObserver for auto-play on scroll
  if (comedyScene) {
    const comedyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !comedyHasAutoPlayed) {
          comedyHasAutoPlayed = true;
          startComedyAnimation();
        }
      });
    }, { threshold: 0.25 });

    comedyObserver.observe(comedyScene);
  }

  // "Debug it again" replay button
  if (btnReplayDebug) {
    btnReplayDebug.addEventListener('click', () => {
      playTone(700, 'sine', 0.1, 0.06);
      startComedyAnimation();
    });
  }

  // "Ask the Professor" interactive drawer
  if (btnAskProf && profChatDrawer && chatMessages) {
    btnAskProf.addEventListener('click', () => {
      profChatDrawer.style.display = 'block';
      chatMessages.innerHTML = '';
      playChime('tree');

      const chatSteps = [
        { html: '<div class="chat-system-note">🔔 <em>Professor has entered the chat.</em></div>', delay: 200 },
        { html: '<div class="dialogue-msg msg-prof"><span class="speaker-label label-prof">Professor:</span> <span class="speaker-text">"Have you checked the spelling?"</span></div>', delay: 1000 },
        { html: '<div class="dialogue-msg msg-student"><span class="speaker-label label-student">Student:</span> <span class="speaker-text">"..."</span></div>', delay: 2100 },
        { html: '<div class="dialogue-msg msg-prof"><span class="speaker-label label-prof">Professor:</span> <span class="speaker-text">"🙂"</span></div>', delay: 3000 },
        { html: '<div class="chat-system-punchline">✨ <strong>Every programmer has been here.</strong></div>', delay: 3800 }
      ];

      chatSteps.forEach(step => {
        setTimeout(() => {
          chatMessages.insertAdjacentHTML('beforeend', step.html);
          playTone(600, 'sine', 0.08, 0.04);
        }, step.delay);
      });
    });
  }

  // Hidden Easter Egg: Click the prompt icon 3 times
  if (secretPromptBtn && easterEggBox && easterResponse) {
    secretPromptBtn.addEventListener('click', () => {
      easterClickCount++;
      playTone(500 + easterClickCount * 120, 'triangle', 0.1, 0.06);

      if (easterClickCount >= 3) {
        easterEggBox.style.display = 'block';
        easterResponse.innerHTML = `
          <div><em>Professor has been summoned...</em></div>
          <div style="color: #4ade80; margin-top: 6px;">✅ Problem solved.</div>
          <div style="color: #f87171;">❌ Student still doesn't know what was wrong.</div>
        `;
        playChime('celebrate');
        launchConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 60);
        showToast("Secret shortcut unlocked: Professor summoned! 🪄", '⚡');
        easterClickCount = 0;
      } else {
        showToast(`Secret shortcut: ${3 - easterClickCount} more clicks...`, '⚡');
      }
    });
  }

});

