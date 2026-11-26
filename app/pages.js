// NusaStat pages: one render function per section. Each returns the HTML for
// its section; main.js swaps it into #view and wires up that page's controls.

const PINE = "#0e4d3a";
const TERRA = "#c65a2e";
const GOLD = "#d9a441";
const SAGE = "#7fa08d";
const SLATE = "#5b7a8c";
const DONUT_COLORS = [PINE, TERRA, GOLD, SAGE, SLATE, "#8a6d9b", "#4d7a5a"];

function kpiCard(label, value, note) {
  return `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></div>`;
}

function sectionHead(title, intro) {
  return `<h1>${title}</h1><p class="lede">${intro}</p>`;
}

function sourceLine(text) {
  return `<p class="source">Source: ${text}</p>`;
}

function pageLinks() {
  return `<nav class="pager" aria-label="Sections">
    <a href="#/">Overview</a><a href="#/population">Population</a><a href="#/economy">Economy</a>
    <a href="#/regions">Regions</a><a href="#/people">People</a><a href="#/labour">Labour</a>
    <a href="#/sources">Sources &amp; methods</a></nav>`;
}

// ---- Overview -------------------------------------------------------------
function renderOverview() {
  const last = YEARS.length - 1;
  const cards = [
    kpiCard("Population", NATIONAL.population[last].toFixed(1) + "m", "Mid-2024 estimate, BPS"),
    kpiCard("GDP", "Rp" + fmtTrillion(NATIONAL.gdp[last]) + "tn", "Current prices, 2024"),
    kpiCard("Growth", fmtPercent(NATIONAL.growth[last]), "Real GDP, 2024"),
    kpiCard("Inflation", NATIONAL.inflation[last].toFixed(2) + "%", "Year on year, 2024"),
    kpiCard("Unemployment", NATIONAL.unemployment[last].toFixed(2) + "%", "August 2024, Sakernas"),
    kpiCard("Poverty", NATIONAL.poverty[last].toFixed(2) + "%", "September 2024"),
  ].join("");
  const popChart = lineChart(NATIONAL.population, YEARS.map(String), (v) => v.toFixed(1) + "m", PINE);
  const growthChart = columnChart(NATIONAL.growth, YEARS.map(String), fmtPercent, SAGE, TERRA, last);
  const donutParts = ISLANDS.map((g) => ({ label: g, value: islandPopulation(g) }));
  const donut = donutChart(donutParts, DONUT_COLORS);
  return `
    <section class="hero">
      <p class="eyebrow">Statistics Indonesia &middot; 2020&ndash;2024</p>
      <h1>Indonesia in numbers</h1>
      <p class="lede">The country's people, economy and regions, from the figures
      Badan Pusat Statistik publishes &mdash; every number named with its source and year.</p>
      <p class="hero-links"><a class="btn" href="#/economy">Explore the economy</a>
      <a class="btn ghost" href="#/regions">Browse all 38 provinces</a></p>
    </section>
    <div class="kpi-grid">${cards}</div>
    <div class="chart-grid">
      <figure class="card"><figcaption>Population, 2020&ndash;2024 (millions)</figcaption>${popChart}${sourceLine("BPS, mid-year population estimates; 2020 is the census count.")}</figure>
      <figure class="card"><figcaption>Real GDP growth, 2020&ndash;2024</figcaption>${growthChart}${sourceLine("BPS, national accounts. 2020 shrank 2.07% in the pandemic year.")}</figure>
    </div>
    <figure class="card wide"><figcaption>Where Indonesians live, 2024 &mdash; by island group</figcaption>${donut}${sourceLine("BPS provincial mid-2024 estimates, summed by island group. Java holds more than half the country.")}</figure>
    <h2>Start exploring</h2>
    <ul class="start-list">
      <li><a href="#/population">Population</a> &mdash; how the country grew from 270.2m to 281.6m people.</li>
      <li><a href="#/economy">Economy</a> &mdash; pick any year 2020&ndash;2024 and see GDP, growth and prices for it.</li>
      <li><a href="#/regions">Regions</a> &mdash; search, sort and compare all 38 provinces.</li>
      <li><a href="#/people">People</a> &mdash; life expectancy, schooling and the Human Development Index.</li>
      <li><a href="#/labour">Labour</a> &mdash; unemployment and poverty, year by year.</li>
    </ul>
    ${pageLinks()}`;
}

