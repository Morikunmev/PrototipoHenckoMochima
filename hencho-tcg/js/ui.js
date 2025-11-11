const ui = {
  // Vistas principales
  loginView: document.getElementById("login-view"),
  dashboardView: document.getElementById("dashboard-view"),

  // Elementos del Dashboard
  productTableBody: document.getElementById("product-table-body"),
  statsCardsContainer: document.getElementById("stats-cards"),
  searchInput: document.getElementById("search-products"),
  searchResultsCount: document.getElementById("search-results-count"),
  
  // Almacenar todos los productos (sin filtrar)
  allProducts: [],

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

  renderTable: (products, filteredProducts = null) => {
    // Guardar todos los productos para la búsqueda
    if (products) {
      ui.allProducts = products;
    }
    
    // Usar productos filtrados si se proporcionan, sino usar todos
    const productsToRender = filteredProducts !== null ? filteredProducts : (products || ui.allProducts);
    
    const renderTimer = performanceLogger.startTimer(
      "Renderizar tabla",
      `${productsToRender?.length || 0} productos`
    );

    ui.productTableBody.innerHTML = ""; // Limpiar tabla
    if (!productsToRender || productsToRender.length === 0) {
      ui.productTableBody.innerHTML =
        '<tr><td colspan="9">No hay productos. ¡Importa un archivo Excel para comenzar!</td></tr>';
      performanceLogger.endTimer(renderTimer, "Tabla vacía renderizada");
      // Actualizar contador de resultados
      if (ui.searchResultsCount) {
        ui.searchResultsCount.textContent = "";
      }
      return;
    }

    console.log(`📋 [UI] Renderizando tabla con ${productsToRender.length} productos`);

    productsToRender.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${p.sku || "N/A"}</td>
                <td>${p.name || "Sin nombre"}</td>
                <td>
                    <div class="quantity-controls">
                        <button class="btn-quantity btn-decrease" data-id="${
                          p.id || "unknown"
                        }" title="Disminuir cantidad">−</button>
                        <span class="quantity-value">${p.quantity || 0}</span>
                        <button class="btn-quantity btn-increase" data-id="${
                          p.id || "unknown"
                        }" title="Aumentar cantidad">+</button>
                    </div>
                </td>
                <td>${p.cost ? ui.formatCLP(Number(p.cost)) : '<span style="color: rgba(255,255,255,0.5);">N/A</span>'}</td>
                <td>${ui.formatCLP(Number(p.price) || 0)}</td>
                <td>
                    ${(() => {
                      if (typeof pricingEngine !== "undefined") {
                        const recommendation = pricingEngine.calculateRecommendedPrice(p);
                        const category = recommendation.category;
                        const categoryNames = {
                          premium: 'Premium',
                          standard: 'Standard',
                          basic: 'Basic'
                        };
                        const categoryColors = {
                          premium: '#FFD700',
                          standard: '#4CAF50',
                          basic: '#2196F3'
                        };
                        return `
                          <span style="color: ${categoryColors[category] || '#fff'}; font-weight: bold; text-transform: uppercase; font-size: 11px;">
                            ${categoryNames[category] || category}
                          </span>
                        `;
                      }
                      return '<span style="color: rgba(255,255,255,0.5);">N/A</span>';
                    })()}
                </td>
                <td>
                    ${(() => {
                      if (typeof pricingEngine !== "undefined") {
                        const recommendation = pricingEngine.calculateRecommendedPrice(p);
                        const margin = recommendation.marginPercentage;
                        const currentMargin = recommendation.currentMargin;
                        if (currentMargin !== null) {
                          const marginColor = currentMargin >= margin * 0.9 ? '#4CAF50' : (currentMargin >= margin * 0.7 ? '#FFA726' : '#F44336');
                          return `
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                              <span style="color: ${marginColor}; font-weight: bold; font-size: 12px;">
                                ${currentMargin}%
                              </span>
                              <span style="color: rgba(255,255,255,0.5); font-size: 10px;">
                                (Recomendado: ${margin}%)
                              </span>
                            </div>
                          `;
                        }
                        return `
                          <span style="color: #4CAF50; font-weight: bold; font-size: 12px;">
                            ${margin}%
                          </span>
                        `;
                      }
                      return '<span style="color: rgba(255,255,255,0.5);">N/A</span>';
                    })()}
                </td>
                <td>
                    ${(() => {
                      if (typeof pricingEngine !== "undefined") {
                        const recommendation = pricingEngine.calculateRecommendedPrice(p);
                        const recommendedPrice = recommendation.recommendedPrice;
                        const isDifferent = Math.abs(Number(p.price || 0) - recommendedPrice) > 0.01;
                        return `
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: ${isDifferent ? '#FFA726' : '#4CAF50'};">
                              ${ui.formatCLP(recommendedPrice)}
                            </span>
                            ${isDifferent ? `
                              <button class="btn-action btn-apply-price" data-id="${p.id || "unknown"}" 
                                      title="Aplicar precio recomendado" 
                                      style="padding: 6px 12px; font-size: 11px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);">
                                Aplicar
                              </button>
                            ` : '<span style="color: #4CAF50; font-size: 14px; font-weight: bold;">✓</span>'}
                          </div>
                        `;
                      }
                      return '<span style="color: rgba(255,255,255,0.5);">N/A</span>';
                    })()}
                </td>
                <td style="white-space: nowrap;">
                    <button class="btn-action btn-sell" data-id="${
                      p.id || "unknown"
                    }" title="Vender 1 unidad">Vender</button>
                    <button class="btn-action btn-edit" data-id="${
                      p.id || "unknown"
                    }" title="Editar producto">Editar</button>
                    <button class="btn-action btn-delete" data-id="${
                      p.id || "unknown"
                    }" title="Eliminar producto">Eliminar</button>
                </td>
            `;
      ui.productTableBody.appendChild(row);
    });

    performanceLogger.endTimer(
      renderTimer,
      `${productsToRender.length} filas renderizadas`
    );
    
    // Actualizar contador de resultados de búsqueda
    if (ui.searchResultsCount && ui.searchInput && ui.searchInput.value.trim()) {
      const totalProducts = ui.allProducts.length;
      const filteredCount = productsToRender.length;
      if (filteredCount < totalProducts) {
        ui.searchResultsCount.textContent = `Mostrando ${filteredCount} de ${totalProducts} productos`;
      } else {
        ui.searchResultsCount.textContent = "";
      }
    } else if (ui.searchResultsCount) {
      ui.searchResultsCount.textContent = "";
    }
  },

  filterProducts: (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      // Si no hay término de búsqueda, mostrar todos los productos
      ui.renderTable(ui.allProducts, null);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = ui.allProducts.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const sku = (product.sku || "").toLowerCase();
      const price = String(product.price || 0);
      const quantity = String(product.quantity || 0);
      
      return (
        name.includes(term) ||
        sku.includes(term) ||
        price.includes(term) ||
        quantity.includes(term)
      );
    });

    console.log(`🔍 [UI] Búsqueda: "${term}" - ${filtered.length} resultados`);
    ui.renderTable(null, filtered);
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
    const statsTimer = performanceLogger.startTimer(
      "Renderizar estadísticas",
      `${products?.length || 0} productos`
    );

    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    );
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
      0
    );

    console.log(
      `📊 [UI] Calculando estadísticas: ${totalProducts} productos, ${totalStock} stock, ${ui.formatCLP(
        totalValue
      )} valor`
    );

    ui.statsCardsContainer.innerHTML = `
            <div class="stat-card"><h3>Total de Productos</h3><p>${totalProducts}</p></div>
            <div class="stat-card"><h3>Stock Total</h3><p>${totalStock} unidades</p></div>
            <div class="stat-card"><h3>Valor del Inventario</h3><p>${ui.formatCLP(
              totalValue
            )}</p></div>
        `;

    // Actualizar métricas financieras con datos reales
    ui.updateFinancialStats();

    performanceLogger.endTimer(
      statsTimer,
      `Estadísticas calculadas: ${totalProducts} productos`
    );
  },

  updateFinancialStats: () => {
    // Calcular ingresos netos (total de ventas)
    const totalRevenue = typeof salesService !== "undefined" 
      ? salesService.getTotalSales() 
      : 0;
    
    // Ganancia neta (por ahora igual a ingresos, ya que no tenemos costos)
    // En el futuro se podría restar costos si se implementan
    const netProfit = totalRevenue;
    
    // Calcular tendencia mensual
    let monthlyTrend = 0;
    if (typeof salesService !== "undefined") {
      const sales = salesService.getSales();
      if (sales.length > 0) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Ventas del mes actual
        const currentMonthSales = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate.getMonth() === currentMonth && 
                 saleDate.getFullYear() === currentYear;
        });
        const currentMonthTotal = currentMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);
        
        // Ventas del mes anterior
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const previousMonthSales = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate.getMonth() === previousMonth && 
                 saleDate.getFullYear() === previousYear;
        });
        const previousMonthTotal = previousMonthSales.reduce((sum, sale) => sum + sale.totalValue, 0);
        
        // Calcular porcentaje de cambio
        if (previousMonthTotal > 0) {
          monthlyTrend = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal * 100);
        } else if (currentMonthTotal > 0) {
          monthlyTrend = 100; // Si no había ventas el mes anterior, es 100% de crecimiento
        }
      }
    }
    
    // Actualizar elementos del DOM
    const netProfitEl = document.getElementById("net-profit");
    const netRevenueEl = document.getElementById("net-revenue");
    const monthlyTrendEl = document.getElementById("monthly-trend");
    
    if (netProfitEl) {
      netProfitEl.textContent = ui.formatCLP(netProfit);
    }
    if (netRevenueEl) {
      netRevenueEl.textContent = ui.formatCLP(totalRevenue);
    }
    if (monthlyTrendEl) {
      const trendSign = monthlyTrend >= 0 ? '+' : '';
      const trendColor = monthlyTrend >= 0 ? '#4CAF50' : '#EF5350';
      monthlyTrendEl.textContent = `${trendSign}${monthlyTrend.toFixed(1)}%`;
      monthlyTrendEl.style.color = trendColor;
    }
  },

  updateOrderStatus: () => {
    // Como no tenemos un sistema de pedidos real, usamos las ventas como base
    // Las ventas completadas = todas las ventas realizadas
    // En proceso = 0 (no hay pedidos pendientes en este sistema)
    // Cancelados = 0 (no hay cancelaciones en este sistema)
    
    const sales = typeof salesService !== "undefined" ? salesService.getSales() : [];
    const completedOrders = sales.length;
    
    // Calcular tendencias comparando últimos 7 días vs los 7 días anteriores
    let completedTrend = 0;
    if (sales.length > 0) {
      const now = new Date();
      const last7Days = [];
      const previous7Days = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('es-CL');
        last7Days.push(dateStr);
      }
      
      for (let i = 7; i < 14; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('es-CL');
        previous7Days.push(dateStr);
      }
      
      const last7DaysSales = sales.filter(sale => last7Days.includes(sale.date));
      const previous7DaysSales = sales.filter(sale => previous7Days.includes(sale.date));
      
      if (previous7DaysSales.length > 0) {
        completedTrend = ((last7DaysSales.length - previous7DaysSales.length) / previous7DaysSales.length * 100);
      } else if (last7DaysSales.length > 0) {
        completedTrend = 100;
      }
    }
    
    // Actualizar elementos del DOM
    const completedEl = document.getElementById("completed-orders");
    const completedTrendEl = document.getElementById("completed-trend");
    const processingEl = document.getElementById("processing-orders");
    const processingTrendEl = document.getElementById("processing-trend");
    const cancelledEl = document.getElementById("cancelled-orders");
    const cancelledTrendEl = document.getElementById("cancelled-trend");
    
    if (completedEl) {
      completedEl.textContent = completedOrders.toLocaleString('es-CL');
    }
    if (completedTrendEl) {
      const trendSign = completedTrend >= 0 ? '+' : '';
      const trendClass = completedTrend >= 0 ? 'positive' : 'negative';
      completedTrendEl.textContent = `${trendSign}${Math.abs(completedTrend).toFixed(1)}%`;
      completedTrendEl.className = `order-trend ${trendClass}`;
    }
    if (processingEl) {
      processingEl.textContent = '0'; // No hay pedidos en proceso en este sistema
    }
    if (processingTrendEl) {
      processingTrendEl.textContent = '0%';
      processingTrendEl.className = 'order-trend';
    }
    if (cancelledEl) {
      cancelledEl.textContent = '0'; // No hay cancelaciones en este sistema
    }
    if (cancelledTrendEl) {
      cancelledTrendEl.textContent = '0%';
      cancelledTrendEl.className = 'order-trend';
    }
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
    const chartsTimer = performanceLogger.startTimer(
      "Renderizar gráfico",
      `${products?.length || 0} productos`
    );

    // Verificar si Chart.js está disponible
    if (typeof Chart === "undefined") {
      console.warn(
        "⚠️ [UI] Chart.js no está disponible. Los gráficos no se mostrarán."
      );
      // Mostrar mensaje en lugar de gráficos
      document.getElementById("stockChart").style.display = "none";
      document.getElementById("valueChart").style.display = "none";
      performanceLogger.endTimer(chartsTimer, "Chart.js no disponible");
      return;
    }

    console.log(
      `📈 [UI] Renderizando gráficos para ${products.length} productos`
    );

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
      performanceLogger.endTimer(chartsTimer, "Sin productos para graficar");
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

    performanceLogger.endTimer(
      chartsTimer,
      `2 gráficos renderizados para ${products.length} productos`
    );
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
        ${healthScore < 60 ? `
          <button id="improve-health-btn" class="btn btn-primary" style="margin-top: 10px; width: 100%; font-size: 0.9em; padding: 8px;">
            🔧 Mejorar Salud del Inventario
          </button>
        ` : ''}
      </div>
      <div class="kpi-card">
        <h4>Total Alertas</h4>
        <div class="kpi-value">${kpis.alerts.totalAlerts}</div>
        <p>${kpis.alerts.criticalStock} críticas</p>
      </div>
      <div class="kpi-card">
        <h4>Reabastecimiento</h4>
        <div class="kpi-value">${kpis.anticipation.productsNeedingRestock}</div>
        <p>${kpis.anticipation.urgentProducts} urgentes</p>
      </div>
      <div class="kpi-card">
        <h4>Ajuste de Precios</h4>
        <div class="kpi-value">${
          kpis.pricing.productsNeedingPriceAdjustment
        }</div>
        <p>Potencial: ${ui.formatCLP(kpis.pricing.potentialRevenueIncrease)}</p>
      </div>
    `;
  },

  // Renderizar Alertas
  renderAlerts: (products) => {
    const alertsContainer = document.getElementById("alerts-container");
    if (!alertsContainer) {
      console.warn("⚠️ [UI] No se encontró el contenedor de alertas");
      return;
    }

    if (typeof alertService === "undefined") {
      console.warn("⚠️ [UI] alertService no está disponible");
      alertsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Servicio de alertas no disponible</p>';
      return;
    }

    if (!products || products.length === 0) {
      alertsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No hay productos para verificar</p>';
      return;
    }

    const alerts = alertService.getAlertsSummary(products);
    console.log("📊 [UI] Alertas calculadas:", alerts);

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
            ${
              alerts.outOfStock.count > 5
                ? `<li>... y ${alerts.outOfStock.count - 5} más</li>`
                : ""
            }
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
              .map(
                (p) => `<li>${p.name || p.sku} - ${p.quantity} unidades</li>`
              )
              .join("")}
            ${
              alerts.criticalStock.count > 5
                ? `<li>... y ${alerts.criticalStock.count - 5} más</li>`
                : ""
            }
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
              .map(
                (p) => `<li>${p.name || p.sku} - ${p.quantity} unidades</li>`
              )
              .join("")}
            ${
              alerts.lowStock.count > 5
                ? `<li>... y ${alerts.lowStock.count - 5} más</li>`
                : ""
            }
          </ul>
        </div>
      `;
    }

    if (alerts.totalAlerts === 0) {
      alertsHTML =
        '<p style="color: #4CAF50;">✅ No hay alertas. Todo en orden.</p>';
    }

    alertsContainer.innerHTML = alertsHTML;
  },

  // Renderizar Anticipación
  renderAnticipation: (products) => {
    const anticipationContainer = document.getElementById(
      "anticipation-container"
    );
    if (!anticipationContainer) return;

    const anticipation = anticipationService.getAnticipationSummary(products);

    if (anticipation.totalProductsNeedingRestock === 0) {
      anticipationContainer.innerHTML =
        '<p style="color: #4CAF50;">✅ No se necesita reabastecimiento en los próximos 7 días.</p>';
      return;
    }

    let html = `
      <div class="anticipation-summary">
        <p><strong>${
          anticipation.totalProductsNeedingRestock
        }</strong> productos necesitan reabastecimiento</p>
        <p><strong>${
          anticipation.totalRecommendedOrder
        }</strong> unidades recomendadas</p>
        ${
          anticipation.urgentProducts.count > 0
            ? `<p style="color: #F44336;"><strong>${anticipation.urgentProducts.count}</strong> productos urgentes (≤3 días)</p>`
            : ""
        }
      </div>
      <div class="anticipation-list">
        <h4>Productos que necesitan reabastecimiento:</h4>
        <ul>
          ${anticipation.products
            .slice(0, 10)
            .map(
              (p) =>
                `<li>
                  <strong>${p.name || p.sku}</strong><br>
                  Stock actual: ${p.currentStock} | Necesario: ${
                  p.neededStock
                } | 
                  Recomendado: ${p.recommendedOrder} unidades<br>
                  <small>Días hasta quedar sin stock: ${
                    p.daysUntilOutOfStock
                  }</small>
                </li>`
            )
            .join("")}
          ${
            anticipation.products.length > 10
              ? `<li>... y ${anticipation.products.length - 10} más</li>`
              : ""
          }
        </ul>
      </div>
    `;

    anticipationContainer.innerHTML = html;
  },

  // Renderizar Motor de Precios
  renderPricing: (products) => {
    const pricingContainer = document.getElementById("pricing-container");
    if (!pricingContainer) return;

    const pricing = pricingEngine.getPricingSummary(products);

    let html = `
      <div class="pricing-summary">
        <p><strong>${
          pricing.productsNeedingIncrease.count
        }</strong> productos necesitan aumento de precio</p>
        <p><strong>${
          pricing.productsNeedingDecrease.count
        }</strong> productos necesitan reducción de precio</p>
        <p><strong>${
          pricing.productsWithAdequatePrice.count
        }</strong> productos con precio adecuado</p>
        <p style="color: ${pricing.totalPotentialRevenue >= 0 ? '#4CAF50' : '#F44336'};">
          <strong>${pricing.totalPotentialRevenue >= 0 ? 'Potencial de ingresos:' : 'Pérdida potencial:'}</strong> 
          ${ui.formatCLP(pricing.totalPotentialRevenue)}
        </p>
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
                    <small>Diferencia: ${ui.formatCLP(
                      p.priceDifference
                    )}</small>
                  </li>`
              )
              .join("")}
            ${
              pricing.productsNeedingIncrease.count > 5
                ? `<li>... y ${
                    pricing.productsNeedingIncrease.count - 5
                  } más</li>`
                : ""
            }
          </ul>
        </div>
      `;
    }

    pricingContainer.innerHTML = html;
  },

  // Renderizar configuración de precios
  renderPricingConfig: () => {
    const modal = document.getElementById("pricing-config-modal");
    const content = document.getElementById("pricing-config-content");
    if (!modal || !content) return;

    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = localStorage.getItem("hencho_tcg_pricing_config");
    let margins = {
      premium: 40,
      standard: 30,
      basic: 25
    };
    let categoryRanges = {
      premium: { min: 50000, max: null },
      standard: { min: 25000, max: 50000 },
      basic: { min: 0, max: 25000 }
    };
    
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.margins) margins = config.margins;
        if (config.categoryRanges) categoryRanges = config.categoryRanges;
      } catch (e) {
        console.warn("Error al cargar configuración:", e);
      }
    }

    let html = `
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 15px;">Márgenes por Categoría</h3>
        <div style="display: grid; gap: 15px;">
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <label style="min-width: 120px; font-weight: bold;">Premium:</label>
            <input type="number" id="margin-premium" value="${margins.premium}" min="0" max="100" 
                   style="width: 80px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
            <span>%</span>
            <span style="margin-left: 10px; color: rgba(255,255,255,0.6); font-size: 12px;">(Precio > ${categoryRanges.premium.min?.toLocaleString() || '50,000'} CLP)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <label style="min-width: 120px; font-weight: bold;">Standard:</label>
            <input type="number" id="margin-standard" value="${margins.standard}" min="0" max="100" 
                   style="width: 80px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
            <span>%</span>
            <span style="margin-left: 10px; color: rgba(255,255,255,0.6); font-size: 12px;">(Precio ${categoryRanges.standard.min?.toLocaleString() || '25,000'} - ${categoryRanges.standard.max?.toLocaleString() || '50,000'} CLP)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <label style="min-width: 120px; font-weight: bold;">Basic:</label>
            <input type="number" id="margin-basic" value="${margins.basic}" min="0" max="100" 
                   style="width: 80px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
            <span>%</span>
            <span style="margin-left: 10px; color: rgba(255,255,255,0.6); font-size: 12px;">(Precio < ${categoryRanges.basic.max?.toLocaleString() || '25,000'} CLP)</span>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 15px;">Rangos de Categorías</h3>
        <div style="display: grid; gap: 15px;">
          <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Premium (Precio mínimo):</label>
            <input type="number" id="range-premium-min" value="${categoryRanges.premium.min}" min="0" 
                   style="width: 150px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
            <span style="margin-left: 10px; color: rgba(255,255,255,0.6);">CLP</span>
          </div>
          <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Standard (Rango):</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="number" id="range-standard-min" value="${categoryRanges.standard.min}" min="0" 
                     style="width: 150px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
              <span>hasta</span>
              <input type="number" id="range-standard-max" value="${categoryRanges.standard.max}" min="0" 
                     style="width: 150px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
              <span>CLP</span>
            </div>
          </div>
          <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Basic (Precio máximo):</label>
            <input type="number" id="range-basic-max" value="${categoryRanges.basic.max}" min="0" 
                   style="width: 150px; padding: 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white;">
            <span style="margin-left: 10px; color: rgba(255,255,255,0.6);">CLP</span>
            <div style="margin-top: 5px; font-size: 11px; color: rgba(255,255,255,0.6);">
              💡 Puede ser igual al mínimo de Standard para rangos adyacentes
            </div>
          </div>
        </div>
      </div>
      
      <div style="padding: 15px; background: rgba(76, 175, 80, 0.1); border-radius: 5px; border: 1px solid rgba(76, 175, 80, 0.3);">
        <p style="margin: 0; color: #4CAF50;"><strong>💡 Nota:</strong> Los cambios se aplicarán inmediatamente al calcular precios recomendados.</p>
      </div>
    `;

    content.innerHTML = html;
    modal.style.display = "flex";
    
    // Hacer scroll al modal para centrarlo en la vista
    setTimeout(() => {
      modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    
    // Añadir event listeners después de renderizar el contenido
    const saveBtn = document.getElementById("save-pricing-config-btn");
    const cancelBtn = document.getElementById("cancel-pricing-config-btn");
    
    if (saveBtn) {
      // Remover listener anterior si existe
      saveBtn.replaceWith(saveBtn.cloneNode(true));
      const newSaveBtn = document.getElementById("save-pricing-config-btn");
      newSaveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Botón Guardar clickeado desde modal");
        
        // Acceder a la función de guardado desde window.app
        if (window.app && typeof window.app.handleSavePricingConfig === "function") {
          console.log("Ejecutando handleSavePricingConfig");
          window.app.handleSavePricingConfig();
        } else {
          console.error("window.app no está disponible o handleSavePricingConfig no existe");
          console.log("window.app:", window.app);
          alert("❌ Error: No se pudo encontrar la función de guardado. Por favor, recarga la página.");
        }
      });
    }
    
    if (cancelBtn) {
      cancelBtn.replaceWith(cancelBtn.cloneNode(true));
      const newCancelBtn = document.getElementById("cancel-pricing-config-btn");
      newCancelBtn.addEventListener("click", () => {
        ui.closePricingConfig();
      });
    }
  },

  closePricingConfig: () => {
    const modal = document.getElementById("pricing-config-modal");
    if (modal) {
      modal.style.display = "none";
    }
  },

  renderSales: () => {
    const salesContainer = document.getElementById("sales-container");
    if (!salesContainer) return;

    const sales = salesService.getSales();
    const totalSales = salesService.getTotalSales();
    const salesCount = sales.length;
    const today = new Date().toLocaleDateString('es-CL');
    const salesToday = salesService.getSalesByDate(today);
    const totalToday = salesToday.reduce((sum, sale) => sum + sale.totalValue, 0);
    
    // Obtener últimas 5 ventas
    const recentSales = sales.slice(-5).reverse();

    const html = `
      <div class="sales-summary">
        <div class="sales-stat">
          <span class="sales-label">Total Ingresos:</span>
          <span class="sales-value">${ui.formatCLP(totalSales)}</span>
        </div>
        <div class="sales-stat">
          <span class="sales-label">Total Ventas:</span>
          <span class="sales-value">${salesCount}</span>
        </div>
        <div class="sales-stat">
          <span class="sales-label">Ingresos Hoy:</span>
          <span class="sales-value sales-today">${ui.formatCLP(totalToday)}</span>
        </div>
        <div class="sales-stat">
          <span class="sales-label">Ventas Hoy:</span>
          <span class="sales-value">${salesToday.length}</span>
        </div>
      </div>
      <div class="recent-sales">
        <h4 style="margin: 15px 0 10px 0; color: rgba(255,255,255,0.9);">Últimas Ventas:</h4>
        ${recentSales.length > 0 
          ? recentSales.map(sale => `
            <div class="recent-sale-item">
              <div class="sale-product">${sale.productName}</div>
              <div class="sale-details">
                <span class="sale-quantity">${sale.quantity} unidad(es)</span>
                <span class="sale-value">${ui.formatCLP(sale.totalValue)}</span>
              </div>
              <div class="sale-time">${sale.time}</div>
            </div>
          `).join('')
          : '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 10px;">No hay ventas registradas</p>'
        }
      </div>
    `;

    salesContainer.innerHTML = html;
  },

  renderSalesHistory: () => {
    const historyContainer = document.getElementById("sales-history-container");
    if (!historyContainer) return;

    const sales = salesService.getSales();
    const totalSales = salesService.getTotalSales();

    if (sales.length === 0) {
      historyContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">No hay ventas registradas</p>';
      return;
    }

    // Agrupar ventas por fecha
    const salesByDate = {};
    sales.forEach(sale => {
      if (!salesByDate[sale.date]) {
        salesByDate[sale.date] = [];
      }
      salesByDate[sale.date].push(sale);
    });

    const dates = Object.keys(salesByDate).sort((a, b) => {
      return new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'));
    });

    let html = `
      <div style="margin-bottom: 20px; padding: 15px; background: rgba(74, 144, 226, 0.1); border-radius: 8px;">
        <strong>Total General: ${ui.formatCLP(totalSales)}</strong> | 
        <strong>Total de Ventas: ${sales.length}</strong>
      </div>
    `;

    dates.forEach(date => {
      const dateSales = salesByDate[date];
      const dateTotal = dateSales.reduce((sum, sale) => sum + sale.totalValue, 0);
      
      html += `
        <div class="sales-date-group" style="margin-bottom: 25px;">
          <h3 style="color: #4A90E2; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #4A90E2;">
            📅 ${date} - Total: ${ui.formatCLP(dateTotal)} (${dateSales.length} ventas)
          </h3>
          <table class="sales-history-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: rgba(74, 144, 226, 0.2);">
                <th style="padding: 10px; text-align: left;">Hora</th>
                <th style="padding: 10px; text-align: left;">Producto</th>
                <th style="padding: 10px; text-align: left;">SKU</th>
                <th style="padding: 10px; text-align: center;">Cantidad</th>
                <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${dateSales.reverse().map(sale => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <td style="padding: 8px;">${sale.time}</td>
                  <td style="padding: 8px;">${sale.productName}</td>
                  <td style="padding: 8px; color: rgba(255,255,255,0.7);">${sale.productSku}</td>
                  <td style="padding: 8px; text-align: center;">${sale.quantity}</td>
                  <td style="padding: 8px; text-align: right;">${ui.formatCLP(sale.unitPrice)}</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; color: #4CAF50;">${ui.formatCLP(sale.totalValue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    historyContainer.innerHTML = html;
  },

  openSalesModal: () => {
    const modal = document.getElementById("sales-modal");
    if (modal) {
      ui.renderSalesHistory();
      modal.style.display = "flex";
    }
  },

  closeSalesModal: () => {
    const modal = document.getElementById("sales-modal");
    if (modal) {
      modal.style.display = "none";
    }
  },

  renderSalesStats: () => {
    const statsContainer = document.getElementById("sales-stats-container");
    if (!statsContainer) return;

    const sales = salesService.getSales();
    
    if (sales.length === 0) {
      statsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">No hay ventas para mostrar estadísticas</p>';
      return;
    }

    // Calcular estadísticas
    const totalSales = salesService.getTotalSales();
    const salesCount = sales.length;
    const averageSale = totalSales / salesCount;

    // Ventas por día (últimos 7 días)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es-CL');
      last7Days.push({
        date: dateStr,
        sales: salesService.getSalesByDate(dateStr),
        total: 0
      });
    }

    last7Days.forEach(day => {
      day.total = day.sales.reduce((sum, sale) => sum + sale.totalValue, 0);
    });

    // Productos más vendidos
    const productSales = {};
    sales.forEach(sale => {
      const key = sale.productName;
      if (!productSales[key]) {
        productSales[key] = {
          name: sale.productName,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[key].quantity += sale.quantity;
      productSales[key].revenue += sale.totalValue;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Mejor día de ventas
    const bestDay = last7Days.reduce((best, day) => 
      day.total > best.total ? day : best, last7Days[0]);

    // Tendencia (comparar últimos 3 días con los 3 anteriores)
    const last3Days = last7Days.slice(-3);
    const previous3Days = last7Days.slice(0, 3);
    const last3Total = last3Days.reduce((sum, day) => sum + day.total, 0);
    const previous3Total = previous3Days.reduce((sum, day) => sum + day.total, 0);
    const trend = previous3Total > 0 
      ? ((last3Total - previous3Total) / previous3Total * 100).toFixed(1)
      : 0;

    const html = `
      <div class="sales-stats-grid">
        <div class="stat-card">
          <div class="stat-label">Promedio por Venta</div>
          <div class="stat-value">${ui.formatCLP(averageSale)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Mejor Día</div>
          <div class="stat-value-small">${bestDay.date}</div>
          <div class="stat-value">${ui.formatCLP(bestDay.total)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Tendencia (7 días)</div>
          <div class="stat-value ${trend >= 0 ? 'trend-up' : 'trend-down'}">
            ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}%
          </div>
        </div>
      </div>
      <div class="sales-chart-container">
        <h4 style="margin: 15px 0 10px 0; color: rgba(255,255,255,0.9);">Ventas Últimos 7 Días</h4>
        <canvas id="sales-chart" style="max-height: 200px;"></canvas>
      </div>
      <div class="top-products-list">
        <h4 style="margin: 15px 0 10px 0; color: rgba(255,255,255,0.9);">Productos Más Vendidos</h4>
        ${topProducts.length > 0 
          ? topProducts.map((product, index) => `
            <div class="top-product-item">
              <span class="product-rank">${index + 1}</span>
              <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-stats">
                  <span>${product.quantity} unidades</span>
                  <span class="product-revenue">${ui.formatCLP(product.revenue)}</span>
                </div>
              </div>
            </div>
          `).join('')
          : '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 10px;">No hay datos</p>'
        }
      </div>
    `;

    statsContainer.innerHTML = html;

    // Renderizar gráfico después de un pequeño delay para asegurar que el canvas esté en el DOM
    setTimeout(() => {
      const canvas = document.getElementById("sales-chart");
      if (canvas && typeof Chart !== "undefined") {
        const ctx = canvas.getContext("2d");
        
        // Destruir gráfico anterior si existe
        if (window.salesChartInstance) {
          window.salesChartInstance.destroy();
        }

        window.salesChartInstance = new Chart(ctx, {
          type: "line",
          data: {
            labels: last7Days.map(day => {
              const date = new Date(day.date.split('/').reverse().join('-'));
              return date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' });
            }),
            datasets: [
              {
                label: "Ingresos (CLP)",
                data: last7Days.map(day => day.total),
                borderColor: "#4A90E2",
                backgroundColor: "rgba(74, 144, 226, 0.1)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: "rgba(255, 255, 255, 0.8)",
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: "rgba(255, 255, 255, 0.6)",
                  callback: function(value) {
                    return value.toLocaleString('es-CL') + ' CLP';
                  },
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
              x: {
                ticks: {
                  color: "rgba(255, 255, 255, 0.6)",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
            },
          },
        });
      }
    }, 100);
  },
};
