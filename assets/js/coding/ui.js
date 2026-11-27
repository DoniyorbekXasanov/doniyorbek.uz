/**
 * UI Rendering helpers for the /coding Codeforces dashboard.
 */

import {
  formatDate,
  formatRelativeTime,
  getRankSlug,
} from './analytics.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function createKpi(label, value, sub, valueClass = '') {
  const tile = el('div', 'cf-kpi');
  tile.appendChild(el('div', 'cf-kpi-label', label));
  const valEl = el('div', `cf-kpi-value ${valueClass}`.trim(), value);
  tile.appendChild(valEl);
  if (sub) {
    tile.appendChild(el('div', 'cf-kpi-sub', sub));
  }
  return tile;
}

function formatVerdict(verdict) {
  const map = {
    OK: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    TIME_LIMIT_EXCEEDED: 'Time Limit',
    MEMORY_LIMIT_EXCEEDED: 'Memory Limit',
    RUNTIME_ERROR: 'Runtime Error',
    COMPILATION_ERROR: 'Compile Error',
    CHALLENGED: 'Hacked',
    SKIPPED: 'Skipped',
    TESTING: 'Testing',
  };
  return map[verdict] || verdict || 'Unknown';
}

function getVerdictBadgeClass(verdict) {
  if (verdict === 'OK') return 'cf-verdict cf-verdict--ok';
  if (verdict === 'TIME_LIMIT_EXCEEDED' || verdict === 'MEMORY_LIMIT_EXCEEDED' || verdict === 'TESTING') {
    return 'cf-verdict cf-verdict--warn';
  }
  return 'cf-verdict cf-verdict--err';
}

function getVerdictBarClass(verdict) {
  if (verdict === 'OK') return 'cf-bar-fill cf-bar-fill--ok';
  if (verdict === 'WRONG_ANSWER') return 'cf-bar-fill cf-bar-fill--wa';
  if (verdict === 'TIME_LIMIT_EXCEEDED' || verdict === 'MEMORY_LIMIT_EXCEEDED') {
    return 'cf-bar-fill cf-bar-fill--tle';
  }
  return 'cf-bar-fill cf-bar-fill--other';
}

/**
 * 1. Profile Overview
 */
export function renderProfile(container, user) {
  container.innerHTML = '';

  const rankSlug = getRankSlug(user.rank);
  const maxRankSlug = getRankSlug(user.maxRank);

  const panel = el('div', 'cf-panel');
  const card = el('div', 'cf-profile-card');

  // Avatar
  const avatarWrap = el('div', 'cf-profile-avatar-wrap');
  const avatar = document.createElement('img');
  avatar.className = 'cf-profile-avatar';
  avatar.src = user.titlePhoto || user.avatar || 'https://userpic.codeforces.org/no-title.jpg';
  avatar.alt = `${user.handle} Codeforces avatar`;
  avatar.loading = 'lazy';
  avatarWrap.appendChild(avatar);

  // Main identity & metadata
  const main = el('div', 'cf-profile-main');
  const identity = el('div', 'cf-profile-identity');

  const rankSpan = el('span', `cf-profile-rank-label cf-rank--${rankSlug}`, user.rank || 'unrated');
  const handleLink = el('a', `cf-profile-handle cf-rank--${rankSlug}`, user.handle);
  handleLink.href = `https://codeforces.com/profile/${encodeURIComponent(user.handle)}`;
  handleLink.target = '_blank';
  handleLink.rel = 'noopener noreferrer';

  identity.appendChild(rankSpan);
  identity.appendChild(handleLink);

  const details = el('div', 'cf-profile-details');
  const locationParts = [user.city, user.country].filter(Boolean);
  if (locationParts.length > 0) {
    details.appendChild(el('span', 'cf-profile-detail-item', locationParts.join(', ')));
  }
  if (user.organization) {
    details.appendChild(el('span', 'cf-profile-detail-item', user.organization));
  }
  if (user.registrationTimeSeconds) {
    details.appendChild(
      el('span', 'cf-profile-detail-item', `Joined ${formatDate(user.registrationTimeSeconds)}`)
    );
  }
  if (user.lastOnlineTimeSeconds) {
    details.appendChild(
      el('span', 'cf-profile-detail-item', `Last online ${formatRelativeTime(user.lastOnlineTimeSeconds)}`)
    );
  }

  main.appendChild(identity);
  main.appendChild(details);
  card.appendChild(avatarWrap);
  card.appendChild(main);
  panel.appendChild(card);

  // Direct API Stats strip
  const stats = el('div', 'cf-profile-stats');
  stats.appendChild(
    createKpi(
      'Current Rating',
      typeof user.rating === 'number' ? String(user.rating) : 'Unrated',
      user.rank ? `Rank: ${user.rank}` : 'No rated contests',
      `cf-rank--${rankSlug}`
    )
  );
  stats.appendChild(
    createKpi(
      'Max Rating',
      typeof user.maxRating === 'number' ? String(user.maxRating) : '—',
      user.maxRank ? `Peak: ${user.maxRank}` : undefined,
      `cf-rank--${maxRankSlug}`
    )
  );
  stats.appendChild(
    createKpi(
      'Contribution',
      typeof user.contribution === 'number' ? String(user.contribution) : '0',
      'Codeforces community score'
    )
  );
  stats.appendChild(
    createKpi(
      'Friends',
      typeof user.friendOfCount === 'number' ? String(user.friendOfCount) : '0',
      'Friend of users'
    )
  );

  panel.appendChild(stats);
  container.appendChild(panel);
}