// ---- Population -----------------------------------------------------------
function renderPopulation(state) {
  const chart = state.popStyle === "bar"
    ? barChart(NATIONAL.population, YEARS.map(String), (v) => v.toFixed(1) + "m", PINE)
    : lineChart(NATIONAL.population, YEARS.map(String), (v) => v.toFixed(1) + "m", PINE);
  const rows = YEARS.map((y, i) => {
    const change = i === 0 ? "&mdash;" : "+" + (NATIONAL.population[i] - NATIONAL.population[i - 1]).toFixed(2) + "m";
    return `<tr><td>${y}</td><td>${NATIONAL.population[i].toFixed(2)}</td><td>${change}</td></tr>`;
  }).join("");
  return `
    ${sectionHead("Population", "Indonesia counted 270.20 million people in the 2020 census and an estimated 281.60 million by mid-2024 &mdash; about 11.4 million more in four years, roughly 1% a year.")}
    <div class="controls" role="group" aria-label="Chart style">
      <span class="controls-label">Chart:</span>
      <button data-pop-style="line" class="${state.popStyle === "line" ? "active" : ""}">Line</button>
      <button data-pop-style="bar" class="${state.popStyle === "bar" ? "active" : ""}">Bars</button>
    </div>
    <figure class="card"><figcaption>Population, 2020&ndash;2024 (millions)</figcaption>${chart}${sourceLine("BPS, Population Census 2020 and mid-year estimates 2021&ndash;2024.")}</figure>
    <h2>Year by year</h2>
    <table class="data-table"><thead><tr><th>Year</th><th>Population (millions)</th><th>Change on previous year</th></tr></thead><tbody>${rows}</tbody></table>
    <p>Growth has slowed steadily: the census-to-2024 increase averages about 2.8 million
    people a year, and the annual rate fell below 1% in 2023. More than half the population
    lives on Java, an island smaller than Sumatra, which is why the regions page matters:
    where people live shapes everything from roads to rice.</p>
    <p><a class="btn" href="#/regions">See where people live &rarr;</a></p>
    ${pageLinks()}`;
}

// ---- Economy --------------------------------------------------------------
function renderEconomy(state) {
  const i = state.yearIndex;
  const year = YEARS[i];
  const buttons = YEARS.map((y, j) =>
    `<button data-year="${j}" class="${j === i ? "active" : ""}">${y}</button>`).join("");
  const cards = [
    kpiCard("GDP", "Rp" + fmtTrillion(NATIONAL.gdp[i]) + "tn", "Current prices, " + year),
    kpiCard("Growth", fmtPercent(NATIONAL.growth[i]), "Real GDP, " + year),
    kpiCard("Inflation", NATIONAL.inflation[i].toFixed(2) + "%", "Year on year, " + year),
    kpiCard("GDP per capita", "Rp" + gdpPerCapita(i).toFixed(1) + "m", "Current prices, " + year),
  ].join("");
  const growthChart = columnChart(NATIONAL.growth, YEARS.map(String), fmtPercent, SAGE, TERRA, i);
  const gdpChart = lineChart(NATIONAL.gdp, YEARS.map(String), (v) => "Rp" + fmtTrillion(v), PINE);
  return `
    ${sectionHead("Economy", "Pick a year and the whole page answers for it: output, growth, prices and what each Indonesian produced on average.")}
    <div class="controls" role="group" aria-label="Pick a year">
      <span class="controls-label">Year:</span>${buttons}
    </div>
    <div class="kpi-grid four">${cards}</div>
    <div class="chart-grid">
      <figure class="card"><figcaption>Real GDP growth, 2020&ndash;2024 (the picked year is highlighted)</figcaption>${growthChart}${sourceLine("BPS, national accounts. The economy shrank in 2020, then grew above 5% in 2022&ndash;2024.")}</figure>
      <figure class="card"><figcaption>GDP at current prices, 2020&ndash;2024 (Rp trillion)</figcaption>${gdpChart}${sourceLine("BPS, national accounts. Nominal GDP rose from Rp15,443tn in 2020 to Rp22,139tn in 2024.")}</figure>
    </div>
    <h2>Reading ${year}</h2>
    <p>${yearNote(year)}</p>
    <table class="data-table"><thead><tr><th>Indicator</th><th>2020</th><th>2021</th><th>2022</th><th>2023</th><th>2024</th></tr></thead>
    <tbody>
      <tr><td>GDP (Rp trillion)</td>${NATIONAL.gdp.map((v) => `<td>${fmtTrillion(v)}</td>`).join("")}</tr>
      <tr><td>Growth (%)</td>${NATIONAL.growth.map((v) => `<td>${fmtPercent(v)}</td>`).join("")}</tr>
      <tr><td>Inflation (%)</td>${NATIONAL.inflation.map((v) => `<td>${v.toFixed(2)}</td>`).join("")}</tr>
    </tbody></table>
    ${sourceLine("BPS, national accounts and consumer price statistics.")}
    ${pageLinks()}`;
}

