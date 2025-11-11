const PRODUCTS_KEY = "products";
const AUTH_KEY = "isAuthenticated";

// --- Lógica de Autenticación ---
const authService = {
  login: (email, password) => {
    if (email && password) {
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  },
  logout: () => localStorage.removeItem(AUTH_KEY),
  isAuthenticated: () => localStorage.getItem(AUTH_KEY) === "true",
};

// --- Lógica de Productos ---
const productService = {
  getProducts: () => {
    const products = localStorage.getItem(PRODUCTS_KEY);
    if (!products) {
      // Inventario vacío inicialmente - solo se llena con importación de Excel
      return [];
    }
    return JSON.parse(products);
  },
  saveProduct: (productToSave) => {
    let products = productService.getProducts();
    if (productToSave.id) {
      products = products.map((p) =>
        Number(p.id) === Number(productToSave.id) ? productToSave : p
      );
    } else {
      productToSave.id = Date.now(); // ID único
      products.push(productToSave);
    }
    productService.saveAllProducts(products);
  },
  deleteProduct: (productId) => {
    console.log("deleteProduct llamado con ID:", productId);
    let products = productService.getProducts();
    console.log("Productos antes de eliminar:", products);
    products = products.filter((p) => Number(p.id) !== Number(productId));
    console.log("Productos después de eliminar:", products);
    productService.saveAllProducts(products);
  },
  saveAllProducts: (products) => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },
};
