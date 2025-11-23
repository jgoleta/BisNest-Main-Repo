let salesData = [];
let currentYear = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", function () {
  loadSalesData();
  populateYearSelector();
  filterByYear();
  updateYearlySummary();
  updateMonthlyBreakdown();
  initializeDateSelectors();
});

function loadSalesData() {
  salesData = [];
  document.querySelectorAll(".table-body tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 5) {
      const date = cells[0].textContent.trim();
      const product = cells[1].textContent.trim();
      const quantity =
        parseFloat(cells[2].textContent.replace(/[₱,]/g, "")) || 0;
      const price = parseFloat(cells[3].textContent.replace(/[₱,]/g, "")) || 0;
      const total = parseFloat(cells[4].textContent.replace(/[₱,]/g, "")) || 0;

      salesData.push({
        date: date,
        product: product,
        quantity: quantity,
        price: price,
        total: total,
      });
    }
  });
}

function populateYearSelector() {
  const years = [
    ...new Set(salesData.map((sale) => new Date(sale.date).getFullYear())),
  ];
  years.sort((a, b) => b - a);

  const yearSelect = document.getElementById("yearSelect");
  yearSelect.innerHTML = '<option value="">All Years</option>';
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  });
}

function filterByYear() {
  const selectedYear = document.getElementById("yearSelect").value;
  currentYear = selectedYear || new Date().getFullYear();
  updateYearlySummary();
  updateMonthlyBreakdown();
}

function switchTab(tabName) {
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  event.target.classList.add("active");
  document.getElementById(tabName + "-tab").classList.add("active");
}

function updateYearlySummary() {
  const filteredData = currentYear
    ? salesData.filter(
        (sale) => new Date(sale.date).getFullYear() == currentYear
      )
    : salesData;

  const totalSales = filteredData.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredData.length;
  const avgMonthly = totalSales / 12;

  const monthlyData = getMonthlyData(filteredData);
  const bestMonthData = monthlyData.reduce(
    (max, month) => (month.total > max.total ? month : max),
    { month: "N/A", total: 0 }
  );

  document.getElementById("totalSales").textContent = `₱${totalSales.toFixed(
    2
  )}`;
  document.getElementById("avgMonthly").textContent = `₱${avgMonthly.toFixed(
    2
  )}`;
  document.getElementById("totalTransactions").textContent = totalTransactions;
  document.getElementById("bestMonth").textContent = bestMonthData.month;
}

function updateMonthlyBreakdown() {
  const filteredData = currentYear
    ? salesData.filter(
        (sale) => new Date(sale.date).getFullYear() == currentYear
      )
    : salesData;

  const monthlyData = getMonthlyData(filteredData);
  const monthlyTableBody = document.getElementById("monthlyTableBody");

  monthlyTableBody.innerHTML = "";
  monthlyData.forEach((month) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${month.month}</td>
                    <td>₱${month.total.toFixed(2)}</td>
                    <td>${month.transactions}</td>
                    <td>₱${month.avgPerTransaction.toFixed(2)}</td>
                `;
    monthlyTableBody.appendChild(row);
  });
}

function getMonthlyData(data) {
  const months = [
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
  ];

  const monthlyTotals = {};

  months.forEach((month) => {
    monthlyTotals[month] = {
      total: 0,
      transactions: 0,
    };
  });

  data.forEach((sale) => {
    const monthIndex = new Date(sale.date).getMonth();
    const monthName = months[monthIndex];
    monthlyTotals[monthName].total += sale.total;
    monthlyTotals[monthName].transactions += 1;
  });

  return months.map((month) => ({
    month: month,
    total: monthlyTotals[month].total,
    transactions: monthlyTotals[month].transactions,
    avgPerTransaction:
      monthlyTotals[month].transactions > 0
        ? monthlyTotals[month].total / monthlyTotals[month].transactions
        : 0,
  }));
}
function initializeDateSelectors() {
  const today = new Date();
  const dateInput = document.getElementById("dateSelect");
  if (dateInput) {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${yyyy}-${mm}-${dd}`; 
  }

  const weekInput = document.getElementById("weekSelect");
  if (weekInput) {
    const year = today.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = Math.floor((today - firstDayOfYear) / 86400000);
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );
    const currentWeek = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

    weekInput.value = currentWeek;
    updateWeekDisplay(currentWeek);
  }

  filterByDate();
  filterByWeek();
}

function filterByDate() {
  const selectedDate = document.getElementById("dateSelect").value;
  if (!selectedDate) return;

  const filteredData = salesData.filter((sale) => {
    const saleDateStr = String(sale.date).slice(0, 10);
    return saleDateStr === selectedDate;
  });

  updateDailySummary(filteredData);
  updateDailyBreakdown(filteredData);
}

