# NusaStat — Indonesia in Numbers

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/rayarvan77/best-national-statistics-site/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/rayarvan77/best-national-statistics-site/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

A national statistics site for Indonesia, built for the
[make.fun best national statistics site bounty](https://make.fun/bounty/best-national-statistics-site-20261126-0539).

## What it is

NusaStat answers the questions a visitor to a statistics site actually has:
how many people live here, how the economy is doing, where people live, how
long they live and study, and who has work. Every figure is a real BPS
(Statistics Indonesia) publication for 2020–2024, named with its source and
year on the page where it appears.

## Sections

- **Overview** — the country at a glance: six headline indicators, a
  population line chart, a growth column chart, and a donut of where
  Indonesians live by island group.
- **Population** — 270.20m people in the 2020 census to 281.60m by mid-2024,
  with a line/bar chart toggle and a year-by-year table.
- **Economy** — pick any year 2020–2024 and the page re-answers for it: GDP,
  growth, inflation and GDP per capita, with the picked year highlighted in
  the growth chart.
- **Regions** — all 38 provinces: search by name, capital or island, sort by
  population, area or density, and compare any two provinces side by side
  with ratios.
- **People** — life expectancy, mean years of schooling and the Human
  Development Index, with a toggle between the three series.
- **Labour** — unemployment (Sakernas, August) and poverty (Susenas,
  September), with a toggle between the two series.
- **Sources & methods** — where every figure comes from and how the derived
  ones (GDP per capita, density, island shares) were computed.

## How it works

The site is plain static files under `app/` — no build step, no libraries,
no network requests. Open `app/index.html` in a browser, or serve it:

```sh
node serve.ts            # http://localhost:8080
node serve.ts --port 8081
```

Charts are inline SVG drawn by `app/charts.js` from the figures in
`app/data.js`; sections are hash-routed pages rendered by `app/pages.js`
and wired up by `app/main.js`.

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data

All figures: BPS (Statistics Indonesia), 2020–2024. Highlights for 2024:
population 281.6m, GDP Rp22,139 trillion, growth 5.03%, inflation 1.57%,
unemployment 4.76%, poverty 8.57%, life expectancy 74.2 years, HDI 75.02.
Provincial populations sum to 281.39m against the national 281.60m; the
small gap is rounding and estimation in the provincial series.

## License

MIT — see [LICENSE](LICENSE).
