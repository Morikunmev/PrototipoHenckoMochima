const ui = {
  // Vistas principales
  loginView: document.getElementById("login-view"),
  dashboardView: document.getElementById("dashboard-view"),

  // Elementos del Dashboard
  productTableBody: document.getElementById("product-table-body"),
  statsCardsContainer: document.getElementById("stats-cards"),

  // Elementos del Modal
  modal: document.getElementById("product-modal"),
  modalTitle: document.getElementById("modal-title"),
  productIdInput: document.getElementById("product-id"),
  productForm: document.getElementById("product-form"),

  showView: (view) => {
    if (ui.loginView) ui.loginView.style.display = "none";
    if (ui.dashboardView) ui.dashboardView.style.display = "none";
    if (view) {
      view.style.display = view === ui.loginView ? "flex" : "block";
    }
  },

  renderTable: (products) => {
    ui.productTableBody.innerHTML = ""; // Limpiar tabla
    if (!products || products.length === 0) {
      ui.productTableBody.innerHTML =
        '<tr><td colspan="5">No hay productos. ¡Importa un archivo Excel para comenzar!</td></tr>';
      return;
    }
    products.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${p.sku || "N/A"}</td>
                <td>${p.name || "Sin nombre"}</td>
                <td>${p.quantity || 0}</td>
                <td>${ui.formatCLP(Number(p.price) || 0)}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${
                      p.id || "unknown"
                    }">Editar</button>
                    <button class="btn-action btn-delete" data-id="${
                      p.id || "unknown"
                    }">Eliminar</button>
                </td>
            `;
      ui.productTableBody.appendChild(row);
    });
  },

  // Función para formatear moneda a CLP
  formatCLP: (value) => {
    const formattedValue = Math.round(value).toLocaleString("es-CL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formattedValue} CLP`;
  },

  renderStats: (products) => {
    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    );
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
      0
    );

    ui.statsCardsContainer.innerHTML = `
            <div class="stat-card"><h3>Total de Productos</h3><p>${totalProducts}</p></div>
            <div class="stat-card"><h3>Stock Total</h3><p>${totalStock} unidades</p></div>
            <div class="stat-card"><h3>Valor del Inventario</h3><p>${ui.formatCLP(
              totalValue
            )}</p></div>
        `;
  },

  openModal: (product = null) => {
    ui.productForm.reset();
    if (product) {
      ui.modalTitle.textContent = "Editar Producto";
      ui.productIdInput.value = product.id;
      document.getElementById("product-sku").value = product.sku;
      document.getElementById("product-name").value = product.name;
      document.getElementById("product-quantity").value = product.quantity;
      document.getElementById("product-price").value = product.price;
    } else {
      ui.modalTitle.textContent = "Añadir Nuevo Producto";
      ui.productIdInput.value = "";
    }
    ui.modal.style.display = "flex";
  },

  closeModal: () => {
    ui.modal.style.display = "none";
  },

  // Variables para los gráficos
  stockChart: null,
  valueChart: null,

  renderCharts: (products) => {
    // Verificar si Chart.js está disponible
    if (typeof Chart === "undefined") {
      console.warn(
        "Chart.js no está disponible. Los gráficos no se mostrarán."
      );
      // Mostrar mensaje en lugar de gráficos
      document.getElementById("stockChart").style.display = "none";
      document.getElementById("valueChart").style.display = "none";
      return;
    }

    // Destruir gráficos existentes si existen
    if (ui.stockChart) {
      ui.stockChart.destroy();
    }
    if (ui.valueChart) {
      ui.valueChart.destroy();
    }

    if (products.length === 0) {
      // Mostrar mensaje cuando no hay productos
      document.getElementById("stockChart").style.display = "none";
      document.getElementById("valueChart").style.display = "none";
      return;
    }

    // Mostrar los canvas
    document.getElementById("stockChart").style.display = "block";
    document.getElementById("valueChart").style.display = "block";

    // Preparar datos para los gráficos
    const labels = products.map((p) => {
      const name = p.name || "Sin nombre";
      return name.length > 15 ? name.substring(0, 15) + "..." : name;
    });
    const stockData = products.map((p) => Number(p.quantity || 0));
    const valueData = products.map(
      (p) => Number(p.quantity || 0) * Number(p.price || 0)
    );

    // Colores inspirados en Pokémon y Dragon Ball
    const colors = [
      "#64B5F6", // Azul Blastoise
      "#FF7043", // Naranja Charizard
      "#8BC34A", // Verde Venusaur
      "#9C27B0", // Púrpura Venomoth
      "#A1887F", // Marrón Diglett
      "#EF5350", // Rojo Dragon Ball
      "#00BCD4", // Cian Dragon Ball
      "#FF9800", // Naranja Dragon Ball
      "#4CAF50", // Verde Dragon Ball
      "#E91E63", // Rosa Dragon Ball
    ];

    // Gráfico de Stock
    const stockCtx = document.getElementById("stockChart").getContext("2d");
    ui.stockChart = new Chart(stockCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Cantidad en Stock",
            data: stockData,
            backgroundColor: colors.slice(0, products.length),
            borderColor: colors.slice(0, products.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: "white",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    });

    // Gráfico de Valor
    const valueCtx = document.getElementById("valueChart").getContext("2d");
    ui.valueChart = new Chart(valueCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Valor Total ($)",
            data: valueData,
            backgroundColor: colors
              .slice(0, products.length)
              .map((color) => color + "80"),
            borderColor: colors.slice(0, products.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: "white",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "$" + value.toFixed(2);
              },
              color: "white",
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    });
  },

  // Funciones del Modal
  openModal: (product = null) => {
    console.log("openModal llamado");
    console.log("ui.modal:", ui.modal);
    console.log("ui.modalTitle:", ui.modalTitle);

    if (!ui.modal) {
      console.error("Modal no encontrado");
      return;
    }

    if (product) {
      ui.modalTitle.textContent = "Editar Producto";
      ui.productIdInput.value = product.id;
      document.getElementById("product-sku").value = product.sku;
      document.getElementById("product-name").value = product.name;
      document.getElementById("product-quantity").value = product.quantity;
      document.getElementById("product-price").value = product.price;
    } else {
      ui.modalTitle.textContent = "Añadir Nuevo Producto";
      ui.productIdInput.value = "";
      document.getElementById("product-sku").value = "";
      document.getElementById("product-name").value = "";
      document.getElementById("product-quantity").value = "";
      document.getElementById("product-price").value = "";
    }
    ui.modal.style.display = "flex";
    console.log("Modal mostrado");
  },

  closeModal: () => {
    ui.modal.style.display = "none";
    ui.productForm.reset();
  },

  // Renderizar Dashboard de KPIs
  renderKPIs: (products) => {
    const kpiContainer = document.getElementById("kpi-cards");
    if (!kpiContainer) return;

    const kpis = kpiDashboard.calculateKPIs(products);
    const healthStatus = kpis.health.status;
    const healthScore = kpis.health.score;
    const healthColor =
      healthStatus === "excelente"
        ? "#4CAF50"
        : healthStatus === "bueno"
        ? "#8BC34A"
        : healthStatus === "regular"
        ? "#FF9800"
        : "#F44336";

    kpiContainer.innerHTML = `
      <div class="kpi-card">
        <h4>Salud del Inventario</h4>
        <div class="kpi-value" style="color: ${healthColor}; font-size: 2em; font-weight: bold;">
          ${healthScore}/100
        </div>
        <p style="color: ${healthColor};">${healthStatus.toUpperCase()}</p>
      </div>
      <div class="kpi-card">
        <h4>Total Alertas</h4>
        <div class="kpi-value">${kpis.alerts.totalAlerts}</div>
        <p>${kpis.alerts.criticalStock} críticas</p>
      </div>
      <div class="kpi-card">
        <h4>Ajuste de Precios</h4>
        <div class="kpi-value">${kpis.pricing.productsNeedingPriceAdjustment}</div>
        <p>Potencial: ${ui.formatCLP(kpis.pricing.potentialRevenueIncrease)}</p>
      </div>
    `;
  },

  // Renderizar Alertas
  renderAlerts: (products) => {
    const alertsContainer = document.getElementById("alerts-container");
    if (!alertsContainer) return;

    const alerts = alertService.getAlertsSummary(products);

    let alertsHTML = "";

    if (alerts.outOfStock.count > 0) {
      alertsHTML += `
        <div class="alert-item critical">
          <h4>⚠️ Sin Stock (${alerts.outOfStock.count})</h4>
          <ul>
            ${alerts.outOfStock.products
              .slice(0, 5)
              .map((p) => `<li>${p.name || p.sku}</li>`)
              .join("")}
            ${alerts.outOfStock.count > 5 ? `<li>... y ${alerts.outOfStock.count - 5} más</li>` : ""}
          </ul>
        </div>
      `;
    }

    if (alerts.criticalStock.count > 0) {
      alertsHTML += `
        <div class="alert-item warning">
          <h4>🔴 Stock Crítico (${alerts.criticalStock.count})</h4>
          <ul>
            ${alerts.criticalStock.products
              .slice(0, 5)
              .map((p) => `<li>${p.name || p.sku} - ${p.quantity} unidades</li>`)
              .join("")}
            ${alerts.criticalStock.count > 5 ? `<li>... y ${alerts.criticalStock.count - 5} más</li>` : ""}
          </ul>
        </div>
      `;
    }

    if (alerts.lowStock.count > 0) {
      alertsHTML += `
        <div class="alert-item info">
          <h4>🟡 Stock Bajo (${alerts.lowStock.count})</h4>
          <ul>
            ${alerts.lowStock.products
              .slice(0, 5)
              .map((p) => `<li>${p.name || p.sku} - ${p.quantity} unidades</li>`)
              .join("")}
            ${alerts.lowStock.count > 5 ? `<li>... y ${alerts.lowStock.count - 5} más</li>` : ""}
          </ul>
        </div>
      `;
    }

    if (alerts.totalAlerts === 0) {
      alertsHTML = '<p style="color: #4CAF50;">✅ No hay alertas. Todo en orden.</p>';
    }

    alertsContainer.innerHTML = alertsHTML;
  },

  // Renderizar Motor de Precios
  renderPricing: (products) => {
    const pricingContainer = document.getElementById("pricing-container");
    if (!pricingContainer) return;

    const pricing = pricingEngine.getPricingSummary(products);

    let html = `
      <div class="pricing-summary">
        <p><strong>${pricing.productsNeedingIncrease.count}</strong> productos necesitan aumento de precio</p>
        <p><strong>${pricing.productsNeedingDecrease.count}</strong> productos necesitan reducción de precio</p>
        <p><strong>${pricing.productsWithAdequatePrice.count}</strong> productos con precio adecuado</p>
        <p style="color: #4CAF50;"><strong>Potencial de ingresos:</strong> ${ui.formatCLP(pricing.totalPotentialRevenue)}</p>
      </div>
    `;

    if (pricing.productsNeedingIncrease.count > 0) {
      html += `
        <div class="pricing-recommendations">
          <h4>Productos que necesitan aumento:</h4>
          <ul>
            ${pricing.productsNeedingIncrease.products
              .slice(0, 5)
              .map(
                (p) =>
                  `<li>
                    <strong>${p.productName}</strong><br>
                    Precio actual: ${ui.formatCLP(p.currentPrice)} | 
                    Recomendado: ${ui.formatCLP(p.recommendedPrice)}<br>
                    <small>Diferencia: ${ui.formatCLP(p.priceDifference)}</small>
                  </li>`
              )
              .join("")}
            ${pricing.productsNeedingIncrease.count > 5 ? `<li>... y ${pricing.productsNeedingIncrease.count - 5} más</li>` : ""}
          </ul>
        </div>
      `;
    }

    pricingContainer.innerHTML = html;
  },
};
