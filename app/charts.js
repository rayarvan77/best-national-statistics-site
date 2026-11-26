// NusaStat charts: small SVG chart builders with no dependencies.
// Each function takes plain arrays and returns an SVG string the page drops
// into the document. Nothing here touches the network.

const CHART = { width: 640, height: 300, padLeft: 56, padRight: 16, padTop: 18, padBottom: 34 };

function niceTicks(min, max, count) {
  const span = max - min || 1;
  const step = span / count;
  const power = Math.pow(10, Math.floor(Math.log10(step)));
  const unit = step / power;
  const rounded = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  const size = rounded * power;
  const start = Math.floor(min / size) * size;
  const ticks = [];
  for (let value = start; value <= max + size * 0.001; value += size) ticks.push(value);
  return { ticks, size };
}

function axisLabels(values, format) {
  return values.map((v) => format(v)).join("|");
}

// Shared frame: plot area, horizontal gridlines and year labels along the base.
function frame(values, labels, formatValue) {
  const { width, height, padLeft, padRight, padTop, padBottom } = CHART;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const { ticks } = niceTicks(min, max, 4);
  const top = Math.max(max, ticks[ticks.length - 1]);
  const bottom = Math.min(min, ticks[0]);
  const y = (v) => padTop + plotH - (v - bottom) / (top - bottom) * plotH;
  const x = (i) => padLeft + (labels.length === 1 ? plotW / 2 : i / (labels.length - 1) * plotW);
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="chart">`;
  for (const t of ticks) {
    svg += `<line x1="${padLeft}" y1="${y(t)}" x2="${width - padRight}" y2="${y(t)}" stroke="#e3ddd0" stroke-width="1"/>`;
    svg += `<text x="${padLeft - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#5c6b62">${formatValue(t)}</text>`;
  }
  labels.forEach((label, i) => {
    svg += `<text x="${x(i)}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#5c6b62">${label}</text>`;
  });
  return { svg, x, y, plotW, plotH, close: "</svg>" };
}

// A line chart with dots on every year and the value printed above each dot.
function lineChart(values, labels, formatValue, color) {
  const f = frame(values, labels, formatValue);
  const points = values.map((v, i) => `${f.x(i)},${f.y(v)}`).join(" ");
  let svg = f.svg;
  svg += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  values.forEach((v, i) => {
    svg += `<circle cx="${f.x(i)}" cy="${f.y(v)}" r="4.5" fill="#faf6ee" stroke="${color}" stroke-width="2.5"/>`;
    // Edge labels anchor inward so the first and last values are never clipped.
    const anchor = i === 0 ? "start" : i === values.length - 1 ? "end" : "middle";
    const lx = i === 0 ? f.x(i) + 2 : i === values.length - 1 ? f.x(i) - 2 : f.x(i);
    svg += `<text x="${lx}" y="${f.y(v) - 11}" text-anchor="${anchor}" font-size="11.5" font-weight="600" fill="#1e2a24">${formatValue(v)}</text>`;
  });
  return svg + f.close;
}

// A horizontal bar chart: one bar per label, value printed past the bar end.
function barChart(values, labels, formatValue, color) {
  const { width, height, padLeft, padRight, padTop, padBottom } = CHART;
  const plotW = width - padLeft - padRight;
  const max = Math.max(...values);
  const gap = 10;
  const barH = (height - padTop - padBottom - gap * (values.length - 1)) / values.length;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="chart">`;
  values.forEach((v, i) => {
    const top = padTop + i * (barH + gap);
    const barW = v / max * (plotW - 110);
    svg += `<text x="${padLeft - 8}" y="${top + barH / 2 + 4}" text-anchor="end" font-size="11.5" fill="#1e2a24">${labels[i]}</text>`;
    svg += `<rect x="${padLeft}" y="${top}" width="${barW}" height="${barH}" rx="3" fill="${color}"/>`;
    svg += `<text x="${padLeft + barW + 8}" y="${top + barH / 2 + 4}" font-size="11.5" font-weight="600" fill="#1e2a24">${formatValue(v)}</text>`;
  });
  return svg + "</svg>";
}

// A column chart: one column per year; the column at highlightIndex is drawn
// in the accent colour and the rest in the base colour.
function columnChart(values, labels, formatValue, baseColor, accentColor, highlightIndex) {
  const f = frame(values, labels, formatValue);
  const slot = f.plotW / values.length;
  const colW = Math.min(56, slot * 0.62);
  let svg = f.svg;
  values.forEach((v, i) => {
    const left = f.x(i) - colW / 2;
    const top = f.y(Math.max(0, v));
    const base = f.y(0);
    const color = i === highlightIndex ? accentColor : baseColor;
    svg += `<rect x="${left}" y="${top}" width="${colW}" height="${Math.max(1, base - top)}" rx="3" fill="${color}"/>`;
    // Edge labels anchor inward so the first and last values are never clipped.
    const anchor = i === 0 ? "start" : i === values.length - 1 ? "end" : "middle";
    const lx = i === 0 ? f.x(i) + 2 : i === values.length - 1 ? f.x(i) - 2 : f.x(i);
    svg += `<text x="${lx}" y="${top - 7}" text-anchor="${anchor}" font-size="11.5" font-weight="600" fill="#1e2a24">${formatValue(v)}</text>`;
  });
  return svg + f.close;
}

// A donut chart: each slice labelled with its share in the legend beside it.
function donutChart(parts, colors) {
  const size = 300;
  const cx = 110;
  const cy = 150;
  const radius = 96;
  const inner = 58;
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  let svg = `<svg viewBox="0 0 640 ${size}" role="img" aria-label="chart">`;
  let angle = -Math.PI / 2;
  parts.forEach((part, i) => {
    const sweep = part.value / total * Math.PI * 2;
    const large = sweep > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(angle);
    const y1 = cy + radius * Math.sin(angle);
    const x2 = cx + radius * Math.cos(angle + sweep);
    const y2 = cy + radius * Math.sin(angle + sweep);
    const ix1 = cx + inner * Math.cos(angle);
    const iy1 = cy + inner * Math.sin(angle);
    const ix2 = cx + inner * Math.cos(angle + sweep);
    const iy2 = cy + inner * Math.sin(angle + sweep);
    svg += `<path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z" fill="${colors[i % colors.length]}"/>`;
    angle += sweep;
  });
  svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="26" font-weight="700" fill="#1e2a24">${total.toFixed(1)}</text>`;
  svg += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="11.5" fill="#5c6b62">million people</text>`;
  parts.forEach((part, i) => {
    const top = 34 + i * 34;
    svg += `<rect x="250" y="${top}" width="14" height="14" rx="3" fill="${colors[i % colors.length]}"/>`;
    svg += `<text x="272" y="${top + 12}" font-size="12.5" fill="#1e2a24">${part.label} — ${part.value.toFixed(1)}m (${(part.value / total * 100).toFixed(1)}%)</text>`;
  });
  return svg + "</svg>";
}

// Number formatting helpers used across the pages.
function fmtMillions(v) { return v.toFixed(1); }
function fmtTrillion(v) { return v.toLocaleString("en-US"); }
function fmtPercent(v) { return (v > 0 ? "+" : "") + v.toFixed(2) + "%"; }
function fmtPlain(v) { return v.toFixed(2); }
function fmtPeople(v) { return v.toLocaleString("en-US", { maximumFractionDigits: 0 }); }
