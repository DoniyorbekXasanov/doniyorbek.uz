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

  // 6. WISDOM & DEBUGGING HOTLINE
  const wisdomQuotes = [
    "Before you write 100 lines of code, pause for 10 minutes. If that still doesn't work, have a cup of green tea. The best debugging tool is a calm mind.",
    "Time Limit Exceeded? Don't worry, O(N²) was a courageous choice. Now let's transform it into O(N log N).",
    "DotA 2 rule: Map awareness wins matches. Programming rule: Array bounds awareness prevents Segmentation Faults.",
    "When you are stuck on a bug at 2 AM, remember: even Dijkstra had bugs before his first coffee.",
    "A loop without an exit condition isn't an error — it's just really passionate about what it's doing.",
    "The distance between knowing nothing and tackling ICPC is paved with patience, problem by problem.",
    "In machine learning, you minimize loss. In great mentorship, you maximize student confidence.",
    "There are no bad algorithms — only solutions with O(N!) complexity that need our care and guidance.",
    "Remember your first day in class? You didn't even know what a variable was. Look at what you can build today!"
  ];

  let currentWisdomIdx = 0;
  const btnWisdom = document.getElementById('btn-wisdom');
  const wisdomOutput = document.getElementById('wisdom-output');

  if (btnWisdom && wisdomOutput) {
    btnWisdom.addEventListener('click', () => {
      playChime('respect');
      currentWisdomIdx = (currentWisdomIdx + 1) % wisdomQuotes.length;
      const targetQuote = `"${wisdomQuotes[currentWisdomIdx]}"`;

      // Typewriter effect
      wisdomOutput.style.opacity = '0.4';
      setTimeout(() => {
        wisdomOutput.textContent = targetQuote;
        wisdomOutput.style.opacity = '1';
      }, 150);
    });
  }

  // Online Judge Code Submission Simulation
  const btnSubmitCode = document.getElementById('btn-submit-code');
  const wisdomVerdict = document.getElementById('wisdom-verdict');
  const verdictText = document.getElementById('verdict-text');
  const verdictSpinner = document.getElementById('verdict-spinner');

  if (btnSubmitCode && wisdomVerdict && verdictText) {
    btnSubmitCode.addEventListener('click', () => {
      btnSubmitCode.disabled = true;
      wisdomVerdict.style.display = 'flex';
      if (verdictSpinner) verdictSpinner.style.display = 'inline-block';
      playChime('tree');

      const steps = [
        { text: 'Compiling code with g++ -O3 -Wall...', delay: 400 },
        { text: 'Running Test 1/42 [Basic Cases]... OK (0.01s)', delay: 1000 },
        { text: 'Running Test 23/42 [Corner Cases & Graphs]... OK (0.02s)', delay: 1700 },
        { text: 'Running Test 42/42 [Extreme Limits]... OK (0.00s)', delay: 2400 },
      ];

      steps.forEach((step) => {
        setTimeout(() => {
          verdictText.textContent = step.text;
        }, step.delay);
      });

      setTimeout(() => {
        if (verdictSpinner) verdictSpinner.style.display = 'none';
        verdictText.innerHTML = '<strong style="color: #22c55e;">VERDICT: ACCEPTED (0.00ms, 0MB) 🟢</strong> — Rating: World Champion!';
        btnSubmitCode.disabled = false;
        playChime('ac');
        launchConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 80);
        showToast("Accepted! Professor Yangibaev's guidance passed all 42 test cases! 🟢", '🏆');
      }, 3100);
    });
  }

  // 7. YANGIBAEV ML DECISION TREE V2.0 ENGINE
  const btnRunMl = document.getElementById('btn-run-ml');
  const mlOutcomeArea = document.getElementById('ml-outcome-area');
  const treeStep1 = document.getElementById('tree-step-1');
  const treeStep2 = document.getElementById('tree-step-2');
  const treeStep3 = document.getElementById('tree-step-3');
  const mlResultTitle = document.getElementById('ml-result-title');
  const mlResultDesc = document.getElementById('ml-result-desc');

  if (btnRunMl) {
    btnRunMl.addEventListener('click', () => {
      btnRunMl.disabled = true;
      playChime('tree');

      const scenario = document.getElementById('ml-scenario')?.value || 'icpc';
      const model = document.getElementById('ml-model')?.value || 'extratrees';
      const feature = document.getElementById('ml-feature')?.value || 'guidance';

      // Reset steps visual
      [treeStep1, treeStep2, treeStep3].forEach(step => {
        if (step) step.classList.remove('tree-step-active');
      });

      // Animate tree steps
      setTimeout(() => {
        if (treeStep1) treeStep1.classList.add('tree-step-active');
        playTone(523.25, 'triangle', 0.1, 0.05);
      }, 300);

      setTimeout(() => {
        if (treeStep2) treeStep2.classList.add('tree-step-active');
        playTone(659.25, 'triangle', 0.1, 0.06);
      }, 800);

      setTimeout(() => {
        if (treeStep3) treeStep3.classList.add('tree-step-active');
        playTone(783.99, 'triangle', 0.1, 0.07);
      }, 1300);

      setTimeout(() => {
        btnRunMl.disabled = false;
        playChime('ac');
        launchConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 90);

        let title = '100.0% VICTORY / ACCEPTED (AC)!';
        let desc = 'The ensemble model converged with zero entropy loss. Professor Yangibaev’s teachings provided 99.98% feature importance for this victory!';

        if (scenario === 'dota') {
          title = '🏆 DotA 2 Match Prediction: 100% Radiant Win!';
          desc = `Extra Trees ensemble replicating OpenDota analytics predicts absolute triumph! Feature breakdown shows tactical patience learned from Professor Yangibaev overpowered every enemy gank.`;
        } else if (scenario === 'icpc') {
          title = '⚡ ICPC Regional: All 12 Problems Solved!';
          desc = `Hist Gradient Boosting confirms maximum contest performance. Every edge case was anticipated through algorithmic thinking passed down in the classroom.`;
        } else if (scenario === 'exam') {
          title = '🟢 Segmentation Fault Vanquished at 3:15 AM!';
          desc = `Decision tree leaf reached: Print statements + Professor's advice caught the off-by-one error instantly! Zero memory leaks detected.`;
        } else if (scenario === 'life') {
          title = '🌟 Inspiring Career Path: Boundless Success!';
          desc = `Trained on the infinite dataset of a great teacher's encouragement. The foundation built here will guide every future breakthrough.`;
        }

        if (mlResultTitle) mlResultTitle.textContent = title;
        if (mlResultDesc) mlResultDesc.textContent = desc;

        showToast("Model prediction completed with 100% confidence! 🌲", '🎯');
      }, 1800);
    });
  }

  // 8. CELEBRATION HUB BUTTONS
  const btnGrandCelebrate = document.getElementById('btn-grand-celebrate');
  if (btnGrandCelebrate) {
    btnGrandCelebrate.addEventListener('click', (e) => {
      playChime('celebrate');
      launchConfetti(window.innerWidth * 0.3, window.innerHeight * 0.6, 60);
      setTimeout(() => launchConfetti(window.innerWidth * 0.7, window.innerHeight * 0.6, 60), 180);
      addRespect(e, 10);
      showToast("Happy Teacher's Day, Professor Yangibaev! 🎉", '✨');
    });
  }

  const btnSendCoffee = document.getElementById('btn-send-coffee');
  if (btnSendCoffee) {
    btnSendCoffee.addEventListener('click', (e) => {
      playChime('coffee');
      spawnFlyingParticle(e.clientX, e.clientY, '☕ Fresh Espresso Delivered!');
      addRespect(e, 5);
      showToast("Hot espresso offered to Professor Yangibaev! ☕", '☕');
    });
  }

  const btnPayRespect = document.getElementById('btn-pay-respect');
  if (btnPayRespect) {
    btnPayRespect.addEventListener('click', (e) => {
      playChime('respect');
      launchConfetti(e.clientX, e.clientY, 40);
      addRespect(e, 25, '+1000 Aura Respect Added! 🎓');
    });
  }

  // 9. 3D TILT EFFECT ON CARDS
  const tiltElements = document.querySelectorAll('.hero-photo-frame, .lesson-card, .publication-card, .timeline-card, .ml-simulator-card');
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

});

