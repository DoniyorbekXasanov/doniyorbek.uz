/**
 * Pure analytics & data-transformation helpers for Codeforces API responses.
 */

export const RATING_TIERS = [
  { min: -Infinity, max: 1200, name: 'Newbie', slug: 'newbie', bandColor: '#cccccc' },
  { min: 1200, max: 1400, name: 'Pupil', slug: 'pupil', bandColor: '#77ff77' },
  { min: 1400, max: 1600, name: 'Specialist', slug: 'specialist', bandColor: '#77ddbb' },
  { min: 1600, max: 1900, name: 'Expert', slug: 'expert', bandColor: '#aaaaff' },
  { min: 1900, max: 2100, name: 'Candidate Master', slug: 'candidate-master', bandColor: '#ff88ff' },
  { min: 2100, max: 2300, name: 'Master', slug: 'master', bandColor: '#ffcc88' },
  { min: 2300, max: 2400, name: 'International Master', slug: 'international-master', bandColor: '#ffbb55' },
  { min: 2400, max: 2600, name: 'Grandmaster', slug: 'grandmaster', bandColor: '#ff7777' },
  { min: 2600, max: 3000, name: 'International Grandmaster', slug: 'international-grandmaster', bandColor: '#ff3333' },
  { min: 3000, max: Infinity, name: 'Legendary Grandmaster', slug: 'legendary-grandmaster', bandColor: '#aa0000' },
];

export function getRankSlug(rank) {
  if (!rank) return 'newbie';
  return String(rank).trim().toLowerCase().replace(/\s+/g, '-');
}

export function getTierForRating(rating) {
  const val = typeof rating === 'number' ? rating : 0;
  return RATING_TIERS.find((t) => val >= t.min && val < t.max) || RATING_TIERS[0];
}

export function formatDate(unixSeconds) {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(unixSeconds) {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(unixSeconds) {
  if (!unixSeconds) return '—';
  const diffSec = Math.floor(Date.now() / 1000 - unixSeconds);
  if (diffSec < 60) return 'just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(unixSeconds);
}

/**
 * Compute contest statistics from `user.rating` response.
 */
export function computeContestStats(ratingHistory) {
  const list = Array.isArray(ratingHistory) ? ratingHistory : [];
  if (list.length === 0) {
    return {
      totalContests: 0,
      bestRank: null,
      worstRank: null,
      bestGain: null,
      worstDrop: null,
      averageRank: null,
      chronological: [],
      reverseChronological: [],
    };
  }

  const chronological = [...list].sort(
    (a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds
  );

  let bestRank = Infinity;
  let worstRank = -Infinity;
  let rankSum = 0;
  let bestGain = -Infinity;
  let worstDrop = Infinity;

  for (const c of chronological) {
    if (typeof c.rank === 'number') {
      if (c.rank < bestRank) bestRank = c.rank;
      if (c.rank > worstRank) worstRank = c.rank;
      rankSum += c.rank;
    }
    const delta = c.newRating - c.oldRating;
    if (delta > bestGain) bestGain = delta;
    if (delta < worstDrop) worstDrop = delta;
  }

  return {
    totalContests: chronological.length,
    bestRank: Number.isFinite(bestRank) ? bestRank : null,
    worstRank: Number.isFinite(worstRank) ? worstRank : null,
    bestGain: Number.isFinite(bestGain) ? bestGain : null,
    worstDrop: Number.isFinite(worstDrop) ? worstDrop : null,
    averageRank: Math.round(rankSum / chronological.length),
    chronological,
    reverseChronological: [...chronological].reverse(),
  };
}

/**
 * Compute problem-solving, submission, topic, and activity analytics from `user.status`.
 */
export function computeSubmissionAnalytics(submissions) {
  const list = Array.isArray(submissions) ? submissions : [];

  const solvedProblemsMap = new Map();
  const attemptedProblemsSet = new Set();
  const verdictCounts = new Map();
  const languageCounts = new Map();
  const participantTypeCounts = new Map();
  const dailyActivity = new Map(); // YYYY-MM-DD -> { total, accepted }

  let acceptedSubmissions = 0;

  for (const sub of list) {
    const p = sub.problem || {};
    const problemKey = p.contestId ? `${p.contestId}-${p.index}` : `${p.name || 'unknown'}-${p.index || ''}`;
    attemptedProblemsSet.add(problemKey);

    const verdict = sub.verdict || 'TESTING';
    verdictCounts.set(verdict, (verdictCounts.get(verdict) || 0) + 1);

    const lang = sub.programmingLanguage || 'Unknown';
    languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);

    const pType = (sub.author && sub.author.participantType) || 'OTHER';
    participantTypeCounts.set(pType, (participantTypeCounts.get(pType) || 0) + 1);

    if (sub.creationTimeSeconds) {
      const d = new Date(sub.creationTimeSeconds * 1000);
      const dayKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const entry = dailyActivity.get(dayKey) || { total: 0, accepted: 0 };
      entry.total += 1;
      if (verdict === 'OK') entry.accepted += 1;
      dailyActivity.set(dayKey, entry);
    }

    if (verdict === 'OK') {
      acceptedSubmissions += 1;
      if (!solvedProblemsMap.has(problemKey)) {
        solvedProblemsMap.set(problemKey, p);
      }
    }
  }

  // Difficulty distribution & tag analysis on unique solved problems
  const difficultyBuckets = new Map();
  let unratedSolved = 0;
  let ratedSolvedSum = 0;
  let ratedSolvedCount = 0;
  let maxSolvedRating = null;
  const tagCounts = new Map();

  for (const problem of solvedProblemsMap.values()) {
    if (typeof problem.rating === 'number') {
      difficultyBuckets.set(problem.rating, (difficultyBuckets.get(problem.rating) || 0) + 1);
      ratedSolvedSum += problem.rating;
      ratedSolvedCount += 1;
      if (maxSolvedRating === null || problem.rating > maxSolvedRating) {
        maxSolvedRating = problem.rating;
      }
    } else {
      unratedSolved += 1;
    }

    if (Array.isArray(problem.tags)) {
      for (const tag of problem.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  const difficultyDistribution = Array.from(difficultyBuckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rating, count]) => ({ label: String(rating), rating, count }));

  if (unratedSolved > 0) {
    difficultyDistribution.push({ label: 'Unrated', rating: null, count: unratedSolved });
  }

  const tags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));

  const verdicts = Array.from(verdictCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([verdict, count]) => ({ verdict, count }));

  const languages = Array.from(languageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));

  const totalSubmissions = list.length;
  const uniqueSolved = solvedProblemsMap.size;
  const uniqueAttempted = attemptedProblemsSet.size;
  const acceptanceRate = totalSubmissions > 0
    ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
    : '0.0';

  return {
    totalSubmissions,
    acceptedSubmissions,
    acceptanceRate,
    uniqueSolved,
    uniqueAttempted,
    avgSolvedRating: ratedSolvedCount > 0 ? Math.round(ratedSolvedSum / ratedSolvedCount) : null,
    maxSolvedRating,
    difficultyDistribution,
    tags,
    verdicts,
    languages,
    participantTypes: Object.fromEntries(participantTypeCounts),
    dailyActivity,
    activeDays: dailyActivity.size,
  };
}
