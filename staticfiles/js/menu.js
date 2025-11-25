// Get monthly sales data from backend
let monthlySales = Array(12).fill(0);
const monthlySalesElement = document.getElementById("monthly-sales-data");
if (monthlySalesElement) {
  try {
    const parsed = JSON.parse(monthlySalesElement.textContent);
    if (Array.isArray(parsed)) {
      monthlySales = parsed.map(val => Number.isFinite(val) ? val : 0);
    }
  } catch (error) {
    console.error("Failed to parse monthly sales data:", error);
  }
}

// Initialize chart only if canvas exists
const ctx = document.getElementById("salesChart");
if (!ctx) {
  console.error("Sales chart canvas not found");
} else {
  const salesChart = new Chart(ctx.getContext("2d"), {
  type: "line",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
      datasets: [
      {
        label: "Monthly Sales (₱)",
        data: monthlySales,
        backgroundColor: "#fff",
        borderColor: "#1e293b",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₱" + value.toLocaleString();
          },
        },
      },
    },
  },
  });

  // Refresh button - reload page to get fresh data
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
}

// Generate Report button
const generateReportBtn = document.getElementById("generateReportBtn");
if (generateReportBtn) {
  generateReportBtn.addEventListener("click", () => {
    alert("Report generation would be implemented here");
  });
}
