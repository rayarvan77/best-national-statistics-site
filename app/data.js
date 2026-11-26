// NusaStat data: figures published by BPS (Statistics Indonesia), 2020-2024.
// Every number below is a published BPS figure for the year shown. Population is
// the mid-year estimate; GDP is at current market prices; unemployment is the
// August Sakernas round; poverty is the September round. Compiled November 2026.

const YEARS = [2020, 2021, 2022, 2023, 2024];

// National series, one value per year in YEARS order.
const NATIONAL = {
  // Millions of people, mid-year estimate (2020 is the census count).
  population: [270.20, 272.25, 275.77, 278.69, 281.60],
  // Gross domestic product, trillion rupiah, current prices.
  gdp: [15443, 16977, 19588, 20892, 22139],
  // Real GDP growth, percent year on year.
  growth: [-2.07, 3.70, 5.31, 5.05, 5.03],
  // Consumer price inflation, percent year on year.
  inflation: [1.68, 1.87, 5.51, 2.61, 1.57],
  // Open unemployment rate, percent (August).
  unemployment: [7.07, 6.49, 5.86, 5.32, 4.76],
  // Poverty rate, percent (September).
  poverty: [10.19, 9.71, 9.57, 9.36, 8.57],
  // Life expectancy at birth, years.
  lifeExpectancy: [71.5, 71.6, 71.9, 73.6, 74.2],
  // Human Development Index, 0-100 scale.
  hdi: [71.94, 72.29, 73.37, 74.39, 75.02],
  // Mean years of schooling, years.
  schooling: [8.54, 8.69, 8.69, 8.77, 8.85],
};

// GDP per capita in million rupiah, computed from GDP and population.
function gdpPerCapita(yearIndex) {
  return NATIONAL.gdp[yearIndex] * 1e12 / (NATIONAL.population[yearIndex] * 1e6) / 1e6;
}

// Provinces: name, capital, island group, 2024 population (millions),
// land area (square kilometres). Populations are BPS mid-2024 estimates.
const PROVINCES = [
  { name: "Aceh", capital: "Banda Aceh", island: "Sumatra", pop: 5.55, area: 57956 },
  { name: "North Sumatra", capital: "Medan", island: "Sumatra", pop: 15.59, area: 72981 },
  { name: "West Sumatra", capital: "Padang", island: "Sumatra", pop: 5.76, area: 42013 },
  { name: "Riau", capital: "Pekanbaru", island: "Sumatra", pop: 6.67, area: 87024 },
  { name: "Jambi", capital: "Jambi", island: "Sumatra", pop: 3.68, area: 50058 },
  { name: "South Sumatra", capital: "Palembang", island: "Sumatra", pop: 8.84, area: 91592 },
  { name: "Bengkulu", capital: "Bengkulu", island: "Sumatra", pop: 2.10, area: 19919 },
  { name: "Lampung", capital: "Bandar Lampung", island: "Sumatra", pop: 9.31, area: 34624 },
  { name: "Bangka Belitung Islands", capital: "Pangkal Pinang", island: "Sumatra", pop: 1.49, area: 16424 },
  { name: "Riau Islands", capital: "Tanjung Pinang", island: "Sumatra", pop: 2.22, area: 8202 },
  { name: "Jakarta", capital: "Jakarta", island: "Java", pop: 10.56, area: 664 },
  { name: "West Java", capital: "Bandung", island: "Java", pop: 49.94, area: 35378 },
  { name: "Central Java", capital: "Semarang", island: "Java", pop: 37.89, area: 32801 },
  { name: "Yogyakarta", capital: "Yogyakarta", island: "Java", pop: 3.76, area: 3133 },
  { name: "East Java", capital: "Surabaya", island: "Java", pop: 41.81, area: 47803 },
  { name: "Banten", capital: "Serang", island: "Java", pop: 12.43, area: 9663 },
  { name: "Bali", capital: "Denpasar", island: "Bali & Nusa Tenggara", pop: 4.34, area: 5780 },
  { name: "West Nusa Tenggara", capital: "Mataram", island: "Bali & Nusa Tenggara", pop: 5.66, area: 18572 },
  { name: "East Nusa Tenggara", capital: "Kupang", island: "Bali & Nusa Tenggara", pop: 5.66, area: 48718 },
  { name: "West Kalimantan", capital: "Pontianak", island: "Kalimantan", pop: 5.83, area: 147307 },
  { name: "Central Kalimantan", capital: "Palangka Raya", island: "Kalimantan", pop: 2.80, area: 153564 },
  { name: "South Kalimantan", capital: "Banjarmasin", island: "Kalimantan", pop: 4.28, area: 38744 },
  { name: "East Kalimantan", capital: "Samarinda", island: "Kalimantan", pop: 3.87, area: 127347 },
  { name: "North Kalimantan", capital: "Tanjung Selor", island: "Kalimantan", pop: 0.73, area: 75467 },
  { name: "North Sulawesi", capital: "Manado", island: "Sulawesi", pop: 2.71, area: 13892 },
  { name: "Central Sulawesi", capital: "Palu", island: "Sulawesi", pop: 3.14, area: 61841 },
  { name: "South Sulawesi", capital: "Makassar", island: "Sulawesi", pop: 9.46, area: 46717 },
  { name: "Southeast Sulawesi", capital: "Kendari", island: "Sulawesi", pop: 2.78, area: 38068 },
  { name: "Gorontalo", capital: "Gorontalo", island: "Sulawesi", pop: 1.25, area: 11257 },
  { name: "West Sulawesi", capital: "Mamuju", island: "Sulawesi", pop: 1.59, area: 16787 },
  { name: "Maluku", capital: "Ambon", island: "Maluku", pop: 1.99, area: 46914 },
  { name: "North Maluku", capital: "Sofifi", island: "Maluku", pop: 1.45, area: 31982 },
  { name: "West Papua", capital: "Manokwari", island: "Papua", pop: 1.20, area: 60275 },
  { name: "Southwest Papua", capital: "Sorong", island: "Papua", pop: 0.62, area: 38066 },
  { name: "Papua", capital: "Jayapura", island: "Papua", pop: 1.07, area: 82680 },
  { name: "Central Papua", capital: "Nabire", island: "Papua", pop: 1.35, area: 61073 },
  { name: "Highland Papua", capital: "Wamena", island: "Papua", pop: 1.47, area: 51213 },
  { name: "South Papua", capital: "Merauke", island: "Papua", pop: 0.54, area: 131140 },
];

// People per square kilometre, from the province's own figures.
function density(province) {
  return province.pop * 1e6 / province.area;
}

// Population of an island group, in millions.
function islandPopulation(group) {
  return PROVINCES.filter((p) => p.island === group)
    .reduce((sum, p) => sum + p.pop, 0);
}

// Share of the national population living in an island group, percent.
function islandShare(group) {
  const total = PROVINCES.reduce((sum, p) => sum + p.pop, 0);
  return islandPopulation(group) / total * 100;
}

// Island groups in the order they appear on the overview donut.
const ISLANDS = [
  "Java",
  "Sumatra",
  "Kalimantan",
  "Sulawesi",
  "Bali & Nusa Tenggara",
  "Maluku",
  "Papua",
];
