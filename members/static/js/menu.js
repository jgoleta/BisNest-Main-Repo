// Initialize chart when DOM is ready
function initializeChart() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error("Chart.js is not loaded");
    setTimeout(initializeChart, 100);
    return;
  }

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
    return;
  }

  // Check if dark mode is active
  const isDark = document.body.classList.contains('darkmode');
  
  // Use website's accent color (#6366f1) with gradient
  const accentColor = '#6366f1';
  const accentDark = '#4a4df0';
  
  // Create gradient for bars
  const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
  if (isDark) {
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.4)');
  } else {
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.6)');
  }
  
  const salesChart = new Chart(ctx.getContext("2d"), {
    type: "bar",
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
          label: "Monthly Sales",
          data: monthlySales,
          backgroundColor: gradient,
          borderColor: accentColor,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: isDark ? "#e2e8f0" : "#1e293b",
            font: {
              family: "'Inter', 'Segoe UI', sans-serif",
              size: 13,
              weight: 500,
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? "#e2e8f0" : "#1e293b",
          bodyColor: isDark ? "#cbd5e1" : "#475569",
          borderColor: accentColor,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          titleFont: {
            family: "'Inter', 'Segoe UI', sans-serif",
            size: 13,
            weight: 600,
          },
          bodyFont: {
            family: "'Inter', 'Segoe UI', sans-serif",
            size: 13,
            weight: 500,
          },
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              return "₱" + context.parsed.y.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              });
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "'Inter', 'Segoe UI', sans-serif",
              size: 12,
              weight: 500,
            },
            padding: 8,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
          border: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "'Inter', 'Segoe UI', sans-serif",
              size: 12,
              weight: 500,
            },
            padding: 10,
            callback: function (value) {
              if (value >= 1000000) {
                return "₱" + (value / 1000000).toFixed(1) + "M";
              } else if (value >= 1000) {
                return "₱" + (value / 1000).toFixed(0) + "K";
              }
              return "₱" + value.toLocaleString();
            },
          },
          grid: {
            color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
            drawBorder: false,
            lineWidth: 1,
          },
          border: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
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
    },
  });

  // Update chart colors when dark mode changes
  let currentIsDark = isDark;
  const observer = new MutationObserver(() => {
    const newIsDark = document.body.classList.contains('darkmode');
    if (newIsDark !== currentIsDark) {
      currentIsDark = newIsDark;
      
      // Update gradient
      const newGradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
      if (newIsDark) {
        newGradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        newGradient.addColorStop(1, 'rgba(99, 102, 241, 0.4)');
      } else {
        newGradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
        newGradient.addColorStop(1, 'rgba(99, 102, 241, 0.6)');
      }
      
      salesChart.data.datasets[0].backgroundColor = newGradient;
      salesChart.options.plugins.legend.labels.color = newIsDark ? "#e2e8f0" : "#1e293b";
      salesChart.options.plugins.tooltip.backgroundColor = newIsDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      salesChart.options.plugins.tooltip.titleColor = newIsDark ? "#e2e8f0" : "#1e293b";
      salesChart.options.plugins.tooltip.bodyColor = newIsDark ? "#cbd5e1" : "#475569";
      salesChart.options.scales.x.ticks.color = newIsDark ? "#94a3b8" : "#64748b";
      salesChart.options.scales.y.ticks.color = newIsDark ? "#94a3b8" : "#64748b";
      salesChart.options.scales.x.grid.color = newIsDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
      salesChart.options.scales.y.grid.color = newIsDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
      salesChart.options.scales.x.border.color = newIsDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
      salesChart.options.scales.y.border.color = newIsDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";
      salesChart.update();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

// Wait for DOM and Chart.js to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Chart.js to load if it's still loading
    if (typeof Chart !== 'undefined') {
      initializeChart();
    } else {
      setTimeout(initializeChart, 100);
    }
  });
} else {
  if (typeof Chart !== 'undefined') {
    initializeChart();
  } else {
    setTimeout(initializeChart, 100);
  }
}

// Refresh button - reload page to get fresh data
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    window.location.reload();
  });
}

// Generate Report button
const generateReportBtn = document.getElementById("generateReportBtn");
if (generateReportBtn) {
  generateReportBtn.addEventListener("click", () => {
    alert("Report generation would be implemented here");
  });
}
