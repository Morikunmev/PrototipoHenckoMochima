const PRODUCTS_KEY = "hencho_tcg_products";
const AUTH_KEY = "isAuthenticated";

// --- Lógica de Autenticación ---
const authService = {
  login: (email, password) => {
    const loginTimer = performanceLogger.startTimer(
      "Login",
      "Verificación de credenciales"
    );

    if (email && password) {
      localStorage.setItem(AUTH_KEY, "true");
      console.log(`🔐 [AUTH] Login exitoso para usuario: ${email}`);
      performanceLogger.endTimer(loginTimer, "Login exitoso");
      return true;
    }

    console.log(`❌ [AUTH] Login fallido para usuario: ${email}`);
    performanceLogger.endTimer(loginTimer, "Login fallido");
    return false;
  },
  logout: () => {
    console.log(`🚪 [AUTH] Usuario cerrando sesión`);
    localStorage.removeItem(AUTH_KEY);
  },
  isAuthenticated: () => localStorage.getItem(AUTH_KEY) === "true",
};

// --- Lógica de Productos ---
const productService = {
  getProducts: () => {
    const getTimer = performanceLogger.startTimer(
      "CRUD productos",
      "Obtener productos"
    );

    const products = localStorage.getItem(PRODUCTS_KEY);
    if (!products) {
      console.log(`📦 [STORAGE] Inventario vacío - ${PRODUCTS_KEY}`);
      performanceLogger.endTimer(getTimer, "Inventario vacío");
      return [];
    }

    const parsedProducts = JSON.parse(products);
    console.log(`📦 [STORAGE] Obtenidos ${parsedProducts.length} productos`);
    performanceLogger.endTimer(
      getTimer,
      `${parsedProducts.length} productos obtenidos`
    );
    return parsedProducts;
  },
  saveProduct: (productToSave) => {
    const saveTimer = performanceLogger.startTimer(
      "CRUD productos",
      "Guardar producto"
    );

    let products = productService.getProducts();
    if (productToSave.id) {
      console.log(`💾 [STORAGE] Actualizando producto ID: ${productToSave.id}`);
      products = products.map((p) =>
        Number(p.id) === Number(productToSave.id) ? productToSave : p
      );
    } else {
      productToSave.id = Date.now(); // ID único
      console.log(
        `➕ [STORAGE] Creando nuevo producto ID: ${productToSave.id}`
      );
      products.push(productToSave);
    }
    productService.saveAllProducts(products);
    performanceLogger.endTimer(
      saveTimer,
      `Producto ${productToSave.id} guardado`
    );
  },
  deleteProduct: (productId) => {
    const deleteTimer = performanceLogger.startTimer(
      "CRUD productos",
      "Eliminar producto"
    );

    console.log(`🗑️ [STORAGE] Eliminando producto ID: ${productId}`);
    let products = productService.getProducts();
    console.log(`📊 [STORAGE] Productos antes de eliminar: ${products.length}`);

    products = products.filter((p) => Number(p.id) !== Number(productId));
    console.log(
      `📊 [STORAGE] Productos después de eliminar: ${products.length}`
    );

    productService.saveAllProducts(products);
    performanceLogger.endTimer(deleteTimer, `Producto ${productId} eliminado`);
  },
  saveAllProducts: (products) => {
    const saveAllTimer = performanceLogger.startTimer(
      "CRUD productos",
      "Guardar todos los productos"
    );

    console.log(
      `💾 [STORAGE] Guardando ${products.length} productos en localStorage`
    );
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    performanceLogger.endTimer(
      saveAllTimer,
      `${products.length} productos guardados`
    );
  },
};