function filterByWeek() {
  const selectedWeek = document.getElementById("weekSelect").value;
  if (!selectedWeek) return;

  updateWeekDisplay(selectedWeek);

  const [year, week] = selectedWeek.split("-W");
  if (!year || !week) return;

  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (parseInt(week) - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(
    firstDayOfYear.getDate() + daysToAdd - firstDayOfYear.getDay()
  );

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  if (isNaN(weekStart.getTime()) || isNaN(weekEnd.getTime())) return;

  const filteredData = salesData.filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate >= weekStart && saleDate <= weekEnd;
  });

  updateWeeklySummary(filteredData, weekStart);
  updateWeeklyBreakdown(filteredData, weekStart);
}

function updateWeekDisplay(weekString) {
  if (!weekString || weekString === "") {
    document.getElementById("weekDisplay").textContent = "Select a week";
    return;
  }

  const [year, week] = weekString.split("-W");
  if (!year || !week) {
    document.getElementById("weekDisplay").textContent = "Invalid week format";
    return;
  }

  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (parseInt(week) - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(
    firstDayOfYear.getDate() + daysToAdd - firstDayOfYear.getDay()
  );

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  if (isNaN(weekStart.getTime()) || isNaN(weekEnd.getTime())) {
    document.getElementById("weekDisplay").textContent = "Invalid week";
    return;
  }

  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const endDay = weekEnd.getDate();
  const yearDisplay = weekStart.getFullYear();

  const displayText = `Week of ${startMonth} ${startDay}–${endMonth} ${endDay}, ${yearDisplay}`;
  document.getElementById("weekDisplay").textContent = displayText;
}

function getWeekString(date) {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
  );
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

function updateDailySummary(data) {
  const totalSales = data.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = data.length;
  const averagePerSale =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  document.getElementById("dailyTotal").textContent = `₱${totalSales.toFixed(
    2
  )}`;
  document.getElementById("dailyTransactions").textContent = totalTransactions;
  document.getElementById(
    "dailyAverage"
  ).textContent = `₱${averagePerSale.toFixed(2)}`;
}

function updateDailyBreakdown(data) {
  const dailyTableBody = document.getElementById("dailyTableBody");
  dailyTableBody.innerHTML = "";

  const productGroups = {};
  data.forEach((sale) => {
    if (!productGroups[sale.product]) {
      productGroups[sale.product] = {
        quantity: 0,
        price: sale.price,
        total: 0,
      };
    }
    productGroups[sale.product].quantity += sale.quantity;
    productGroups[sale.product].total += sale.total;
  });

  Object.entries(productGroups).forEach(([product, data]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${product}</td>
                    <td>${data.quantity}</td>
                    <td>₱${data.price.toFixed(2)}</td>
                    <td>₱${data.total.toFixed(2)}</td>
                `;
    dailyTableBody.appendChild(row);
  });
}

function updateWeeklySummary(data, weekStart) {
  const totalSales = data.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = data.length;
  const dailyAverage = totalSales / 7;

  document.getElementById("weeklyTotal").textContent = `₱${totalSales.toFixed(
    2
  )}`;
  document.getElementById("weeklyTransactions").textContent = totalTransactions;
  document.getElementById(
    "weeklyDailyAverage"
  ).textContent = `₱${dailyAverage.toFixed(2)}`;
}

function updateWeeklyBreakdown(data, weekStart) {
  const weeklyTableBody = document.getElementById("weeklyTableBody");
  weeklyTableBody.innerHTML = "";

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dailyData = {};

  days.forEach((day) => {
    dailyData[day] = { total: 0, transactions: 0 };
  });

  data.forEach((sale) => {
    const day = new Date(sale.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dailyData[day].total += sale.total;
    dailyData[day].transactions += 1;
  });

  days.forEach((day) => {
    const dayData = dailyData[day];
    const avgPerTransaction =
      dayData.transactions > 0 ? dayData.total / dayData.transactions : 0;

    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${day}</td>
                    <td>₱${dayData.total.toFixed(2)}</td>
                    <td>${dayData.transactions}</td>
                    <td>₱${avgPerTransaction.toFixed(2)}</td>
                `;
    weeklyTableBody.appendChild(row);
  });
}

window.addEventListener("load", () => {
  let total = 0;
  document.querySelectorAll(".row-total").forEach((cell) => {
    total += parseFloat(cell.textContent.replace(/[₱,]/g, "")) || 0;
  });
  document.getElementById("grandTotal").textContent = `₱${total.toFixed(2)}`;
});

/* ==============================
   Client-side Pagination for Sales Tables
   =============================== */
(function() {
  const detailedTable = document.getElementById('detailed-sales-table');
  const detailedPaginationContainer = document.getElementById('detailed-pagination');
  const dailyTableBody = document.getElementById('dailyTableBody');
  const dailyPaginationContainer = document.getElementById('daily-pagination');

  if (!detailedTable || !detailedPaginationContainer || !dailyTableBody || !dailyPaginationContainer) return;

  const rowsPerPage = 10;
  let detailedCurrentPage = 1;
  let dailyCurrentPage = 1;

  // ===== DETAILED SALES TABLE PAGINATION =====
  function getDetailedAllRows() {
    return Array.from(detailedTable.querySelectorAll('tbody tr'));
  }

  function showDetailedPage(page) {
    const allRows = getDetailedAllRows();
    allRows.forEach(r => r.style.display = 'none');
    
    const total = allRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    detailedCurrentPage = page;

    const start = (detailedCurrentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    allRows.slice(start, end).forEach(r => r.style.display = '');

    renderDetailedPaginationControls(totalPages);
  }

  function renderDetailedPaginationControls(totalPages) {
    detailedPaginationContainer.innerHTML = '';
    const pager = document.createElement('div');
    pager.className = 'pagination';

    const prev = document.createElement('button');
    prev.className = 'page-prev';
    prev.textContent = 'Prev';
    prev.disabled = detailedCurrentPage === 1;
    prev.addEventListener('click', () => showDetailedPage(detailedCurrentPage - 1));
    pager.appendChild(prev);

    // Page number buttons
    const maxButtons = 7;
    let startPage = Math.max(1, detailedCurrentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      const btn = document.createElement('button');
      btn.textContent = '1';
      btn.addEventListener('click', () => showDetailedPage(1));
      pager.appendChild(btn);
      if (startPage > 2) {
        const ell = document.createElement('span');
        ell.className = 'ellipsis';
        ell.textContent = '…';
        pager.appendChild(ell);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      btn.textContent = String(p);
      if (p === detailedCurrentPage) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => showDetailedPage(p));
      pager.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ell = document.createElement('span');
        ell.className = 'ellipsis';
        ell.textContent = '…';
        pager.appendChild(ell);
      }
      const btn = document.createElement('button');
      btn.textContent = String(totalPages);
      btn.addEventListener('click', () => showDetailedPage(totalPages));
      pager.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-next';
    next.textContent = 'Next';
    next.disabled = detailedCurrentPage === totalPages;
    next.addEventListener('click', () => showDetailedPage(detailedCurrentPage + 1));
    pager.appendChild(next);

    detailedPaginationContainer.appendChild(pager);
  }

  // ===== DAILY BREAKDOWN TABLE PAGINATION =====
  function getDailyAllRows() {
    return Array.from(dailyTableBody.querySelectorAll('tr'));
  }

  function showDailyPage(page) {
    const allRows = getDailyAllRows();
    allRows.forEach(r => r.style.display = 'none');
    
    const total = allRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    dailyCurrentPage = page;

    const start = (dailyCurrentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    allRows.slice(start, end).forEach(r => r.style.display = '');

    renderDailyPaginationControls(totalPages);
  }

  function renderDailyPaginationControls(totalPages) {
    dailyPaginationContainer.innerHTML = '';
    const pager = document.createElement('div');
    pager.className = 'pagination';

    const prev = document.createElement('button');
    prev.className = 'page-prev';
    prev.textContent = 'Prev';
    prev.disabled = dailyCurrentPage === 1;
    prev.addEventListener('click', () => showDailyPage(dailyCurrentPage - 1));
    pager.appendChild(prev);

    // Page number buttons
    const maxButtons = 7;
    let startPage = Math.max(1, dailyCurrentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      const btn = document.createElement('button');
      btn.textContent = '1';
      btn.addEventListener('click', () => showDailyPage(1));
      pager.appendChild(btn);
      if (startPage > 2) {
        const ell = document.createElement('span');
        ell.className = 'ellipsis';
        ell.textContent = '…';
        pager.appendChild(ell);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      btn.textContent = String(p);
      if (p === dailyCurrentPage) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => showDailyPage(p));
      pager.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ell = document.createElement('span');
        ell.className = 'ellipsis';
        ell.textContent = '…';
        pager.appendChild(ell);
      }
      const btn = document.createElement('button');
      btn.textContent = String(totalPages);
      btn.addEventListener('click', () => showDailyPage(totalPages));
      pager.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-next';
    next.textContent = 'Next';
    next.disabled = dailyCurrentPage === totalPages;
    next.addEventListener('click', () => showDailyPage(dailyCurrentPage + 1));
    pager.appendChild(next);

    dailyPaginationContainer.appendChild(pager);
  }

  // Initial pagination on page load
  document.addEventListener('DOMContentLoaded', () => {
    showDetailedPage(1);
    showDailyPage(1);
  });

  // Recalculate daily pagination whenever daily breakdown is updated
  const originalUpdateDailyBreakdown = window.updateDailyBreakdown;
  if (typeof originalUpdateDailyBreakdown === 'function') {
    window.updateDailyBreakdown = function(data) {
      originalUpdateDailyBreakdown.call(this, data);
      dailyCurrentPage = 1;
      showDailyPage(1);
    };
  }

  // Attempt immediate run in case script is deferred and DOM already parsed
  setTimeout(() => {
    if (!document.readyState || document.readyState !== 'loading') {
      showDetailedPage(1);
      showDailyPage(1);
    }
  }, 50);

})();