/**
 * 3. Contest Statistics & History
 */
export function renderContests(container, metaEl, contestStats) {
  container.innerHTML = '';
  metaEl.textContent = `${contestStats.totalContests} rated contest${contestStats.totalContests === 1 ? '' : 's'}`;

  if (contestStats.totalContests === 0) {
    container.appendChild(el('div', 'cf-empty', 'No rated contests recorded yet.'));
    return;
  }

  const kpis = el('div', 'cf-kpi-grid');
  kpis.appendChild(createKpi('Rated Contests', String(contestStats.totalContests), 'Official user.rating'));
  kpis.appendChild(
    createKpi(
      'Best Rank',
      contestStats.bestRank !== null ? `#${contestStats.bestRank.toLocaleString()}` : '—',
      contestStats.averageRank !== null ? `Avg #${contestStats.averageRank.toLocaleString()}` : undefined
    )
  );
  kpis.appendChild(
    createKpi(
      'Best Rating Gain',
      contestStats.bestGain !== null
        ? (contestStats.bestGain > 0 ? `+${contestStats.bestGain}` : String(contestStats.bestGain))
        : '—',
      'Single contest delta',
      contestStats.bestGain > 0 ? 'cf-delta-pos' : ''
    )
  );
  kpis.appendChild(
    createKpi(
      'Worst Rank',
      contestStats.worstRank !== null ? `#${contestStats.worstRank.toLocaleString()}` : '—',
      'Lowest contest placement'
    )
  );

  const tableWrap = el('div', 'cf-table-wrap');
  tableWrap.style.marginTop = '12px';

  const table = el('table', 'cf-table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['Contest', 'Date', 'Rank', 'Old → New', 'Change'].forEach((label, idx) => {
    const th = el('th', idx >= 2 ? 'cf-num' : '', label);
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const c of contestStats.reverseChronological) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    const link = el('a', '', c.contestName);
    link.href = `https://codeforces.com/contest/${c.contestId}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    tdName.appendChild(link);

    const tdDate = el('td', '', formatDate(c.ratingUpdateTimeSeconds));
    const tdRank = el('td', 'cf-num', `#${c.rank.toLocaleString()}`);
    const tdRating = el('td', 'cf-num', `${c.oldRating} → ${c.newRating}`);

    const delta = c.newRating - c.oldRating;
    const deltaStr = delta > 0 ? `+${delta}` : String(delta);
    const deltaCls = delta > 0 ? 'cf-num cf-delta-pos' : delta < 0 ? 'cf-num cf-delta-neg' : 'cf-num cf-delta-zero';
    const tdDelta = el('td', deltaCls, deltaStr);

    tr.appendChild(tdName);
    tr.appendChild(tdDate);
    tr.appendChild(tdRank);
    tr.appendChild(tdRating);
    tr.appendChild(tdDelta);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  tableWrap.appendChild(table);

  container.appendChild(kpis);
  container.appendChild(tableWrap);
}

/**
 * 4. Problem-Solving Statistics
 */
