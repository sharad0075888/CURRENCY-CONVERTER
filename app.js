const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll("select");

const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");

const amount = document.querySelector(".amount");

const msg = document.querySelector(".msg");

const exchangeBtn = document.querySelector(".exchange-btn");

const swapBtn = document.querySelector(".swap-btn");

const copyBtn = document.querySelector(".copy-btn");

const loader = document.querySelector(".loader");

const lastUpdate = document.querySelector(".last-update");

const themeBtn = document.querySelector(".theme-btn");

const favBtns = document.querySelectorAll(".fav-btn");

let chart;

// Populate dropdowns
for (let select of dropdowns) {
  for (let currCode in countryList) {
    let option = document.createElement("option");

    option.value = currCode;
    option.innerText = currCode;

    if (select.name === "from" && currCode === "USD") {
      option.selected = true;
    }

    if (select.name === "to" && currCode === "INR") {
      option.selected = true;
    }

    select.append(option);
  }
}

// Select2
$(document).ready(function () {
  $("select").select2({
    width: "100%",
  });

  $("select").on("change", function () {
    updateFlag(this);
    updateExchangeRate();
  });
});

// Update Flags
function updateFlag(element) {
  let currCode = element.value;

  let countryCode = countryList[currCode];

  if (!countryCode) return;

  let img = element.parentElement.querySelector("img");

  img.src = `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;

  img.alt = currCode;
}

// Draw Chart
function drawChart(rate) {
  const ctx = document.getElementById("chart");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",

    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

      datasets: [
        {
          label: `${fromCurr.value} → ${toCurr.value}`,

          data: [
            rate * 0.96,
            rate * 0.98,
            rate * 0.97,
            rate,
            rate * 1.02,
            rate * 1.01,
            rate * 0.99,
          ],

          borderWidth: 3,

          tension: 0.4,

          fill: true,
        },
      ],
    },

    options: {
      responsive: true,
    },
  });
}

// Exchange Rate
async function updateExchangeRate() {
  let amtVal = amount.value.trim();

if (amtVal === "") {
  msg.innerText = "Enter amount";
  return;
}

amtVal = parseFloat(amtVal);

  loader.classList.remove("hidden");

  const from = fromCurr.value.toLowerCase();

  const to = toCurr.value.toLowerCase();

  const URL = `${BASE_URL}/${from}.json`;

  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Error");
    }

    const data = await response.json();

    const rate = data[from][to];

    const finalAmount = (amtVal * rate).toFixed(2);

    msg.innerText =
      `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;

    lastUpdate.innerText =
      `Last Updated : ${new Date().toLocaleTimeString()}`;

    drawChart(rate);
  } catch (error) {
    msg.innerText = "Unable to fetch exchange rate.";
  } finally {
    loader.classList.add("hidden");
  }
}

// Exchange Button
exchangeBtn.addEventListener("click", () => {
  updateExchangeRate();
});

// Auto Convert
amount.addEventListener("input", () => {
  updateExchangeRate();
});

// Enter Key
amount.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    updateExchangeRate();
  }
});

// Swap Button
swapBtn.addEventListener("click", () => {
  let temp = fromCurr.value;

  fromCurr.value = toCurr.value;

  toCurr.value = temp;

  $(fromCurr).trigger("change");

  $(toCurr).trigger("change");

  updateExchangeRate();
});

// Copy Button
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(msg.innerText);

  copyBtn.innerHTML =
    `<i class="fa-solid fa-check"></i> Copied`;

  setTimeout(() => {
    copyBtn.innerHTML =
      `<i class="fa-regular fa-copy"></i> Copy`;
  }, 2000);
});

// Favorite Buttons
favBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    fromCurr.value = btn.dataset.from;

    toCurr.value = btn.dataset.to;

    $(fromCurr).trigger("change");

    $(toCurr).trigger("change");

    updateExchangeRate();
  });
});

// Dark Mode
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");

  themeBtn.innerHTML =
    `<i class="fa-solid fa-sun"></i>`;
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.innerHTML =
      `<i class="fa-solid fa-sun"></i>`;

    localStorage.setItem("theme", "dark");
  } else {
    themeBtn.innerHTML =
      `<i class="fa-solid fa-moon"></i>`;

    localStorage.setItem("theme", "light");
  }
});

// Initial Load
window.addEventListener("load", () => {
  dropdowns.forEach((select) => {
    updateFlag(select);
  });

  updateExchangeRate();
});