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

// Initialize chart only if canvas exists AND Chart.js is available
const ctx = document.getElementById("salesChart");
if (!ctx) {
  console.error("Sales chart canvas not found");
} else if (typeof Chart !== "undefined") {
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
} else {
  console.warn("Chart.js is not loaded; skipping chart initialization");
  // Still wire up refresh button even if chart is missing
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
}

// Generate Report button - Initialize modal functionality
function initReportModal() {
  const generateReportBtn = document.getElementById("generateReportBtn");
  const reportModal = document.getElementById("reportModal");
  const closeModalBtn = document.querySelector(".report-modal-close");
  const closeModalBtnFooter = document.querySelector(".report-modal-close-btn");

  // Open modal when Generate Report button is clicked
  if (generateReportBtn && reportModal) {
    generateReportBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      reportModal.style.display = "block";
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
  } else {
    console.warn("Report modal elements not found");
  }

  // Close modal when clicking the X button
  if (closeModalBtn && reportModal) {
    closeModalBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      reportModal.style.display = "none";
      document.body.style.overflow = ""; // Restore scrolling
    });
  }

  // Close modal when clicking the Close button
  if (closeModalBtnFooter && reportModal) {
    closeModalBtnFooter.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      reportModal.style.display = "none";
      document.body.style.overflow = ""; // Restore scrolling
    });
  }

  // Close modal when clicking outside of it
  if (reportModal) {
    reportModal.addEventListener("click", function(event) {
      if (event.target === reportModal) {
        reportModal.style.display = "none";
        document.body.style.overflow = ""; // Restore scrolling
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && reportModal && reportModal.style.display === "block") {
      reportModal.style.display = "none";
      document.body.style.overflow = ""; // Restore scrolling
    }
  });
}

// Initialize when DOM is ready (works with defer attribute)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReportModal);
} else {
  // DOM is already loaded
  initReportModal();
}