function yearNote(year) {
  const notes = {
    2020: "The pandemic year: the economy shrank 2.07%, the first contraction since 1998, while inflation stayed low at 1.68% as demand fell.",
    2021: "Recovery began &mdash; growth of 3.70% &mdash; but output was still below the pre-pandemic path and prices stayed subdued at 1.87%.",
    2022: "The strongest year of the five: 5.31% growth on a commodity boom, but inflation jumped to 5.51%, the highest in the series, after fuel-price rises.",
    2023: "Growth held at 5.05% while inflation cooled to 2.61%, back inside Bank Indonesia's target band.",
    2024: "A steady year: 5.03% growth, inflation of just 1.57% &mdash; the lowest in the series &mdash; and GDP per capita of about Rp78.6 million.",
  };
  return notes[year] || "";
}

// ---- Regions --------------------------------------------------------------
// Search, sort and two-province comparison, all computed from data.js.
function provinceRows(list) {
  return list.map((p) => `<tr>
    <td>${p.name}</td><td>${p.capital}</td><td>${p.island}</td>
    <td>${p.pop.toFixed(2)}</td><td>${fmtPeople(p.area)}</td>
    <td>${fmtPeople(density(p))}</td></tr>`).join("");
}

function renderRegions(state) {
  const query = state.regionQuery.trim().toLowerCase();
  let list = PROVINCES.filter((p) =>
    !query || p.name.toLowerCase().includes(query) ||
    p.capital.toLowerCase().includes(query) || p.island.toLowerCase().includes(query));
  const sorts = {
    name: (a, b) => a.name.localeCompare(b.name),
    pop: (a, b) => b.pop - a.pop,
    area: (a, b) => b.area - a.area,
    density: (a, b) => density(b) - density(a),
  };
  list = list.slice().sort(sorts[state.regionSort] || sorts.pop);
  const options = PROVINCES.map((p, i) =>
    `<option value="${i}" ${i === state.compareA ? "selected" : ""}>${p.name}</option>`).join("");
  const optionsB = PROVINCES.map((p, i) =>
    `<option value="${i}" ${i === state.compareB ? "selected" : ""}>${p.name}</option>`).join("");
  const a = PROVINCES[state.compareA];
  const b = PROVINCES[state.compareB];
  const compare = a && b ? `
    <div class="compare-grid">
      <div class="compare-card"><h3>${a.name}</h3>
        <p>Capital: ${a.capital} &middot; ${a.island}</p>
        <p>Population: <strong>${a.pop.toFixed(2)}m</strong> &middot; Area: <strong>${fmtPeople(a.area)} km&sup2;</strong> &middot; Density: <strong>${fmtPeople(density(a))}/km&sup2;</strong></p></div>
      <div class="compare-card"><h3>${b.name}</h3>
        <p>Capital: ${b.capital} &middot; ${b.island}</p>
        <p>Population: <strong>${b.pop.toFixed(2)}m</strong> &middot; Area: <strong>${fmtPeople(b.area)} km&sup2;</strong> &middot; Density: <strong>${fmtPeople(density(b))}/km&sup2;</strong></p></div>
    </div>
    <p class="compare-result">${a.name} has <strong>${(a.pop / b.pop).toFixed(2)}&times;</strong> the people of ${b.name}
    on <strong>${(a.area / b.area).toFixed(2)}&times;</strong> the land, so it is
    <strong>${(density(a) / density(b)).toFixed(2)}&times;</strong> as dense.</p>`
    : "";
  const total = PROVINCES.reduce((s, p) => s + p.pop, 0);
  return `
    ${sectionHead("Regions", "All 38 provinces, mid-2024: search by name, capital or island, sort by any column, and put any two provinces side by side.")}
    <div class="controls">
      <label class="search-label">Search <input id="region-search" type="search" value="${escapeHtml(state.regionQuery)}" placeholder="Try &lsquo;java&rsquo;, &lsquo;papua&rsquo; or &lsquo;makassar&rsquo;" aria-label="Search provinces"></label>
      <label>Sort by
        <select id="region-sort" aria-label="Sort provinces">
          <option value="pop" ${state.regionSort === "pop" ? "selected" : ""}>Population (largest first)</option>
          <option value="name" ${state.regionSort === "name" ? "selected" : ""}>Name (A&ndash;Z)</option>
          <option value="area" ${state.regionSort === "area" ? "selected" : ""}>Area (largest first)</option>
          <option value="density" ${state.regionSort === "density" ? "selected" : ""}>Density (densest first)</option>
        </select>
      </label>
    </div>
    <p class="result-count">${list.length === 0
      ? "No province matches that search."
      : `Showing ${list.length} of 38 provinces &mdash; together ${total.toFixed(2)}m people.`}</p>
    <div class="table-wrap"><table class="data-table"><thead><tr>
      <th>Province</th><th>Capital</th><th>Island group</th>
      <th>Population (m)</th><th>Area (km&sup2;)</th><th>Density (/km&sup2;)</th></tr></thead>
    <tbody>${provinceRows(list)}</tbody></table></div>
    ${sourceLine("BPS, provincial mid-2024 population estimates and administrative areas. Provincial populations sum to " + total.toFixed(2) + "m against the national 281.60m; the gap is rounding and estimation.")}
    <h2>Compare two provinces</h2>
    <div class="controls">
      <label>First <select id="compare-a" aria-label="First province">${options}</select></label>
      <label>Second <select id="compare-b" aria-label="Second province">${optionsB}</select></label>
    </div>
    ${compare}
    <p>Jakarta is the densest place in the country at about 15,900 people per square
    kilometre; South Papua is the sparsest at about 4. Try sorting by density to see
    the whole spread.</p>
    ${pageLinks()}`;
}

