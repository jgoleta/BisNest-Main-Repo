if (!localStorage.getItem("dashboardData")) {
  localStorage.setItem(
    "dashboardData",
    JSON.stringify({
      totalSales: 0,
      orders: [],
      customers: [],
      inventory: 0,
      monthlySales: Array(12).fill(0),
      activities: [],
    })
  );
}

const ctx = document.getElementById("salesChart").getContext("2d");
const salesChart = new Chart(ctx, {
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
        data: Array(12).fill(0),
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

function loadDashboard() {
  const data = JSON.parse(localStorage.getItem("dashboardData"));

  document.getElementById("totalSales").textContent =
    "₱" + data.totalSales.toLocaleString();
  document.getElementById("totalOrders").textContent = data.orders.length;
  document.getElementById("newCustomers").textContent = data.customers.length;
  document.getElementById("inventoryLevel").textContent = data.inventory + "%";

  salesChart.data.datasets[0].data = data.monthlySales;
  salesChart.update();

  const activityFeed = document.getElementById("activityFeed");
  activityFeed.innerHTML = "";

  if (data.activities.length === 0) {
    activityFeed.innerHTML = `
          <div class="activity-item">
            <img src="https://i.ibb.co/PZdTmb35/Customer.png" class="activity-icon" alt="activity">
            <span>Welcome to your dashboard! Activities will appear here.</span>
          </div>
        `;
  } else {
    data.activities.forEach((activity) => {
      const item = document.createElement("div");
      item.className = "activity-item";
      item.innerHTML = `
            <img src="https://i.ibb.co/PZdTmb35/Customer.png" class="activity-icon" alt="${activity.type}">
            <span>${activity.message} <small>(${activity.time})</small></span>
          `;
      activityFeed.appendChild(item);
    });
  }
}

document.getElementById("addOrderBtn").addEventListener("click", () => {
  window.location.href = "{% url 'history' %}";
});

document.getElementById("generateReportBtn").addEventListener("click", () => {
  alert("Report generation would be implemented here");
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  loadDashboard();
});

loadDashboard();

window.addEventListener("storage", () => {
  loadDashboard();
});
