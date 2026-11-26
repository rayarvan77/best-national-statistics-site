// NusaStat router: reads the hash, renders the matching section into #view,
// and wires up that section's controls. Every control re-renders its own
// section, so a control's effect is visible at once and survives a reload
// of the same hash. No network requests are made anywhere in this file.

const state = {
  popStyle: "line",
  yearIndex: YEARS.length - 1,
  regionQuery: "",
  regionSort: "pop",
  compareA: 10,
  compareB: 36,
  peopleMetric: "hdi",
  labourMetric: "unemployment",
};

const ROUTES = {
  "/": renderOverview,
  "/population": () => renderPopulation(state),
  "/economy": () => renderEconomy(state),
  "/regions": () => renderRegions(state),
  "/people": () => renderPeople(state),
  "/labour": () => renderLabour(state),
  "/sources": renderSources,
};

function currentPath() {
  const hash = window.location.hash || "#/";
  const path = hash.slice(1).split("?")[0];
  return path === "" ? "/" : path;
}

function render() {
  const path = currentPath();
  const view = document.getElementById("view");
  const page = ROUTES[path];
  view.innerHTML = page ? page() : renderNotFound(path);
  document.querySelectorAll("header nav a").forEach((link) => {
    link.classList.toggle("current", link.getAttribute("href") === "#" + path);
  });
  wireControls();
  window.scrollTo(0, 0);
}

// Controls are re-bound after every render, since rendering replaces the DOM.
function wireControls() {
  document.querySelectorAll("[data-pop-style]").forEach((button) => {
    button.addEventListener("click", () => {
      state.popStyle = button.getAttribute("data-pop-style");
      render();
    });
  });
  document.querySelectorAll("[data-year]").forEach((button) => {
    button.addEventListener("click", () => {
      state.yearIndex = Number(button.getAttribute("data-year"));
      render();
    });
  });
  document.querySelectorAll("[data-people]").forEach((button) => {
    button.addEventListener("click", () => {
      state.peopleMetric = button.getAttribute("data-people");
      render();
    });
  });
  document.querySelectorAll("[data-labour]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labourMetric = button.getAttribute("data-labour");
      render();
    });
  });
  const search = document.getElementById("region-search");
  if (search) {
    search.addEventListener("input", () => {
      state.regionQuery = search.value;
      render();
      const again = document.getElementById("region-search");
      if (again) {
        again.focus();
        again.setSelectionRange(again.value.length, again.value.length);
      }
    });
  }
  const sort = document.getElementById("region-sort");
  if (sort) {
    sort.addEventListener("change", () => {
      state.regionSort = sort.value;
      render();
    });
  }
  const compareA = document.getElementById("compare-a");
  if (compareA) {
    compareA.addEventListener("change", () => {
      state.compareA = Number(compareA.value);
      render();
    });
  }
  const compareB = document.getElementById("compare-b");
  if (compareB) {
    compareB.addEventListener("change", () => {
      state.compareB = Number(compareB.value);
      render();
    });
  }
}

window.addEventListener("hashchange", render);
render();
