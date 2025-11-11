document.addEventListener("DOMContentLoaded", () => {
  const app = {
    init: () => {
      app.addEventListeners();
      app.checkAuthState();
      app.setupIntersectionObserver();
    },

    addEventListeners: () => {
      // Login (solo si existe)
      const loginForm = document.getElementById("login-form");
      if (loginForm) {
        loginForm.addEventListener("submit", app.handleLogin);
      }
      // Dashboard Actions
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", app.handleLogout);
      }
      const addProductBtn = document.getElementById("add-product-btn");
      if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
          console.log("Botón añadir producto clickeado");
          console.log("ui disponible:", typeof ui);
          console.log("ui.openModal disponible:", typeof ui.openModal);
          if (typeof ui !== "undefined" && typeof ui.openModal === "function") {
            ui.openModal();
          } else {
            console.error("ui.openModal no está disponible");
          }
        });
      }
      const exportBtn = document.getElementById("export-btn");
      if (exportBtn) {
        exportBtn.addEventListener("click", app.handleExport);
      }
      const importInput = document.getElementById("import-input");
      if (importInput) {
        importInput.addEventListener("change", app.handleImport);
      }
      // Campo de búsqueda
      const searchInput = document.getElementById("search-products");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          ui.filterProducts(e.target.value);
        });
        searchInput.addEventListener("keyup", (e) => {
          if (e.key === "Escape") {
            e.target.value = "";
            ui.filterProducts("");
          }
        });
      }
      const clearAllBtn = document.getElementById("clear-all-btn");
      if (clearAllBtn) {
        clearAllBtn.addEventListener("click", app.handleClearAll);
      }
      // Botones de Motor de Precios
      const calculatePricesBtn = document.getElementById("calculate-prices-btn");
      if (calculatePricesBtn) {
        calculatePricesBtn.addEventListener("click", app.handleCalculatePrices);
      }
      const applyPricesBtn = document.getElementById("apply-prices-btn");
      if (applyPricesBtn) {
        applyPricesBtn.addEventListener("click", app.handleApplyPrices);
      }
      // Botón de Historial de Ventas
      const viewSalesHistoryBtn = document.getElementById("view-sales-history-btn");
      if (viewSalesHistoryBtn) {
        viewSalesHistoryBtn.addEventListener("click", ui.openSalesModal);
      }
      // Botones del Modal de Ventas
      const closeSalesModal = document.getElementById("close-sales-modal");
      if (closeSalesModal) {
        closeSalesModal.addEventListener("click", ui.closeSalesModal);
      }
      const exportSalesBtn = document.getElementById("export-sales-btn");
      if (exportSalesBtn) {
        exportSalesBtn.addEventListener("click", () => {
          if (typeof exportarVentas === "function") {
            exportarVentas();
          }
        });
      }
      const clearSalesBtn = document.getElementById("clear-sales-btn");
      if (clearSalesBtn) {
        clearSalesBtn.addEventListener("click", () => {
          if (confirm("¿Estás seguro de que quieres eliminar todo el historial de ventas? Esta acción no se puede deshacer.")) {
            if (typeof salesService !== "undefined") {
              salesService.clearSales();
              ui.renderSales();
              ui.renderSalesHistory();
              alert("✅ Historial de ventas eliminado");
            }
          }
        });
      }
      // Cerrar modal de ventas al hacer clic fuera
      const salesModal = document.getElementById("sales-modal");
      if (salesModal) {
        salesModal.addEventListener("click", (e) => {
          if (e.target.id === "sales-modal") {
            ui.closeSalesModal();
          }
        });
      }
      // Modal Actions
      const productForm = document.getElementById("product-form");
      if (productForm) {
        productForm.addEventListener("submit", app.handleSaveProduct);
      }
      const cancelBtn = document.getElementById("cancel-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", ui.closeModal);
      }
      // Cerrar modal al hacer clic fuera
      const productModal = document.getElementById("product-modal");
      if (productModal) {
        productModal.addEventListener("click", (e) => {
          if (e.target.id === "product-modal") {
            ui.closeModal();
          }
        });
      }
      // Table Actions (event delegation)
      if (ui.productTableBody) {
        ui.productTableBody.addEventListener("click", app.handleTableClick);
      }
    },

    checkAuthState: () => {
      if (authService.isAuthenticated()) {
        ui.showView(ui.dashboardView);
        app.loadDashboardData();
      } else {
        ui.showView(ui.loginView);
      }
    },

    loadDashboardData: () => {
      const products = productService.getProducts();
      ui.renderTable(products);
      ui.renderStats(products);

      // Renderizar nuevas funcionalidades (Sprint 2 y 3)
      if (typeof kpiDashboard !== "undefined") {
        ui.renderKPIs(products);
        // Añadir event listener para el botón de mejorar salud
        setTimeout(() => {
          const improveHealthBtn = document.getElementById("improve-health-btn");
          if (improveHealthBtn) {
            improveHealthBtn.addEventListener("click", app.handleImproveHealth);
          }
        }, 100);
      }
      if (typeof alertService !== "undefined") {
        ui.renderAlerts(products);
      }
      if (typeof pricingEngine !== "undefined") {
        ui.renderPricing(products);
      }
      if (typeof salesService !== "undefined") {
        ui.renderSales();
        ui.renderSalesStats();
        ui.updateFinancialStats();
        ui.updateOrderStatus();
      }

      // Intentar renderizar gráficos con un pequeño delay para asegurar que Chart.js esté cargado
      setTimeout(() => {
        ui.renderCharts(products);
      }, 100);
    },
    
    setupIntersectionObserver: () => {
      // Observar cuando los paneles de alertas y ventas sean visibles
      const alertsPanel = document.querySelector('.panel-alerts');
      const salesPanel = document.querySelector('.panel-sales');
      const salesStatsPanel = document.querySelector('.panel-sales-stats');
      
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Se activa cuando el 10% del panel es visible
      };
      
      const observerCallback = (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const products = productService.getProducts();
            
            // Recargar alertas cuando el panel de alertas es visible
            if (entry.target.classList.contains('panel-alerts')) {
              if (typeof alertService !== "undefined") {
                ui.renderAlerts(products);
              }
            }
            
            // Recargar ventas cuando los paneles de ventas son visibles
            if (entry.target.classList.contains('panel-sales') || 
                entry.target.classList.contains('panel-sales-stats')) {
              if (typeof salesService !== "undefined") {
                ui.renderSales();
                ui.renderSalesStats();
                ui.updateFinancialStats();
                ui.updateOrderStatus();
              }
            }
          }
        });
      };
      
      const observer = new IntersectionObserver(observerCallback, observerOptions);
      
      if (alertsPanel) observer.observe(alertsPanel);
      if (salesPanel) observer.observe(salesPanel);
      if (salesStatsPanel) observer.observe(salesStatsPanel);
    },

    handleLogin: (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const errorEl = document.getElementById("login-error");

      if (authService.login(email, password)) {
        errorEl.textContent = "";
        app.checkAuthState();
      } else {
        errorEl.textContent = "Credenciales inválidas.";
      }
    },

    handleLogout: () => {
      authService.logout();
      app.checkAuthState();
    },

    handleSaveProduct: (e) => {
      e.preventDefault();
      const product = {
        id: document.getElementById("product-id").value
          ? Number(document.getElementById("product-id").value)
          : null,
        sku: document.getElementById("product-sku").value,
        name: document.getElementById("product-name").value,
        quantity: document.getElementById("product-quantity").value,
        cost: document.getElementById("product-cost").value ? Number(document.getElementById("product-cost").value) : null,
        price: document.getElementById("product-price").value,
      };
      productService.saveProduct(product);
      app.loadDashboardData();
      ui.closeModal();
    },

    handleTableClick: (e) => {
      const target = e.target;
      console.log("Elemento clickeado:", target);
      console.log("Clases del elemento:", target.classList);
      console.log("Dataset ID:", target.dataset.id);

      const id = Number(target.dataset.id);
      console.log("ID convertido a número:", id);

      if (target.classList.contains("btn-edit")) {
        console.log("Editando producto...");
        const products = productService.getProducts();
        const productToEdit = products.find((p) => Number(p.id) === id);
        console.log("Producto a editar:", productToEdit);
        ui.openModal(productToEdit);
      }
      if (target.classList.contains("btn-delete")) {
        console.log("Eliminando producto...");
        if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
          console.log("Confirmado - Eliminando producto con ID:", id);
          productService.deleteProduct(id);
          app.loadDashboardData();
        } else {
          console.log("Eliminación cancelada por el usuario");
        }
      }
      if (target.classList.contains("btn-increase")) {
        console.log("➕ [APP] Aumentando cantidad del producto:", id);
        productService.increaseQuantity(id, 1);
        app.loadDashboardData();
      }
      if (target.classList.contains("btn-decrease")) {
        console.log("➖ [APP] Disminuyendo cantidad del producto:", id);
        const products = productService.getProducts();
        const product = products.find((p) => Number(p.id) === id);
        if (product && Number(product.quantity || 0) > 0) {
          productService.decreaseQuantity(id, 1);
          app.loadDashboardData();
        } else {
          console.log("⚠️ [APP] No se puede disminuir: cantidad ya es 0");
        }
      }
      if (target.classList.contains("btn-sell")) {
        console.log("💰 [APP] Vendiendo producto:", id);
        const products = productService.getProducts();
        const product = products.find((p) => Number(p.id) === id);
        
        if (!product) {
          alert("Producto no encontrado");
          return;
        }
        
        if (Number(product.quantity || 0) === 0) {
          alert(`⚠️ No hay stock disponible de ${product.name || product.sku}`);
          return;
        }
        
        const saleResult = productService.sellProduct(id, 1);
        
        if (saleResult && saleResult.success) {
          app.loadDashboardData();
          // Actualizar panel de ventas y estadísticas
          ui.renderSales();
          ui.renderSalesStats();
          ui.updateFinancialStats();
          ui.updateOrderStatus();
          // Mostrar notificación de venta exitosa
          const message = `✅ Venta realizada\n\nProducto: ${product.name || product.sku}\nValor: ${ui.formatCLP(saleResult.saleValue)}\nStock restante: ${saleResult.remainingStock} unidades`;
          alert(message);
        } else {
          alert(`❌ Error al realizar la venta: ${saleResult?.message || "Stock insuficiente"}`);
        }
      }
      
      // Aplicar precio recomendado
      if (target.classList.contains("btn-apply-price")) {
        const products = productService.getProducts();
        const product = products.find((p) => Number(p.id) === id);
        
        if (product && typeof pricingEngine !== "undefined") {
          const recommendation = pricingEngine.calculateRecommendedPrice(product);
          const newPrice = recommendation.recommendedPrice;
          const oldPrice = Number(product.price || 0);
          
          if (confirm(`¿Aplicar precio recomendado?\n\nProducto: ${product.name || product.sku}\nPrecio actual: ${ui.formatCLP(oldPrice)}\nPrecio recomendado: ${ui.formatCLP(newPrice)}\n\nDiferencia: ${ui.formatCLP(newPrice - oldPrice)}`)) {
            product.price = newPrice;
            productService.saveProduct(product);
            app.loadDashboardData();
            
            // Actualizar panel de precios
            if (typeof pricingEngine !== "undefined") {
              const updatedProducts = productService.getProducts();
              ui.renderPricing(updatedProducts);
            }
            
            alert(`✅ Precio actualizado\n\n${product.name || product.sku}\nNuevo precio: ${ui.formatCLP(newPrice)}`);
          }
        }
      }
    },

    checkAuthState: () => {
      console.log("Verificando estado de autenticación...");
      console.log("authService:", authService);
      console.log("isAuthenticated:", authService.isAuthenticated());

      // Verificar si el usuario está autenticado
      if (!authService.isAuthenticated()) {
        console.log("Usuario no autenticado, redirigiendo a login...");
        window.location.href = "../index.html";
        return;
      }

      console.log("Usuario autenticado, cargando dashboard...");
      // Si está autenticado, cargar datos del dashboard
      app.loadDashboardData();
    },

    loadDashboardData: () => {
      console.log("Cargando datos del dashboard...");
      const products = productService.getProducts();
      console.log("Productos obtenidos:", products);
      console.log("ui:", ui);

      if (ui.renderTable) {
        console.log("Renderizando tabla...");
        ui.renderTable(products);
      } else {
        console.error("ui.renderTable no está disponible");
      }

      if (ui.renderStats) {
        console.log("Renderizando estadísticas...");
        ui.renderStats(products);
      } else {
        console.error("ui.renderStats no está disponible");
      }

      if (ui.renderCharts) {
        console.log("Renderizando gráficos...");
        ui.renderCharts(products);
      } else {
        console.error("ui.renderCharts no está disponible");
      }
    },

    handleImproveHealth: () => {
      const products = productService.getProducts();
      const kpis = kpiDashboard.calculateKPIs(products);
      const recommendations = kpiDashboard.generateRecommendations(products);
      
      if (recommendations.length === 0) {
        alert("✅ Tu inventario está en buen estado. No hay acciones urgentes recomendadas.");
        return;
      }
      
      // Crear mensaje con recomendaciones
      let message = "🔧 ACCIONES RECOMENDADAS PARA MEJORAR LA SALUD:\n\n";
      
      recommendations.forEach((rec, index) => {
        const priority = rec.type === "urgent" ? "🔴 URGENTE" : rec.type === "high" ? "🟠 ALTA" : "🟡 MEDIA";
        message += `${index + 1}. [${priority}] ${rec.message}\n`;
      });
      
      message += `\n📊 Salud actual: ${kpis.health.score}/100 (${kpis.health.status.toUpperCase()})\n`;
      message += `\n¿Deseas ver el detalle de estas recomendaciones?`;
      
      if (confirm(message)) {
        // Mostrar panel de alertas si hay problemas de stock
        if (kpis.alerts.totalAlerts > 0) {
          const alertsPanel = document.querySelector('.panel-alerts');
          if (alertsPanel) {
            alertsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            ui.renderAlerts(products);
          }
        }
        
        // Mostrar panel de precios si hay problemas de precios
        if (kpis.pricing.productsNeedingPriceAdjustment > 0) {
          const pricingPanel = document.querySelector('.panel-pricing');
          if (pricingPanel) {
            setTimeout(() => {
              pricingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
              ui.renderPricing(products);
            }, 500);
          }
        }
      }
    },

    handleExport: () => {
      const products = productService.getProducts();
      excelService.exportToExcel(products);
    },

    handleImport: async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const newProducts = await excelService.importFromExcel(file);
        // Asegurar que todos los productos tengan IDs únicos
        const productsWithIds = newProducts.map((product, index) => ({
          ...product,
          id: product.id || Date.now() + index + Math.random() * 1000, // Generar ID único si no existe
        }));
        console.log("Productos importados:", productsWithIds);
        productService.saveAllProducts(productsWithIds);
        app.loadDashboardData();
        alert("Productos importados correctamente.");
      } catch (error) {
        console.error("Error al importar:", error);
        alert("Hubo un error al leer el archivo Excel.");
      }
      // Limpiar el input para poder subir el mismo archivo otra vez
      e.target.value = "";
    },

    handleClearAll: () => {
      const products = productService.getProducts();
      if (products.length === 0) {
        alert("No hay productos para vaciar.");
        return;
      }

      if (
        confirm(
          `¿Estás seguro de que quieres vaciar todos los productos?\n\nSe eliminarán ${products.length} productos del inventario.`
        )
      ) {
        productService.saveAllProducts([]);
        app.loadDashboardData();
        alert("✅ Inventario vaciado correctamente.");
      }
    },

    handleCalculatePrices: () => {
      const products = productService.getProducts();
      if (products.length === 0) {
        alert("No hay productos para calcular precios.");
        return;
      }

      console.log("💰 [APP] Calculando precios recomendados...");
      ui.renderPricing(products);
      alert("✅ Precios recomendados calculados. Revisa el panel de Motor de Precios.");
    },

    handleApplyPrices: () => {
      const products = productService.getProducts();
      if (products.length === 0) {
        alert("No hay productos para aplicar precios.");
        return;
      }

      if (
        !confirm(
          `¿Estás seguro de que quieres aplicar los precios recomendados a ${products.length} productos?\n\nEsto actualizará los precios de todos los productos.`
        )
      ) {
        return;
      }

      console.log("💰 [APP] Aplicando precios recomendados...");
      const updatedProducts = pricingEngine.applyRecommendedPrices(products);
      productService.saveAllProducts(updatedProducts);
      app.loadDashboardData();
      alert("✅ Precios recomendados aplicados correctamente.");
    },

    // Función de depuración para limpiar datos
    clearAllData: () => {
      if (confirm("¿Estás seguro de que quieres limpiar todos los datos?")) {
        localStorage.removeItem("products");
        localStorage.removeItem("isAuthenticated");
        location.reload();
      }
    },
  };

  // Agregar función global para depuración
  window.clearAllData = app.clearAllData;

  // Función temporal para establecer autenticación
  window.setAuth = () => {
    localStorage.setItem("isAuthenticated", "true");
    console.log("Autenticación establecida");
    location.reload();
  };

  // Limpiar datos existentes sin IDs
  const existingProducts = productService.getProducts();
  if (existingProducts.length > 0 && existingProducts.some((p) => !p.id)) {
    console.log("Limpiando productos sin IDs...");
    localStorage.removeItem("products");
  }

  app.init();
});
