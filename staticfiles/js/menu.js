// Wait for DOM and Chart.js to be ready
document.addEventListener("DOMContentLoaded", function() {
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

  // Initialize chart only if canvas exists and Chart.js is loaded
  const ctx = document.getElementById("salesChart");
  if (!ctx) {
    console.error("Sales chart canvas not found");
    return;
  }

  if (typeof Chart === 'undefined') {
    console.error("Chart.js library not loaded");
    return;
  }

  // Check if dark mode is active
  const isDarkMode = document.body.classList.contains('darkmode');
  
  // Chart colors based on theme
  const chartColors = {
    background: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
    border: isDarkMode ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 1)',
    pointBackground: isDarkMode ? 'rgba(99, 102, 241, 1)' : 'rgba(99, 102, 241, 1)',
    pointBorder: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 1)',
    gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    textColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
  };

  const salesChart = new Chart(ctx.getContext("2d"), {
    type: "bar",
    data: {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      datasets: [
        {
          label: "Monthly Sales",
          data: monthlySales,
          backgroundColor: isDarkMode 
            ? 'rgba(99, 102, 241, 0.6)' 
            : 'rgba(99, 102, 241, 0.7)',
          borderColor: chartColors.border,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 'flex',
          maxBarThickness: 60,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: chartColors.textColor,
            font: {
              size: 14,
              weight: '600',
            },
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: chartColors.textColor,
          bodyColor: chartColors.textColor,
          borderColor: chartColors.border,
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `Sales: ₱${context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
          },
          boxPadding: 6,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: chartColors.gridColor,
            lineWidth: 1,
          },
          ticks: {
            color: chartColors.textColor,
            font: {
              size: 12,
            },
            callback: function (value) {
              return "₱" + value.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
            },
            padding: 10,
          },
          border: {
            color: chartColors.gridColor,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: chartColors.textColor,
            font: {
              size: 12,
              weight: '500',
            },
            padding: 10,
          },
          border: {
            color: chartColors.gridColor,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart',
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
  });

  // Update chart colors when dark mode toggles
  const darkModeObserver = new MutationObserver(() => {
    const isDark = document.body.classList.contains('darkmode');
    const newColors = {
      background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
      border: isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 1)',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    };
    
    const isDark = document.body.classList.contains('darkmode');
    salesChart.data.datasets[0].backgroundColor = isDark 
      ? 'rgba(99, 102, 241, 0.6)' 
      : 'rgba(99, 102, 241, 0.7)';
    salesChart.data.datasets[0].borderColor = newColors.border;
    salesChart.options.scales.y.grid.color = newColors.gridColor;
    salesChart.options.scales.y.ticks.color = newColors.textColor;
    salesChart.options.scales.x.ticks.color = newColors.textColor;
    salesChart.options.plugins.legend.labels.color = newColors.textColor;
    salesChart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    salesChart.options.plugins.tooltip.titleColor = newColors.textColor;
    salesChart.options.plugins.tooltip.bodyColor = newColors.textColor;
    salesChart.update();
  });

  darkModeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
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
