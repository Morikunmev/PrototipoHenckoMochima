document.addEventListener("DOMContentLoaded", () => {
  const app = {
    init: () => {
      app.addEventListeners();
      app.checkAuthState();
    },

    addEventListeners: () => {
      // Login
      document
        .getElementById("login-form")
        .addEventListener("submit", app.handleLogin);
      // Dashboard Actions
      document
        .getElementById("logout-btn")
        .addEventListener("click", app.handleLogout);
      document
        .getElementById("add-product-btn")
        .addEventListener("click", () => ui.openModal());
      document
        .getElementById("export-btn")
        .addEventListener("click", app.handleExport);
      document
        .getElementById("import-input")
        .addEventListener("change", app.handleImport);
      // Modal Actions
      document
        .getElementById("product-form")
        .addEventListener("submit", app.handleSaveProduct);
      document
        .getElementById("cancel-btn")
        .addEventListener("click", ui.closeModal);
      // Table Actions (event delegation)
      ui.productTableBody.addEventListener("click", app.handleTableClick);
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

  // Limpiar datos existentes sin IDs
  const existingProducts = productService.getProducts();
  if (existingProducts.length > 0 && existingProducts.some((p) => !p.id)) {
    console.log("Limpiando productos sin IDs...");
    localStorage.removeItem("products");
  }

  app.init();
});
