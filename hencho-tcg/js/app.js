document.addEventListener("DOMContentLoaded", () => {
  const app = {
    init: () => {
      // Inicializar sistema de logging de rendimiento
      console.log("🚀 [APP] Inicializando aplicación Hencho TCG");
      const initTimer = performanceLogger.startTimer(
        "Cargar dashboard",
        "Inicialización completa"
      );

      app.addEventListeners();
      app.checkAuthState();

      performanceLogger.endTimer(initTimer, "Aplicación inicializada");
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
      const clearAllBtn = document.getElementById("clear-all-btn");
      if (clearAllBtn) {
        clearAllBtn.addEventListener("click", app.handleClearAll);
      }
      // Botones de Motor de Precios
      const calculatePricesBtn = document.getElementById(
        "calculate-prices-btn"
      );
      if (calculatePricesBtn) {
        calculatePricesBtn.addEventListener("click", app.handleCalculatePrices);
      }
      const applyPricesBtn = document.getElementById("apply-prices-btn");
      if (applyPricesBtn) {
        applyPricesBtn.addEventListener("click", app.handleApplyPrices);
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
      const loadTimer = performanceLogger.startTimer(
        "Cargar dashboard",
        "Carga de datos y renderizado"
      );

      const products = productService.getProducts();
      console.log(`📊 [APP] Cargando ${products.length} productos`);

      // Renderizar tabla con medición
      const tableTimer = performanceLogger.startTimer(
        "Renderizar tabla",
        `${products.length} productos`
      );
      ui.renderTable(products);
      performanceLogger.endTimer(tableTimer);

      // Renderizar estadísticas con medición
      const statsTimer = performanceLogger.startTimer(
        "Renderizar estadísticas",
        "Cálculo de métricas"
      );
      ui.renderStats(products);
      performanceLogger.endTimer(statsTimer);

      // Renderizar nuevas funcionalidades (Sprint 2 y 3)
      if (typeof kpiDashboard !== "undefined") {
        ui.renderKPIs(products);
      }
      if (typeof alertService !== "undefined") {
        ui.renderAlerts(products);
      }
      if (typeof anticipationService !== "undefined") {
        ui.renderAnticipation(products);
      }
      if (typeof pricingEngine !== "undefined") {
        ui.renderPricing(products);
      }

      // Intentar renderizar gráficos con un pequeño delay para asegurar que Chart.js esté cargado
      setTimeout(() => {
        const chartsTimer = performanceLogger.startTimer(
          "Renderizar gráfico",
          "Chart.js"
        );
        ui.renderCharts(products);
        performanceLogger.endTimer(chartsTimer);
        performanceLogger.endTimer(
          loadTimer,
          "Dashboard cargado completamente"
        );
      }, 100);
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

      const saveTimer = performanceLogger.startTimer(
        "CRUD productos",
        "Guardar producto"
      );

      const product = {
        id: document.getElementById("product-id").value
          ? Number(document.getElementById("product-id").value)
          : null,
        sku: document.getElementById("product-sku").value,
        name: document.getElementById("product-name").value,
        quantity: document.getElementById("product-quantity").value,
        price: document.getElementById("product-price").value,
      };

      console.log(
        `💾 [APP] Guardando producto: ${product.name || "Nuevo producto"}`
      );

      productService.saveProduct(product);
      app.loadDashboardData();
      ui.closeModal();

      performanceLogger.endTimer(
        saveTimer,
        `Producto ${product.id ? "actualizado" : "creado"}`
      );
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
        console.log("🗑️ [APP] Eliminando producto...");
        if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
          const deleteTimer = performanceLogger.startTimer(
            "CRUD productos",
            "Eliminar producto"
          );
          console.log("✅ [APP] Confirmado - Eliminando producto con ID:", id);
          productService.deleteProduct(id);
          app.loadDashboardData();
          performanceLogger.endTimer(deleteTimer, `Producto ${id} eliminado`);
        } else {
          console.log("❌ [APP] Eliminación cancelada por el usuario");
        }
      }
    },

    checkAuthState: () => {
      // Verificar si el usuario está autenticado
      if (!authService.isAuthenticated()) {
        window.location.href = "../index.html";
        return;
      }
      // Si está autenticado, cargar datos del dashboard
      app.loadDashboardData();
    },

    loadDashboardData: () => {
      const products = productService.getProducts();
      ui.renderTable(products);
      ui.renderStats(products);
      ui.renderCharts(products);
    },

    handleExport: () => {
      const exportTimer = performanceLogger.startTimer(
        "Exportar Excel",
        `${productService.getProducts().length} productos`
      );

      const products = productService.getProducts();
      console.log(`📤 [APP] Exportando ${products.length} productos a Excel`);

      excelService.exportToExcel(products);

      performanceLogger.endTimer(exportTimer, "Archivo Excel generado");
    },

    handleImport: async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const importTimer = performanceLogger.startTimer(
        "Importar Excel",
        `Archivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      );

      try {
        console.log(`📥 [APP] Importando archivo Excel: ${file.name}`);

        const newProducts = await excelService.importFromExcel(file);
        // Asegurar que todos los productos tengan IDs únicos
        const productsWithIds = newProducts.map((product, index) => ({
          ...product,
          id: product.id || Date.now() + index + Math.random() * 1000, // Generar ID único si no existe
        }));

        console.log(`✅ [APP] Productos importados: ${productsWithIds.length}`);
        console.log("📊 [APP] Productos importados:", productsWithIds);

        productService.saveAllProducts(productsWithIds);
        app.loadDashboardData();

        performanceLogger.endTimer(
          importTimer,
          `${productsWithIds.length} productos importados`
        );
        alert("Productos importados correctamente.");
      } catch (error) {
        console.error("❌ [APP] Error al importar:", error);
        performanceLogger.endTimer(importTimer, `ERROR: ${error.message}`);
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
      alert(
        "✅ Precios recomendados calculados. Revisa el panel de Motor de Precios."
      );
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
