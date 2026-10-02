"use strict";

const rupees = value => `₹${Number(value).toLocaleString("en-IN")}`;
const range = object => `${rupees(object.low)}–${rupees(object.high)}`;

async function loadLocalities() {
  const response = await fetch("./data/localities.json");
  if (!response.ok) throw new Error(`Data file returned HTTP ${response.status}`);
  return response.json();
}

function setText(name, value) {
  const target = document.querySelector(`[data-field="${name}"]`);
  if (target) target.textContent = value;
}

async function renderLocality(slug) {
  const target = document.getElementById("data-state");
  try {
    const item = (await loadLocalities()).find(row => row.slug === slug);
    if (!item) throw new Error("Area missing from data file");
    setText("updated", item.lastUpdated);
    setText("status", item.dataStatus);
    setText("price", `${range(item.salePriceRangePsf)} / sq ft`);
    setText("rent2", `${range(item.rent2BhkRange)} / month`);
    setText("rent3", `${range(item.rent3BhkRange)} / month`);
    setText("yield", `${item.estimatedGrossYieldPercent.toFixed(1)}%`);
    setText("sampleSize", `${item.sampleSize} reviewed observations`);
    setText("notes", item.notes);
    const rows = document.getElementById("example-rows");
    for (const example of item.examples) {
      const tr = document.createElement("tr");
      for (const value of [example.type, `${example.sizeSqFt.toLocaleString("en-IN")} sq ft`, rupees(example.askingPriceInr), `${rupees(example.askingRentInr)} / mo`]) {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      }
      rows.append(tr);
    }
    target.textContent = "Fictional sample figures • 0 reviewed market observations";
  } catch (error) {
    target.textContent = "Sample figures could not load. Open this site through a local web server, not directly as a file, and check data/localities.json.";
  }
}

async function renderSnapshot() {
  const root = document.getElementById("snapshot-cards");
  if (!root) return;
  try {
    const data = await loadLocalities();
    for (const item of data) {
      const article = document.createElement("article");
      article.className = "card";
      const status = document.createElement("span"); status.className = "badge"; status.textContent = "Fictional sample • 0 observations";
      const title = document.createElement("h3"); title.textContent = item.name;
      const sale = document.createElement("p"); sale.textContent = `Asking sale illustration: ${range(item.salePriceRangePsf)} / sq ft`;
      const rent = document.createElement("p"); rent.textContent = `2BHK asking rent illustration: ${range(item.rent2BhkRange)} / month`;
      article.append(status, title, sale, rent); root.append(article);
    }
  } catch (error) { root.textContent = "Sample data could not load. Start a local web server and check data/localities.json."; }
}

function setupCalculator() {
  const form = document.getElementById("yield-form");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const price = Number(form.elements.price.value);
    const rent = Number(form.elements.rent.value);
    const output = document.getElementById("yield-result");
    if (!Number.isFinite(price) || !Number.isFinite(rent) || price <= 0 || rent < 0) {
      output.textContent = "Enter a property price above zero and a monthly rent of zero or more.";
      return;
    }
    output.textContent = `Estimated gross rental yield: ${((rent * 12 / price) * 100).toFixed(2)}% per year (before expenses).`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });
  const slug = document.body.dataset.locality;
  if (slug) renderLocality(slug);
  renderSnapshot();
  setupCalculator();
});
