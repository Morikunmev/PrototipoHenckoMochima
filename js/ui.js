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
    ui.loginView.style.display = "none";
    ui.dashboardView.style.display = "none";
    view.style.display = view === ui.loginView ? "flex" : "block";
  },

  renderTable: (products) => {
    ui.productTableBody.innerHTML = ""; // Limpiar tabla
    if (products.length === 0) {
      ui.productTableBody.innerHTML =
        '<tr><td colspan="5">No hay productos. ¡Importa un archivo Excel para comenzar!</td></tr>';
      return;
    }
    products.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${p.sku}</td>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>${ui.formatCLP(Number(p.price))}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${
                      p.id
                    }">Editar</button>
                    <button class="btn-action btn-delete" data-id="${
                      p.id
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
    const labels = products.map((p) =>
      p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name
    );
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
};
