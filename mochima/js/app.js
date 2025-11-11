document.addEventListener("DOMContentLoaded", () => {
  const app = {
    init: () => {
      app.addEventListeners();
      app.checkAuthState();
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
      const calculatePricesBtn = document.getElementById("calculate-prices-btn");
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
      const products = productService.getProducts();
      ui.renderTable(products);
      ui.renderStats(products);

      // Renderizar nuevas funcionalidades (Sprint 2 y 3)
      if (typeof kpiDashboard !== "undefined") {
        ui.renderKPIs(products);
      }
      if (typeof alertService !== "undefined") {
        ui.renderAlerts(products);
      }
      if (typeof pricingEngine !== "undefined") {
        ui.renderPricing(products);
      }

      // Intentar renderizar gráficos con un pequeño delay para asegurar que Chart.js esté cargado
      setTimeout(() => {
        ui.renderCharts(products);
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
      const product = {
        id: document.getElementById("product-id").value
          ? Number(document.getElementById("product-id").value)
          : null,
        sku: document.getElementById("product-sku").value,
        name: document.getElementById("product-name").value,
        quantity: document.getElementById("product-quantity").value,
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