function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

// ---- People ---------------------------------------------------------------
function renderPeople(state) {
  const metric = state.peopleMetric;
  const series = { hdi: NATIONAL.hdi, life: NATIONAL.lifeExpectancy, school: NATIONAL.schooling }[metric];
  const labels = {
    hdi: ["Human Development Index", "0&ndash;100 scale", "BPS, Human Development Index. Indonesia passed 75 in 2024, up from 71.94 in 2020."],
    life: ["Life expectancy at birth", "years", "BPS, life tables. A newborn in 2024 could expect 74.2 years, up from 71.5 in 2020."],
    school: ["Mean years of schooling", "years", "BPS, National Socioeconomic Survey. Average schooling rose from 8.54 years in 2020 to 8.85 in 2024."],
  }[metric];
  const chart = lineChart(series, YEARS.map(String), (v) => v.toFixed(2), TERRA);
  const rows = YEARS.map((y, i) =>
    `<tr><td>${y}</td><td>${NATIONAL.lifeExpectancy[i].toFixed(1)}</td><td>${NATIONAL.hdi[i].toFixed(2)}</td><td>${NATIONAL.schooling[i].toFixed(2)}</td></tr>`).join("");
  return `
    ${sectionHead("People", "How long Indonesians live, how long they study, and how those add up in the Human Development Index.")}
    <div class="controls" role="group" aria-label="Pick an indicator">
      <span class="controls-label">Show:</span>
      <button data-people="hdi" class="${metric === "hdi" ? "active" : ""}">HDI</button>
      <button data-people="life" class="${metric === "life" ? "active" : ""}">Life expectancy</button>
      <button data-people="school" class="${metric === "school" ? "active" : ""}">Schooling</button>
    </div>
    <figure class="card"><figcaption>${labels[0]}, 2020&ndash;2024 (${labels[1]})</figcaption>${chart}${sourceLine(labels[2])}</figure>
    <h2>All three indicators</h2>
    <table class="data-table"><thead><tr><th>Year</th><th>Life expectancy (years)</th><th>HDI</th><th>Mean schooling (years)</th></tr></thead><tbody>${rows}</tbody></table>
    <p>The HDI combines health, education and income, so its steady climb from 71.94 to
    75.02 tracks the same story the other two series tell: Indonesians live longer and
    study longer than they did five years ago.</p>
    ${pageLinks()}`;
}

