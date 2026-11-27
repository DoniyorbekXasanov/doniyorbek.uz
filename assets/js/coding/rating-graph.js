/**
 * Exact Codeforces Rating History Graph
 *
 * Reproduces the original Codeforces Flot-style rating graph:
 * - Horizontal colored division bands at exact rating coordinates
 * - Golden/yellow line (#edc240) with circular markers, no smoothing
 * - Chronological X-axis with month/year labels and vertical grid lines
 * - Actual Codeforces rating Y-axis (1200, 1400, 1600, 1900, ...)
 * - "Only rated" dropdown, upper-right username legend, thin chart border
 * - Interactive hover tooltip with contest details
 */

import { RATING_TIERS, formatDate } from './analytics.js';

const CF_Y_TICKS = [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 3500];
const LINE_COLOR = '#edc240';
const PLOT_BORDER_COLOR = '#888888';
const GRID_LINE_COLOR = 'rgba(0, 0, 0, 0.12)';
const AXIS_TEXT_COLOR = '#545454';
const AXIS_FONT = '11px Verdana, Arial, Helvetica, sans-serif';

function formatMonthYear(ms) {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatDayMonth(ms) {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate clean chronological X-axis ticks that fit without overlapping.
 */
function buildTimeTicks(minMs, maxMs, plotWidth) {
  const spanMs = Math.max(maxMs - minMs, 1);
  const maxTicks = Math.max(2, Math.floor(plotWidth / 95));
  const ticks = [];

  if (spanMs <= 45 * 24 * 3600 * 1000) {
    // Short span: evenly spaced day ticks
    const count = Math.min(maxTicks, 6);
    for (let i = 0; i < count; i++) {
      const t = minMs + ((i + 0.5) / count) * spanMs;
      ticks.push({ ms: t, label: formatDayMonth(t) });
    }
    return ticks;
  }

  // Multi-month span: align to 1st of month
  const start = new Date(minMs);
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const allMonths = [];
  while (cursor.getTime() <= maxMs) {
    allMonths.push(cursor.getTime());
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  if (allMonths.length === 0) {
    const mid = (minMs + maxMs) / 2;
    return [{ ms: mid, label: formatMonthYear(mid) }];
  }

  const step = Math.max(1, Math.ceil(allMonths.length / maxTicks));
  for (let i = 0; i < allMonths.length; i += step) {
    ticks.push({ ms: allMonths[i], label: formatMonthYear(allMonths[i]) });
  }
  return ticks;
}

/**
 * Render the exact Codeforces Rating History Graph into `container`.
 */
export function renderRatingGraph(container, { handle, contests }) {
  container.innerHTML = '';

  if (!Array.isArray(contests) || contests.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cf-empty';
    empty.textContent = 'No rated contest history available yet.';
    container.appendChild(empty);
    return;
  }

  const box = document.createElement('div');
  box.className = 'cf-rating-box';

  // Header: "Only rated" dropdown on left, username legend on right
  const header = document.createElement('div');
  header.className = 'cf-rating-box-header';

  const select = document.createElement('select');
  select.className = 'cf-rating-select';
  select.setAttribute('aria-label', 'Filter rating history');

  const optRated = document.createElement('option');
  optRated.value = 'rated';
  optRated.textContent = 'Only rated';

  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'All contests';

  select.appendChild(optRated);
  select.appendChild(optAll);

  const legend = document.createElement('div');
  legend.className = 'cf-rating-legend';

  const swatch = document.createElement('span');
  swatch.className = 'cf-rating-legend-swatch';

  const legendText = document.createElement('span');
  legendText.textContent = handle;

  legend.appendChild(swatch);
  legend.appendChild(legendText);

  header.appendChild(select);
  header.appendChild(legend);

  // Canvas wrapper + tooltip
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'cf-rating-canvas-wrap';

  const canvas = document.createElement('canvas');
  canvas.className = 'cf-rating-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `Codeforces rating history graph for ${handle}`);

  const tooltip = document.createElement('div');
  tooltip.className = 'cf-rating-tooltip';
  tooltip.hidden = true;

  canvasWrap.appendChild(canvas);
  canvasWrap.appendChild(tooltip);
  box.appendChild(header);
  box.appendChild(canvasWrap);
  container.appendChild(box);

  // Prepare chronological points
  const points = [...contests].sort(
    (a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds
  );

  let hoveredIndex = -1;
  let screenPoints = [];

  function draw() {
    const rect = canvasWrap.getBoundingClientRect();
    const width = Math.max(280, Math.floor(rect.width));
    const height = Math.max(220, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 10, right: 14, bottom: 26, left: 46 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    // Rating bounds: always show at least up to 2050 so 1200/1400/1600/1900 bands appear
    const ratings = points.map((p) => p.newRating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const yMin = minRating < 400 ? 0 : Math.max(0, Math.floor((minRating - 150) / 100) * 100);
    const yMax = Math.max(2050, Math.ceil((maxRating + 180) / 100) * 100);

    // Time bounds with small horizontal padding
    const times = points.map((p) => p.ratingUpdateTimeSeconds * 1000);
    const rawMinT = Math.min(...times);
    const rawMaxT = Math.max(...times);
    const rawSpan = rawMaxT - rawMinT;
    const tPad = rawSpan > 0 ? rawSpan * 0.08 : 7 * 24 * 3600 * 1000;
    const xMin = rawMinT - tPad;
    const xMax = rawMaxT + tPad;

    const toX = (ms) => pad.left + ((ms - xMin) / (xMax - xMin)) * plotW;
    const toY = (rating) => pad.top + ((yMax - rating) / (yMax - yMin)) * plotH;

    // 1. Draw Codeforces horizontal rating bands inside plot area
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, plotW, plotH);
    ctx.clip();

    for (const tier of RATING_TIERS) {
      const bandLow = Math.max(yMin, tier.min === -Infinity ? yMin : tier.min);
      const bandHigh = Math.min(yMax, tier.max === Infinity ? yMax : tier.max);
      if (bandHigh <= bandLow) continue;

      const yTop = toY(bandHigh);
      const yBot = toY(bandLow);
      ctx.fillStyle = tier.bandColor;
      ctx.fillRect(pad.left, yTop, plotW, yBot - yTop);
    }

    // 2. Horizontal grid lines at Codeforces rating thresholds
    const visibleYTicks = CF_Y_TICKS.filter((v) => v > yMin && v < yMax);
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;

    for (const tick of visibleYTicks) {
      const y = Math.round(toY(tick)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    }

    // 3. Vertical grid lines aligned with time axis
    const timeTicks = buildTimeTicks(xMin, xMax, plotW);
    for (const tick of timeTicks) {
      const x = Math.round(toX(tick.ms)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
    }

    // 4. Golden/yellow rating line (straight segments, no smoothing)
    screenPoints = points.map((p) => ({
      x: toX(p.ratingUpdateTimeSeconds * 1000),
      y: toY(p.newRating),
      data: p,
    }));

    if (screenPoints.length > 1) {
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      for (let i = 1; i < screenPoints.length; i++) {
        ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
      }
      ctx.stroke();
    }

    // 5. Circular markers for individual contests
    for (let i = 0; i < screenPoints.length; i++) {
      const pt = screenPoints[i];
      const isHovered = i === hoveredIndex;

      if (isHovered) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(237, 194, 64, 0.40)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHovered ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();
    }

    ctx.restore();

    // 6. Thin chart border
    ctx.strokeStyle = PLOT_BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad.left + 0.5, pad.top + 0.5, plotW - 1, plotH - 1);

    // 7. Y-axis labels
    ctx.font = AXIS_FONT;
    ctx.fillStyle = AXIS_TEXT_COLOR;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (const tick of visibleYTicks) {
      ctx.fillText(String(tick), pad.left - 6, toY(tick));
    }

    // 8. X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const tick of timeTicks) {
      ctx.fillText(tick.label, toX(tick.ms), pad.top + plotH + 6);
    }
  }

  function showTooltip(index) {
    if (index < 0 || index >= screenPoints.length) {
      tooltip.hidden = true;
      return;
    }

    const pt = screenPoints[index];
    const c = pt.data;
    const delta = c.newRating - c.oldRating;
    const deltaText = delta > 0 ? `+${delta}` : String(delta);
    const deltaClass = delta > 0 ? 'cf-delta-pos' : delta < 0 ? 'cf-delta-neg' : 'cf-delta-zero';

    tooltip.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'cf-rating-tooltip-title';
    title.textContent = c.contestName;

    const rowDate = document.createElement('div');
    rowDate.className = 'cf-rating-tooltip-row';
    rowDate.innerHTML = `<span>Date</span><span>${formatDate(c.ratingUpdateTimeSeconds)}</span>`;

    const rowRank = document.createElement('div');
    rowRank.className = 'cf-rating-tooltip-row';
    rowRank.innerHTML = `<span>Rank</span><span>#${c.rank.toLocaleString()}</span>`;

    const rowRating = document.createElement('div');
    rowRating.className = 'cf-rating-tooltip-row';
    rowRating.innerHTML = `<span>Rating</span><span>${c.oldRating} → <strong>${c.newRating}</strong></span>`;

    const rowDelta = document.createElement('div');
    rowDelta.className = 'cf-rating-tooltip-row';
    const dLabel = document.createElement('span');
    dLabel.textContent = 'Change';
    const dVal = document.createElement('span');
    dVal.className = deltaClass;
    dVal.textContent = deltaText;
    rowDelta.appendChild(dLabel);
    rowDelta.appendChild(dVal);

    tooltip.appendChild(title);
    tooltip.appendChild(rowDate);
    tooltip.appendChild(rowRank);
    tooltip.appendChild(rowRating);
    tooltip.appendChild(rowDelta);

    tooltip.hidden = false;

    // Position tooltip near point without overflowing container
    const wrapW = canvasWrap.clientWidth;
    const wrapH = canvasWrap.clientHeight;
    const tipW = tooltip.offsetWidth;
    const tipH = tooltip.offsetHeight;

    let left = pt.x + 12;
    if (left + tipW > wrapW - 8) {
      left = pt.x - tipW - 12;
    }
    left = Math.max(8, left);

    let top = pt.y - tipH / 2;
    top = Math.max(8, Math.min(wrapH - tipH - 8, top));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function handlePointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    let nearest = -1;
    let bestDist = 18;
    for (let i = 0; i < screenPoints.length; i++) {
      const dx = screenPoints[i].x - mx;
      const dy = screenPoints[i].y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = i;
      }
    }

    if (nearest !== hoveredIndex) {
      hoveredIndex = nearest;
      draw();
      showTooltip(hoveredIndex);
    }
  }

  function handlePointerLeave() {
    if (hoveredIndex !== -1) {
      hoveredIndex = -1;
      draw();
      tooltip.hidden = true;
    }
  }

  canvas.addEventListener('mousemove', handlePointerMove);
  canvas.addEventListener('mouseleave', handlePointerLeave);

  select.addEventListener('change', () => {
    // user.rating returns official rated contests; keep interactive state clean
    draw();
  });

  const resizeObserver = new ResizeObserver(() => draw());
  resizeObserver.observe(canvasWrap);

  draw();
}