export function renderProblemStats(container, metaEl, analytics) {
  container.innerHTML = '';
  metaEl.textContent = `Calculated from ${analytics.totalSubmissions} submissions`;

  const kpis = el('div', 'cf-kpi-grid');
  kpis.appendChild(
    createKpi(
      'Unique Solved',
      String(analytics.uniqueSolved),
      `Out of ${analytics.uniqueAttempted} attempted`
    )
  );
  kpis.appendChild(
    createKpi(
      'Acceptance Rate',
      `${analytics.acceptanceRate}%`,
      `${analytics.acceptedSubmissions} / ${analytics.totalSubmissions} OK`
    )
  );
  kpis.appendChild(
    createKpi(
      'Avg Problem Rating',
      analytics.avgSolvedRating !== null ? String(analytics.avgSolvedRating) : '—',
      analytics.maxSolvedRating !== null ? `Max solved: ${analytics.maxSolvedRating}` : undefined
    )
  );
  kpis.appendChild(
    createKpi(
      'Active Days',
      String(analytics.activeDays),
      'Days with ≥ 1 submission'
    )
  );

  container.appendChild(kpis);

  // Difficulty distribution histogram
  const panel = el('div', 'cf-panel');
  panel.style.marginTop = '12px';
  panel.appendChild(el('h3', 'cf-panel-title', 'Solved Problems by Difficulty Rating'));

  if (analytics.difficultyDistribution.length === 0) {
    panel.appendChild(el('div', 'cf-empty', 'No solved problems with difficulty ratings yet.'));
  } else {
    const maxCount = Math.max(...analytics.difficultyDistribution.map((d) => d.count), 1);
    const hist = el('div', 'cf-histogram');

    for (const bucket of analytics.difficultyDistribution) {
      const col = el('div', 'cf-hist-col');
      col.title = `${bucket.label}: ${bucket.count} solved`;

      col.appendChild(el('span', 'cf-hist-count', String(bucket.count)));

      const bar = el('div', 'cf-hist-bar');
      const pct = Math.max(6, Math.round((bucket.count / maxCount) * 100));
      bar.style.height = `${pct}%`;
      col.appendChild(bar);

      col.appendChild(el('span', 'cf-hist-label', bucket.label));
      hist.appendChild(col);
    }

    panel.appendChild(hist);
  }

  container.appendChild(panel);
}

/**
 * 5. Submission Analytics (Verdicts, Languages, Activity Heatmap)
 */
export function renderSubmissionAnalytics(container, metaEl, analytics) {
  container.innerHTML = '';
  const practiceCount = analytics.participantTypes.PRACTICE || 0;
  const contestCount = analytics.participantTypes.CONTESTANT || 0;
  metaEl.textContent = `${practiceCount} practice · ${contestCount} in-contest`;

  if (analytics.totalSubmissions === 0) {
    container.appendChild(el('div', 'cf-empty', 'No submissions found.'));
    return;
  }

  const grid = el('div', 'cf-grid-2');

  // Verdict distribution
  const verdictPanel = el('div', 'cf-panel');
  verdictPanel.appendChild(el('h3', 'cf-panel-title', 'Verdict Distribution'));
  const verdictList = el('div', 'cf-bar-list');

  for (const item of analytics.verdicts) {
    const row = el('div', 'cf-bar-row');
    row.appendChild(el('span', 'cf-bar-label', formatVerdict(item.verdict)));

    const track = el('div', 'cf-bar-track');
    const fill = el('div', getVerdictBarClass(item.verdict));
    fill.style.width = `${Math.round((item.count / analytics.totalSubmissions) * 100)}%`;
    track.appendChild(fill);
    row.appendChild(track);

    const pct = ((item.count / analytics.totalSubmissions) * 100).toFixed(1);
    row.appendChild(el('span', 'cf-bar-value', `${item.count} (${pct}%)`));
    verdictList.appendChild(row);
  }
  verdictPanel.appendChild(verdictList);

  // Language distribution
  const langPanel = el('div', 'cf-panel');
  langPanel.appendChild(el('h3', 'cf-panel-title', 'Programming Languages'));
  const langList = el('div', 'cf-bar-list');

  for (const item of analytics.languages) {
    const row = el('div', 'cf-bar-row');
    const label = el('span', 'cf-bar-label', item.language);
    label.title = item.language;
    row.appendChild(label);

    const track = el('div', 'cf-bar-track');
    const fill = el('div', 'cf-bar-fill');
    fill.style.width = `${Math.round((item.count / analytics.totalSubmissions) * 100)}%`;
    track.appendChild(fill);
    row.appendChild(track);

    const pct = ((item.count / analytics.totalSubmissions) * 100).toFixed(1);
    row.appendChild(el('span', 'cf-bar-value', `${item.count} (${pct}%)`));
    langList.appendChild(row);
  }
  langPanel.appendChild(langList);

  grid.appendChild(verdictPanel);
  grid.appendChild(langPanel);
  container.appendChild(grid);

  // Activity Heatmap (last 26 weeks / ~182 days)
  const heatmapPanel = el('div', 'cf-panel');
  heatmapPanel.style.marginTop = '12px';
  heatmapPanel.appendChild(el('h3', 'cf-panel-title', 'Submission Activity (Last 6 Months)'));

  const heatmapWrap = el('div', 'cf-heatmap-wrap');
  const heatmap = el('div', 'cf-heatmap');

  const today = new Date();
  const endUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const weeks = 26;
  const totalDays = weeks * 7;
  const startUtc = endUtc - (totalDays - 1) * 86400000;

  let periodTotal = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startUtc + i * 86400000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const info = analytics.dailyActivity.get(key);
    const count = info ? info.total : 0;
    periodTotal += count;

    let level = 0;
    if (count >= 10) level = 4;
    else if (count >= 5) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    const cell = el('div', 'cf-heatmap-cell');
    cell.setAttribute('data-level', String(level));
    cell.title = `${key}: ${count} submission${count === 1 ? '' : 's'}`;
    heatmap.appendChild(cell);
  }

  heatmapWrap.appendChild(heatmap);
  heatmapPanel.appendChild(heatmapWrap);

  const footer = el('div', 'cf-heatmap-footer');
  footer.appendChild(el('span', '', `${periodTotal} submissions in the last 26 weeks`));

  const legend = el('div', 'cf-heatmap-legend');
  legend.appendChild(el('span', '', 'Less'));
  for (let lvl = 0; lvl <= 4; lvl++) {
    const swatch = el('span', 'cf-heatmap-cell');
    swatch.setAttribute('data-level', String(lvl));
    legend.appendChild(swatch);
  }
  legend.appendChild(el('span', '', 'More'));
  footer.appendChild(legend);

  heatmapPanel.appendChild(footer);
  container.appendChild(heatmapPanel);
}