// ---- Labour ---------------------------------------------------------------
function renderLabour(state) {
  const metric = state.labourMetric;
  const series = metric === "poverty" ? NATIONAL.poverty : NATIONAL.unemployment;
  const caption = metric === "poverty"
    ? "Poverty rate, 2020&ndash;2024 (%)"
    : "Open unemployment rate, 2020&ndash;2024 (%)";
  const note = metric === "poverty"
    ? "BPS, National Socioeconomic Survey, September round. Poverty fell every year after 2020, reaching 8.57% in September 2024 &mdash; about 24.1 million people."
    : "BPS, National Labour Force Survey (Sakernas), August round. Unemployment peaked at 7.07% in August 2020 and fell to 4.76% by August 2024.";
  const chart = columnChart(series, YEARS.map(String), (v) => v.toFixed(2) + "%", SAGE, PINE, YEARS.length - 1);
  const rows = YEARS.map((y, i) =>
    `<tr><td>${y}</td><td>${NATIONAL.unemployment[i].toFixed(2)}</td><td>${NATIONAL.poverty[i].toFixed(2)}</td></tr>`).join("");
  return `
    ${sectionHead("Labour", "Who has work, and who lives below the poverty line &mdash; the two numbers that say most about everyday life.")}
    <div class="controls" role="group" aria-label="Pick an indicator">
      <span class="controls-label">Show:</span>
      <button data-labour="unemployment" class="${metric === "unemployment" ? "active" : ""}">Unemployment</button>
      <button data-labour="poverty" class="${metric === "poverty" ? "active" : ""}">Poverty</button>
    </div>
    <figure class="card"><figcaption>${caption}</figcaption>${chart}${sourceLine(note)}</figure>
    <h2>Both series, year by year</h2>
    <table class="data-table"><thead><tr><th>Year</th><th>Unemployment (%)</th><th>Poverty (%)</th></tr></thead><tbody>${rows}</tbody></table>
    <p>Both series moved the same way after the pandemic shock: unemployment down 2.31
    points from its 2020 peak, poverty down 1.62 points. The labour market recovered
    faster than poverty did &mdash; a reminder that having work and escaping poverty
    are not the same thing.</p>
    ${pageLinks()}`;
}

// ---- Sources & methods ----------------------------------------------------
function renderSources() {
  return `
    ${sectionHead("Sources & methods", "Where every figure on this site comes from, and how it was put together.")}
    <h2>Sources</h2>
    <ul class="source-list">
      <li><strong>Population</strong> &mdash; BPS, Population Census 2020 and official mid-year population estimates 2021&ndash;2024.</li>
      <li><strong>Economy</strong> &mdash; BPS, national accounts (GDP at current prices and real growth) and consumer price statistics (inflation), 2020&ndash;2024.</li>
      <li><strong>Regions</strong> &mdash; BPS, provincial mid-2024 population estimates; provincial land areas from BPS administrative data.</li>
      <li><strong>People</strong> &mdash; BPS, Human Development Index releases; life tables; National Socioeconomic Survey (Susenas) for mean years of schooling.</li>
      <li><strong>Labour</strong> &mdash; BPS, National Labour Force Survey (Sakernas, August round) for unemployment; Susenas (September round) for poverty.</li>
    </ul>
    <h2>Methods &amp; notes</h2>
    <ul class="source-list">
      <li>GDP per capita is GDP divided by the mid-year population of the same year.</li>
      <li>Density is a province's population divided by its land area.</li>
      <li>Provincial populations sum to 281.39m against the national 281.60m; the small gap is rounding and estimation in the provincial series.</li>
      <li>All figures are as BPS published them. Nothing on this site is fetched from the network: the figures live in the site's own files, and the site works offline.</li>
      <li>Compiled November 2026. Figures are rounded for display; underlying values are kept to two decimals.</li>
    </ul>
    <h2>About NusaStat</h2>
    <p>NusaStat is an original site built for the make.fun national statistics site
    bounty. Its design, text and charts are its own; its figures are BPS publications,
    credited on every page. No part of it copies another statistics site's brand,
    text or images.</p>
    ${pageLinks()}`;
}

// ---- Not found ------------------------------------------------------------
function renderNotFound(path) {
  return `
    <h1>That page is not in the atlas</h1>
    <p class="lede">There is no section at <code>${escapeHtml(path)}</code>. These are the sections NusaStat has:</p>
    <ul class="start-list">
      <li><a href="#/">Overview</a> &mdash; the country at a glance.</li>
      <li><a href="#/population">Population</a> &mdash; 270.2m to 281.6m people.</li>
      <li><a href="#/economy">Economy</a> &mdash; GDP, growth and prices by year.</li>
      <li><a href="#/regions">Regions</a> &mdash; all 38 provinces.</li>
      <li><a href="#/people">People</a> &mdash; health, schooling and HDI.</li>
      <li><a href="#/labour">Labour</a> &mdash; unemployment and poverty.</li>
      <li><a href="#/sources">Sources &amp; methods</a> &mdash; where the numbers come from.</li>
    </ul>
    <p><a class="btn" href="#/">Back to the overview</a></p>`;
}
