// Telegram Total Leads
async function loadTelegramTotal() {
  const res = await fetch("http://localhost:5000/api/analytics/telegram-total");
  const data = await res.json();
  document.getElementById("telegramTotal").innerText = data.total;
}

// Telegram Conversion Rate
async function loadTelegramConversion() {
  const res = await fetch(
    "http://localhost:5000/api/analytics/telegram-conversion",
  );
  const data = await res.json();
  document.getElementById("telegramConversion").innerText =
    data.conversionRate + "%";
}

// Telegram Monthly Chart
async function loadTelegramMonthly() {
  const res = await fetch(
    "http://localhost:5000/api/analytics/telegram-monthly",
  );
  const data = await res.json();

  const labels = data.map((item) => "Month " + item._id);
  const counts = data.map((item) => item.count);

  new Chart(document.getElementById("telegramMonthlyChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Telegram Monthly Leads",
          data: counts,
        },
      ],
    },
  });
}

// Source Pie Chart (Manual vs Telegram)
async function loadSourceChart() {
  const res = await fetch("http://localhost:5000/api/analytics/source");
  const data = await res.json();

  const labels = data.map((item) => item._id);
  const counts = data.map((item) => item.count);

  new Chart(document.getElementById("sourceChart"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
        },
      ],
    },
  });
}
// Telegram Growth
async function loadTelegramGrowth() {
  const res = await fetch(
    "http://localhost:5000/api/analytics/telegram-growth",
  );
  const data = await res.json();

  const growthElement = document.getElementById("telegramGrowth");

  const growthValue = parseFloat(data.growth);

  growthElement.innerText = growthValue + "%";

  // Remove old classes
  growthElement.classList.remove("up", "down");

  if (growthValue > 0) {
    growthElement.classList.add("up");
  } else if (growthValue < 0) {
    growthElement.classList.add("down");
  }
}

// Run all when page loads
window.onload = function () {
  loadTelegramTotal();
  loadTelegramConversion();
  loadTelegramMonthly();
  loadSourceChart();
  loadTelegramGrowth(); // ADD THIS
};
