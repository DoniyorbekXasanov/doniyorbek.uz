/**
 * Falsafa Quiz Game Engine
 * doniyorbek.uz/falsafa
 *
 * Jamoa: Turg'unboyeva Sevinch, Rahimberdiyeva Muslima, Maxsudjonova Maftuna
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'falsafa_quiz_stats_v1';
  var data = window.FalsafaData;

  if (!data) {
    console.error('FalsafaData module not found!');
    return;
  }

  // --- Sound Effects via Web Audio API ---
  var audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, delay, gainLevel) {
    if (!state.soundEnabled) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + (delay || 0));

      gain.gain.setValueAtTime(gainLevel || 0.12, ctx.currentTime + (delay || 0));
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (delay || 0) + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + (delay || 0));
      osc.stop(ctx.currentTime + (delay || 0) + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  var Sound = {
    correct: function () {
      playTone(523.25, 'triangle', 0.15, 0, 0.12);     // C5
      playTone(659.25, 'triangle', 0.15, 0.08, 0.12);  // E5
      playTone(783.99, 'triangle', 0.25, 0.16, 0.14);  // G5
    },
    incorrect: function () {
      playTone(220.00, 'sawtooth', 0.18, 0, 0.08);     // A3
      playTone(185.00, 'sawtooth', 0.26, 0.12, 0.09);  // F#3
    },
    streak: function () {
      playTone(587.33, 'sine', 0.12, 0, 0.1);     // D5
      playTone(739.99, 'sine', 0.12, 0.06, 0.1);  // F#5
      playTone(880.00, 'sine', 0.12, 0.12, 0.1);  // A5
      playTone(1174.66, 'sine', 0.25, 0.18, 0.12); // D6
    },
    fanfare: function () {
      playTone(440.00, 'triangle', 0.15, 0, 0.12);
      playTone(554.37, 'triangle', 0.15, 0.1, 0.12);
      playTone(659.25, 'triangle', 0.2, 0.2, 0.14);
      playTone(880.00, 'triangle', 0.4, 0.32, 0.16);
    }
  };

  // --- State & Storage ---
  var defaultStats = {
    totalXP: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    completedGames: 0,
    bestStreak: 0,
    bestAccuracy: 0,
    unlockedAchievements: [],
    topicsPlayed: {},
    dailyQuiz: { date: '', attempted: false, correct: false },
    soundEnabled: true
  };

  var state = loadStats();

  function loadStats() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        return Object.assign({}, defaultStats, parsed);
      }
    } catch (e) {
      console.warn('Storage unavailable, using memory state:', e);
    }
    return Object.assign({}, defaultStats);
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // --- Current Active Game Session ---
  var currentSession = null;

  function getRank(xp) {
    var ranks = data.RANKS;
    var currentRank = ranks[0];
    for (var i = 0; i < ranks.length; i++) {
      if (xp >= ranks[i].minXP) {
        currentRank = ranks[i];
      }
    }
    return currentRank;
  }

  // --- DOM Elements Cache ---
  var el = {};
  function cacheElements() {
    el.landingView = document.getElementById('phi-landing-view');
    el.gameView = document.getElementById('phi-game-view');
    el.resultsView = document.getElementById('phi-results-view');

    // Controls bar stats
    el.statTotalXP = document.getElementById('phi-stat-total-xp');
    el.statRankTitle = document.getElementById('phi-stat-rank-title');
    el.statRankIcon = document.getElementById('phi-stat-rank-icon');
    el.statCompletedGames = document.getElementById('phi-stat-completed-games');

    // Buttons
    el.btnSoundToggle = document.getElementById('phi-sound-toggle');
    el.btnAchievementsModal = document.getElementById('phi-btn-achievements');
    el.btnResetStats = document.getElementById('phi-btn-reset-stats');
    el.btnStartQuick = document.getElementById('phi-btn-start-quick');
    el.btnBrowseTopics = document.getElementById('phi-btn-browse-topics');
    el.btnNextQuestion = document.getElementById('phi-btn-next');
    el.btnQuitGame = document.getElementById('phi-btn-quit');
    el.btnPlayAgain = document.getElementById('phi-btn-play-again');
    el.btnBackToLanding = document.getElementById('phi-btn-back-landing');

    // Setup modal
    el.setupModal = document.getElementById('phi-setup-modal');
    el.setupModalClose = document.getElementById('phi-setup-close');
    el.btnConfirmStart = document.getElementById('phi-btn-confirm-start');
    el.setupTopicSelect = document.getElementById('phi-setup-topic');

    // Game screen elements
    el.gameTopicBadge = document.getElementById('phi-game-topic-badge');
    el.gameDiffBadge = document.getElementById('phi-game-diff-badge');
    el.gameQuestionCounter = document.getElementById('phi-game-question-counter');
    el.gameProgressBar = document.getElementById('phi-game-progress-bar');
    el.gameScore = document.getElementById('phi-game-score');
    el.gameStreak = document.getElementById('phi-game-streak');
    el.gameLivesWrap = document.getElementById('phi-game-lives-wrap');
    el.gameLives = document.getElementById('phi-game-lives');
    el.questionNumber = document.getElementById('phi-question-number');
    el.questionText = document.getElementById('phi-question-text');
    el.optionsContainer = document.getElementById('phi-options-container');
    el.feedbackCard = document.getElementById('phi-feedback-card');
    el.feedbackBadge = document.getElementById('phi-feedback-badge');
    el.feedbackText = document.getElementById('phi-feedback-text');
    el.feedbackSource = document.getElementById('phi-feedback-source');

    // Results screen elements
    el.resultsBadge = document.getElementById('phi-results-badge');
    el.resultsTitle = document.getElementById('phi-results-title');
    el.resultsQuote = document.getElementById('phi-results-quote');
    el.resultsScore = document.getElementById('phi-results-score');
    el.resultsAccuracy = document.getElementById('phi-results-accuracy');
    el.resultsCorrectCount = document.getElementById('phi-results-correct-count');
    el.resultsBestStreak = document.getElementById('phi-results-best-streak');
    el.resultsXPEarned = document.getElementById('phi-results-xp-earned');

    // Modals & Toast
    el.achievementsModal = document.getElementById('phi-achievements-modal');
    el.achievementsModalClose = document.getElementById('phi-achievements-close');
    el.achievementsList = document.getElementById('phi-achievements-list');
    el.toast = document.getElementById('phi-toast');
    el.toastIcon = document.getElementById('phi-toast-icon');
    el.toastTitle = document.getElementById('phi-toast-title');
    el.toastDesc = document.getElementById('phi-toast-desc');
  }

  // --- Render Top Stats ---
  function updateTopStatsUI() {
    if (el.statTotalXP) el.statTotalXP.textContent = state.totalXP;
    var rank = getRank(state.totalXP);
    if (el.statRankTitle) el.statRankTitle.textContent = rank.title;
    if (el.statRankIcon) el.statRankIcon.textContent = rank.icon;
    if (el.statCompletedGames) el.statCompletedGames.textContent = state.completedGames;
    if (el.btnSoundToggle) {
      el.btnSoundToggle.textContent = state.soundEnabled ? '🔊' : '🔇';
      el.btnSoundToggle.setAttribute('title', state.soundEnabled ? 'Ovozni o‘chirish' : 'Ovozni yoqish');
    }
  }

  // --- Toast Notification ---
  var toastTimer = null;
  function showToast(icon, title, desc) {
    if (!el.toast) return;
    clearTimeout(toastTimer);
    el.toastIcon.textContent = icon;
    el.toastTitle.textContent = title;
    el.toastDesc.textContent = desc;
    el.toast.classList.add('is-active');
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('is-active');
    }, 4500);
  }

  // --- Achievement Checker ---
  function checkAchievements(gameSummary) {
    var unlockedNow = [];
    data.ACHIEVEMENTS.forEach(function (ach) {
      if (state.unlockedAchievements.indexOf(ach.id) === -1) {
        if (ach.condition(state, gameSummary)) {
          state.unlockedAchievements.push(ach.id);
          unlockedNow.push(ach);
        }
      }
    });

    if (unlockedNow.length > 0) {
      saveStats();
      unlockedNow.forEach(function (ach, idx) {
        setTimeout(function () {
          Sound.fanfare();
          showToast(ach.icon, 'Yutuq ochildi: ' + ach.title, ach.desc);
        }, idx * 1200);
      });
    }
  }

  // --- Shuffle helper (Fisher-Yates) ---
  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  // --- Build Question Set for Mode ---
  function buildQuestions(mode, topicId, difficulty) {
    var pool = data.QUESTIONS.slice();

    // Filter by topic if specified
    if (topicId && topicId !== 'all') {
      pool = pool.filter(function (q) {
        return q.topic === topicId;
      });
    }

    // Filter by difficulty if specified
    if (difficulty && difficulty !== 'all') {
      pool = pool.filter(function (q) {
        return q.difficulty === difficulty;
      });
    }

    if (pool.length === 0) {
      pool = data.QUESTIONS.slice();
    }

    pool = shuffle(pool);

    var count = 10;
    if (mode === 'tezkor') {
      count = 10;
    } else if (mode === 'sinov') {
      count = 15;
    } else if (mode === 'mavzular') {
      count = Math.min(pool.length, 8);
    } else if (mode === 'kun-savoli') {
      count = 1;
    }

    return pool.slice(0, count);
  }

  // --- Daily Question Selection ---
  function getTodayString() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getDailyQuestion() {
    var todayStr = getTodayString();
    var hash = 0;
    for (var i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    var index = Math.abs(hash) % data.QUESTIONS.length;
    return data.QUESTIONS[index];
  }

  // --- Start Game Session ---
  function startGame(config) {
    var mode = config.mode || 'tezkor';
    var topicId = config.topicId || 'all';
    var difficulty = config.difficulty || 'all';

    var questions = [];
    if (mode === 'kun-savoli') {
      var today = getTodayString();
      if (state.dailyQuiz && state.dailyQuiz.date === today && state.dailyQuiz.attempted) {
        alert('Bugungi «Kun savoli»ni allaqachon bajargansiz! Ertaga yangi savol kutmoqda.');
        return;
      }
      questions = [getDailyQuestion()];
    } else {
      questions = buildQuestions(mode, topicId, difficulty);
    }

    if (questions.length === 0) {
      alert('Savollar topilmadi. Boshqa mavzu yoki darajani tanlab ko‘ring.');
      return;
    }

    currentSession = {
      mode: mode,
      topicId: topicId,
      difficulty: difficulty,
      questions: questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lives: mode === 'sinov' ? 3 : null,
      xpGained: 0,
      topicStats: {},
      isAnswerLocked: false
    };

    // UI View transition
    el.landingView.style.display = 'none';
    el.resultsView.classList.remove('is-active');
    el.gameView.classList.add('is-active');

    // Setup lives display
    if (mode === 'sinov') {
      el.gameLivesWrap.style.display = 'inline-flex';
      renderLives(3);
    } else {
      el.gameLivesWrap.style.display = 'none';
    }

    renderCurrentQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderLives(lives) {
    var hearts = '';
    for (var i = 0; i < 3; i++) {
      hearts += i < lives ? '❤️' : '🖤';
    }
    el.gameLives.textContent = hearts;
  }

  // --- Render Question ---
  function renderCurrentQuestion() {
    var s = currentSession;
    var q = s.questions[s.currentIndex];
    s.isAnswerLocked = false;

    // Badges & Counters
    el.gameTopicBadge.textContent = q.topicName || 'Falsafa';
    el.gameDiffBadge.textContent = q.difficulty === 'oson' ? 'Oson' : (q.difficulty === 'o\'rta' ? 'O‘rta' : 'Qiyin');
    el.gameQuestionCounter.textContent = 'Savol: ' + (s.currentIndex + 1) + ' / ' + s.questions.length;

    var progressPercent = Math.round(((s.currentIndex) / s.questions.length) * 100);
    el.gameProgressBar.style.width = progressPercent + '%';

    el.gameScore.textContent = s.score;
    el.gameStreak.textContent = s.streak;

    // Question content
    el.questionNumber.textContent = 'Mavzu: ' + (q.topicName || 'Falsafa') + ' • ' + (s.currentIndex + 1) + '-savol';
    el.questionText.textContent = q.question;

    // Hide feedback & disable Next button
    el.feedbackCard.classList.remove('is-visible', 'is-correct', 'is-incorrect');
    el.btnNextQuestion.disabled = true;
    el.btnNextQuestion.textContent = (s.currentIndex === s.questions.length - 1) ? 'Natijalarni ko‘rish ➔' : 'Keyingi savol ➔';

    // Prepare shuffled options with tracking of original correct answer
    var optionsWithMeta = q.options.map(function (optText, origIdx) {
      return {
        text: optText,
        isCorrect: origIdx === q.correctAnswer
      };
    });
    optionsWithMeta = shuffle(optionsWithMeta);

    // Render Options
    el.optionsContainer.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];

    optionsWithMeta.forEach(function (opt, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phi-option-btn';
      btn.setAttribute('data-idx', idx);
      btn.setAttribute('data-correct', opt.isCorrect ? 'true' : 'false');
      btn.setAttribute('aria-label', letters[idx] + ' varianti: ' + opt.text);

      btn.innerHTML = '<span class="phi-option-letter">' + letters[idx] + '</span>' +
                      '<span class="phi-option-text">' + escapeHtml(opt.text) + '</span>';

      btn.addEventListener('click', function () {
        handleAnswerSelected(btn, opt.isCorrect, q);
      });

      el.optionsContainer.appendChild(btn);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // --- Handle Answer Selection ---
  function handleAnswerSelected(selectedBtn, isCorrect, question) {
    var s = currentSession;
    if (s.isAnswerLocked) return;
    s.isAnswerLocked = true;

    // Lock all options and style them
    var allOptionBtns = el.optionsContainer.querySelectorAll('.phi-option-btn');
    allOptionBtns.forEach(function (btn) {
      btn.disabled = true;
      var btnIsCorrect = btn.getAttribute('data-correct') === 'true';
      if (btnIsCorrect) {
        btn.classList.add('is-correct');
      } else if (btn === selectedBtn && !isCorrect) {
        btn.classList.add('is-incorrect');
      } else {
        btn.classList.add('is-dimmed');
      }
    });

    // Topic stats tracking
    if (!s.topicStats[question.topic]) {
      s.topicStats[question.topic] = { total: 0, correct: 0 };
    }
    s.topicStats[question.topic].total++;

    state.totalAnswered++;

    if (isCorrect) {
      s.correctCount++;
      s.topicStats[question.topic].correct++;
      s.streak++;
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
      if (s.streak > state.bestStreak) state.bestStreak = s.streak;

      state.totalCorrect++;

      // XP calculation: 10 base + streak bonus
      var gainedXP = 10;
      if (s.streak >= 5) {
        gainedXP += 5;
      } else if (s.streak >= 3) {
        gainedXP += 2;
      }

      s.score += 100;
      s.xpGained += gainedXP;
      state.totalXP += gainedXP;

      // Audio & Feedback
      if (s.streak >= 3) {
        Sound.streak();
      } else {
        Sound.correct();
      }

      el.feedbackBadge.className = 'phi-feedback-badge is-correct';
      el.feedbackBadge.innerHTML = '✨ To‘g‘ri javob! (+' + gainedXP + ' XP)';
      el.feedbackCard.classList.add('is-visible', 'is-correct');
    } else {
      s.incorrectCount++;
      s.streak = 0;

      Sound.incorrect();

      if (s.mode === 'sinov') {
        s.lives--;
        renderLives(s.lives);
      }

      el.feedbackBadge.className = 'phi-feedback-badge is-incorrect';
      el.feedbackBadge.innerHTML = '❌ Noto‘g‘ri javob!';
      el.feedbackCard.classList.add('is-visible', 'is-incorrect');
    }

    // Explanation text
    el.feedbackText.textContent = question.explanation;
    el.feedbackSource.textContent = question.source ? 'Manba: ' + question.source : '';

    // Update session score on screen
    el.gameScore.textContent = s.score;
    el.gameStreak.textContent = s.streak;

    // Enable next button
    el.btnNextQuestion.disabled = false;
    el.btnNextQuestion.focus();

    // Check achievements mid-game (e.g. 5-streak)
    checkAchievements(null);
    updateTopStatsUI();
    saveStats();
  }

  // --- Next Question / End Game ---
  function advanceGame() {
    var s = currentSession;
    if (!s) return;

    // Check if lives ran out in 'sinov' mode
    if (s.mode === 'sinov' && s.lives <= 0) {
      finishGame(false);
      return;
    }

    s.currentIndex++;
    if (s.currentIndex >= s.questions.length) {
      finishGame(true);
    } else {
      renderCurrentQuestion();
      window.scrollTo({ top: el.gameView.offsetTop - 30, behavior: 'smooth' });
    }
  }

  // --- Finish Game & Show Results ---
  function finishGame(completedNormally) {
    var s = currentSession;
    if (!s) return;

    state.completedGames++;

    // Track topics played
    if (!state.topicsPlayed) state.topicsPlayed = {};
    if (s.topicId && s.topicId !== 'all') {
      state.topicsPlayed[s.topicId] = (state.topicsPlayed[s.topicId] || 0) + 1;
    }

    // Completion bonus XP
    if (completedNormally) {
      var completionBonus = 25;
      s.xpGained += completionBonus;
      state.totalXP += completionBonus;
    }

    var totalQ = s.questions.length;
    var accuracy = totalQ > 0 ? Math.round((s.correctCount / totalQ) * 100) : 0;
    if (accuracy > state.bestAccuracy) state.bestAccuracy = accuracy;

    // Daily quiz recording
    if (s.mode === 'kun-savoli') {
      state.dailyQuiz = {
        date: getTodayString(),
        attempted: true,
        correct: s.correctCount > 0
      };
    }

    // Results UI
    el.gameView.classList.remove('is-active');
    el.resultsView.classList.add('is-active');

    el.resultsScore.textContent = s.score;
    el.resultsAccuracy.textContent = accuracy + '%';
    el.resultsCorrectCount.textContent = s.correctCount + ' / ' + totalQ;
    el.resultsBestStreak.textContent = s.bestStreak;
    el.resultsXPEarned.textContent = '+' + s.xpGained;

    // Philosophical Quote & Badge
    if (accuracy === 100) {
      el.resultsBadge.textContent = '👑';
      el.resultsTitle.textContent = 'Mukammal tafakkur!';
      el.resultsQuote.textContent = '«Haqiqiy bilim narsalarning asl mohiyatini anglashdan boshlanadi.» — Aflotun';
      Sound.fanfare();
    } else if (accuracy >= 80) {
      el.resultsBadge.textContent = '🦉';
      el.resultsTitle.textContent = 'Ajoyib natija!';
      el.resultsQuote.textContent = '«O‘zini o‘zi bilgan va aqliga tayangan inson chinakam ozoddir.» — Arastu';
      Sound.fanfare();
    } else if (accuracy >= 50) {
      el.resultsBadge.textContent = '🕯️';
      el.resultsTitle.textContent = 'Yaxshi boshlanish!';
      el.resultsQuote.textContent = '«Men shuni bilamanki, men hech narsani bilmayman.» — Suqrot. Izlanishda davom eting!';
      Sound.streak();
    } else {
      el.resultsBadge.textContent = '🌱';
      el.resultsTitle.textContent = 'Hikmat sari qadam';
      el.resultsQuote.textContent = '«Xatolar — aqlning o‘zini charxlash vositasidir.» — Qayta urinib ko‘ring!';
    }

    saveStats();
    updateTopStatsUI();

    // Check final achievements
    checkAchievements({
      difficulty: s.difficulty,
      accuracy: accuracy,
      totalQuestions: totalQ,
      isDaily: s.mode === 'kun-savoli',
      isCorrect: s.correctCount > 0
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Reset Stats Confirmation ---
  function resetAllStats() {
    var confirmed = confirm('Haqiqatan ham to‘plangan barcha XP, natijalar va yutuqlarni nollashtirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.');
    if (confirmed) {
      state = Object.assign({}, defaultStats);
      saveStats();
      updateTopStatsUI();
      alert('Barcha yutuq va statistikalar muvaffaqiyatli nollashtirildi.');
    }
  }

  // --- Render Achievements Modal Content ---
  function renderAchievementsModal() {
    el.achievementsList.innerHTML = '';
    data.ACHIEVEMENTS.forEach(function (ach) {
      var isUnlocked = state.unlockedAchievements.indexOf(ach.id) !== -1;
      var item = document.createElement('div');
      item.className = 'phi-achievement-item ' + (isUnlocked ? 'is-unlocked' : 'is-locked');

      item.innerHTML = '<div class="phi-achievement-icon">' + ach.icon + '</div>' +
                       '<div class="phi-achievement-info">' +
                         '<div class="phi-achievement-title">' + ach.title + ' ' + (isUnlocked ? '✓' : '🔒') + '</div>' +
                         '<div class="phi-achievement-desc">' + ach.desc + '</div>' +
                       '</div>';
      el.achievementsList.appendChild(item);
    });
  }

  // --- Keyboard Shortcuts ---
  function handleKeyboard(e) {
    // If a modal is open, Esc closes it
    if (e.key === 'Escape') {
      if (el.setupModal && el.setupModal.classList.contains('is-open')) {
        el.setupModal.classList.remove('is-open');
        return;
      }
      if (el.achievementsModal && el.achievementsModal.classList.contains('is-open')) {
        el.achievementsModal.classList.remove('is-open');
        return;
      }
    }

    // Only active during quiz game view
    if (!el.gameView || !el.gameView.classList.contains('is-active')) return;

    var s = currentSession;
    if (!s) return;

    var optionBtns = el.optionsContainer.querySelectorAll('.phi-option-btn');

    if (!s.isAnswerLocked) {
      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        if (optionBtns[0]) optionBtns[0].click();
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        if (optionBtns[1]) optionBtns[1].click();
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        if (optionBtns[2]) optionBtns[2].click();
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        if (optionBtns[3]) optionBtns[3].click();
      }
    } else {
      // Once answered, Enter or Space advances
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!el.btnNextQuestion.disabled) {
          el.btnNextQuestion.click();
        }
      }
    }
  }

  // --- Populate Topic Options in Modal & Grid ---
  function populateTopics() {
    var topics = data.TOPICS;

    // In modal select
    if (el.setupTopicSelect) {
      el.setupTopicSelect.innerHTML = '<option value="all">Barcha mavzular (Aralash)</option>';
      topics.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        el.setupTopicSelect.appendChild(opt);
      });
    }

    // In Landing Page Topics Grid
    var grid = document.getElementById('phi-topics-grid');
    if (grid) {
      grid.innerHTML = '';
      topics.forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'phi-topic-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', t.name + ' mavzusida o‘ynash');

        var qCount = data.QUESTIONS.filter(function (q) { return q.topic === t.id; }).length;

        card.innerHTML = '<div class="phi-topic-badge">' + t.badge + '</div>' +
                         '<div class="phi-topic-info">' +
                           '<div class="phi-topic-name">' + t.name + '</div>' +
                           '<div class="phi-topic-desc">' + t.description + '</div>' +
                           '<div class="phi-topic-count">' + qCount + ' ta savol mavjud ➔</div>' +
                         '</div>';

        card.addEventListener('click', function () {
          startGame({ mode: 'mavzular', topicId: t.id, difficulty: 'all' });
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });

        grid.appendChild(card);
      });
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Sound Toggle
    if (el.btnSoundToggle) {
      el.btnSoundToggle.addEventListener('click', function () {
        state.soundEnabled = !state.soundEnabled;
        saveStats();
        updateTopStatsUI();
        if (state.soundEnabled) Sound.correct();
      });
    }

    // Reset stats
    if (el.btnResetStats) {
      el.btnResetStats.addEventListener('click', resetAllStats);
    }

    // Achievements Modal
    if (el.btnAchievementsModal) {
      el.btnAchievementsModal.addEventListener('click', function () {
        renderAchievementsModal();
        el.achievementsModal.classList.add('is-open');
      });
    }
    if (el.achievementsModalClose) {
      el.achievementsModalClose.addEventListener('click', function () {
        el.achievementsModal.classList.remove('is-open');
      });
    }

    // Setup Modal Open & Close
    if (el.btnBrowseTopics) {
      el.btnBrowseTopics.addEventListener('click', function () {
        el.setupModal.classList.add('is-open');
      });
    }
    if (el.setupModalClose) {
      el.setupModalClose.addEventListener('click', function () {
        el.setupModal.classList.remove('is-open');
      });
    }

    // Quick Start
    if (el.btnStartQuick) {
      el.btnStartQuick.addEventListener('click', function () {
        startGame({ mode: 'tezkor', topicId: 'all', difficulty: 'all' });
      });
    }

    // Confirm Start from Modal
    if (el.btnConfirmStart) {
      el.btnConfirmStart.addEventListener('click', function () {
        var topicId = el.setupTopicSelect ? el.setupTopicSelect.value : 'all';
        var diffInput = document.querySelector('input[name="phi-diff"]:checked');
        var difficulty = diffInput ? diffInput.value : 'all';

        el.setupModal.classList.remove('is-open');
        startGame({ mode: 'mavzular', topicId: topicId, difficulty: difficulty });
      });
    }

    // Mode Cards Click
    var modeCards = document.querySelectorAll('.phi-mode-card');
    modeCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var mode = card.getAttribute('data-mode');
        if (mode === 'kun-savoli') {
          startGame({ mode: 'kun-savoli' });
        } else if (mode === 'sinov') {
          startGame({ mode: 'sinov' });
        } else if (mode === 'tezkor') {
          startGame({ mode: 'tezkor' });
        } else if (mode === 'mavzular') {
          el.setupModal.classList.add('is-open');
        }
      });
    });

    // Next Question Button
    if (el.btnNextQuestion) {
      el.btnNextQuestion.addEventListener('click', advanceGame);
    }

    // Quit Game Button
    if (el.btnQuitGame) {
      el.btnQuitGame.addEventListener('click', function () {
        var confirmed = confirm('Haqiqatan ham joriy o‘yinni to‘xtatmoqchimisiz? Natijalar saqlanmaydi.');
        if (confirmed) {
          currentSession = null;
          el.gameView.classList.remove('is-active');
          el.resultsView.classList.remove('is-active');
          el.landingView.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Play Again Button
    if (el.btnPlayAgain) {
      el.btnPlayAgain.addEventListener('click', function () {
        if (currentSession) {
          startGame({
            mode: currentSession.mode,
            topicId: currentSession.topicId,
            difficulty: currentSession.difficulty
          });
        } else {
          startGame({ mode: 'tezkor' });
        }
      });
    }

    // Back to Landing Button
    if (el.btnBackToLanding) {
      el.btnBackToLanding.addEventListener('click', function () {
        currentSession = null;
        el.resultsView.classList.remove('is-active');
        el.landingView.style.display = 'block';
        updateTopStatsUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Close modals on backdrop click
    window.addEventListener('click', function (e) {
      if (e.target === el.setupModal) el.setupModal.classList.remove('is-open');
      if (e.target === el.achievementsModal) el.achievementsModal.classList.remove('is-open');
    });
  }

  // --- Initialization ---
  function init() {
    cacheElements();
    populateTopics();
    setupEventListeners();
    updateTopStatsUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