/**
 * 6. Topic Analysis
 */
export function renderTopics(container, metaEl, analytics) {
  container.innerHTML = '';
  metaEl.textContent = `${analytics.tags.length} topic${analytics.tags.length === 1 ? '' : 's'} across solved problems`;

  if (analytics.tags.length === 0) {
    container.appendChild(el('div', 'cf-empty', 'No problem tags available yet.'));
    return;
  }

  const panel = el('div', 'cf-panel');
  const list = el('div', 'cf-bar-list');
  const topTags = analytics.tags.slice(0, 15);
  const maxTagCount = Math.max(...topTags.map((t) => t.count), 1);

  for (const item of topTags) {
    const row = el('div', 'cf-bar-row');
    row.appendChild(el('span', 'cf-bar-label', item.tag));

    const track = el('div', 'cf-bar-track');
    const fill = el('div', 'cf-bar-fill');
    fill.style.width = `${Math.round((item.count / maxTagCount) * 100)}%`;
    track.appendChild(fill);
    row.appendChild(track);

    row.appendChild(el('span', 'cf-bar-value', `${item.count} solved`));
    list.appendChild(row);
  }

  panel.appendChild(list);
  container.appendChild(panel);
}

/**
 * 7. Recent Activity
 */
export function renderRecentSubmissions(container, submissions, verdictFilter = 'ALL') {
  container.innerHTML = '';

  const filtered = verdictFilter === 'ALL'
    ? submissions
    : submissions.filter((s) => s.verdict === verdictFilter);

  const recent = filtered.slice(0, 20);

  if (recent.length === 0) {
    container.appendChild(el('div', 'cf-empty', 'No submissions match the selected filter.'));
    return;
  }

  const tableWrap = el('div', 'cf-table-wrap');
  const table = el('table', 'cf-table');

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['Problem', 'Verdict', 'Language', 'Time', 'Submitted'].forEach((label, idx) => {
    headRow.appendChild(el('th', idx === 3 ? 'cf-num' : '', label));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const sub of recent) {
    const p = sub.problem || {};
    const tr = document.createElement('tr');

    const tdProb = document.createElement('td');
    const probText = `${p.contestId || ''}${p.index || ''} — ${p.name || 'Unknown'}`;
    if (p.contestId && p.index) {
      const link = el('a', '', probText);
      link.href = `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      tdProb.appendChild(link);
    } else {
      tdProb.textContent = probText;
    }

    const tdVerdict = document.createElement('td');
    tdVerdict.appendChild(el('span', getVerdictBadgeClass(sub.verdict), formatVerdict(sub.verdict)));

    const tdLang = el('td', '', sub.programmingLanguage || '—');
    const tdExec = el(
      'td',
      'cf-num',
      typeof sub.timeConsumedMillis === 'number' ? `${sub.timeConsumedMillis} ms` : '—'
    );
    const tdWhen = el('td', '', formatRelativeTime(sub.creationTimeSeconds));
    tdWhen.title = formatDate(sub.creationTimeSeconds);

    tr.appendChild(tdProb);
    tr.appendChild(tdVerdict);
    tr.appendChild(tdLang);
    tr.appendChild(tdExec);
    tr.appendChild(tdWhen);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);
}
