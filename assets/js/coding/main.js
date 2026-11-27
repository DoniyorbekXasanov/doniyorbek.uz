/**
 * Main orchestrator for the /coding Codeforces dashboard.
 */

import {
  fetchUserInfo,
  fetchUserRating,
  fetchUserSubmissions,
} from './api.js';
import {
  computeContestStats,
  computeSubmissionAnalytics,
} from './analytics.js';
import { renderRatingGraph } from './rating-graph.js';
import {
  renderProfile,
  renderContests,
  renderProblemStats,
  renderSubmissionAnalytics,
  renderTopics,
  renderRecentSubmissions,
} from './ui.js';

const CODEFORCES_HANDLE = 'DoniyorbekXasanov';

const dom = {
  syncStatus: document.getElementById('cf-sync-status'),
  refreshBtn: document.getElementById('cf-refresh-btn'),
  errorBanner: document.getElementById('cf-error-banner'),
  profileContainer: document.getElementById('cf-profile-container'),
  ratingMeta: document.getElementById('cf-rating-meta'),
  ratingGraphContainer: document.getElementById('cf-rating-graph-container'),
  contestsMeta: document.getElementById('cf-contests-meta'),
  contestsContainer: document.getElementById('cf-contests-container'),
  problemsMeta: document.getElementById('cf-problems-meta'),
  problemsContainer: document.getElementById('cf-problems-container'),
  submissionsMeta: document.getElementById('cf-submissions-meta'),
  submissionsContainer: document.getElementById('cf-submissions-container'),
  topicsMeta: document.getElementById('cf-topics-meta'),
  topicsContainer: document.getElementById('cf-topics-container'),
  recentControls: document.getElementById('cf-recent-controls'),
  verdictFilter: document.getElementById('cf-verdict-filter'),
  recentContainer: document.getElementById('cf-recent-container'),
};

let latestSubmissions = [];

function setLoadingState(isLoading) {
  if (dom.refreshBtn) {
    dom.refreshBtn.disabled = isLoading;
    dom.refreshBtn.classList.toggle('cf-refresh-btn--spinning', isLoading);
  }
  if (dom.syncStatus && isLoading) {
    dom.syncStatus.textContent = 'Syncing with Codeforces...';
  }
}

function showError(message) {
  if (!dom.errorBanner) return;
  dom.errorBanner.textContent = message;
  dom.errorBanner.hidden = false;
}

function clearError() {
  if (!dom.errorBanner) return;
  dom.errorBanner.hidden = true;
  dom.errorBanner.textContent = '';
}

async function loadDashboard(forceRefresh = false) {
  setLoadingState(true);
  clearError();

  try {
    // Respect Codeforces rate limits: sequential queued calls via api.js
    const userRes = await fetchUserInfo(CODEFORCES_HANDLE, { forceRefresh });
    const user = userRes.result;
    renderProfile(dom.profileContainer, user);

    const ratingRes = await fetchUserRating(user.handle, { forceRefresh });
    const contests = Array.isArray(ratingRes.result) ? ratingRes.result : [];
    const contestStats = computeContestStats(contests);

    dom.ratingMeta.textContent = `user.rating · ${contestStats.totalContests} rated contest${contestStats.totalContests === 1 ? '' : 's'}`;
    renderRatingGraph(dom.ratingGraphContainer, {
      handle: user.handle,
      contests: contestStats.chronological,
    });
    renderContests(dom.contestsContainer, dom.contestsMeta, contestStats);

    const statusRes = await fetchUserSubmissions(user.handle, { forceRefresh });
    latestSubmissions = Array.isArray(statusRes.result) ? statusRes.result : [];
    const submissionAnalytics = computeSubmissionAnalytics(latestSubmissions);

    renderProblemStats(dom.problemsContainer, dom.problemsMeta, submissionAnalytics);
    renderSubmissionAnalytics(dom.submissionsContainer, dom.submissionsMeta, submissionAnalytics);
    renderTopics(dom.topicsContainer, dom.topicsMeta, submissionAnalytics);

    if (dom.recentControls) {
      dom.recentControls.hidden = false;
    }
    const activeFilter = dom.verdictFilter ? dom.verdictFilter.value : 'ALL';
    renderRecentSubmissions(dom.recentContainer, latestSubmissions, activeFilter);

    const syncTime = new Date(statusRes.fetchedAt || Date.now()).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const sourceLabel = statusRes.stale ? 'Stale cache' : statusRes.cached ? 'Cached' : 'Live';
    dom.syncStatus.textContent = `${sourceLabel} · ${syncTime}`;
  } catch (error) {
    showError(`Unable to load Codeforces data: ${error.message}`);
    dom.syncStatus.textContent = 'Sync failed';
  } finally {
    setLoadingState(false);
  }
}

if (dom.refreshBtn) {
  dom.refreshBtn.addEventListener('click', () => {
    loadDashboard(true);
  });
}

if (dom.verdictFilter) {
  dom.verdictFilter.addEventListener('change', () => {
    renderRecentSubmissions(dom.recentContainer, latestSubmissions, dom.verdictFilter.value);
  });
}

loadDashboard(false);
