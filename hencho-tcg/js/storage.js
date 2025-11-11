const PRODUCTS_KEY = "hencho_tcg_products";
const AUTH_KEY = "isAuthenticated";
const SALES_KEY = "hencho_tcg_sales";

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
  increaseQuantity: (productId, amount = 1) => {
    const increaseTimer = performanceLogger.startTimer(
      "CRUD productos",
      `Aumentar cantidad en ${amount}`
    );

    let products = productService.getProducts();
    const product = products.find((p) => Number(p.id) === Number(productId));
    
    if (product) {
      const oldQuantity = Number(product.quantity || 0);
      product.quantity = Math.max(0, oldQuantity + amount);
      console.log(
        `➕ [STORAGE] Producto ${productId}: ${oldQuantity} → ${product.quantity} (+${amount})`
      );
      productService.saveAllProducts(products);
      performanceLogger.endTimer(
        increaseTimer,
        `Cantidad aumentada: ${oldQuantity} → ${product.quantity}`
      );
      return product;
    }
    
    performanceLogger.endTimer(increaseTimer, "Producto no encontrado");
    return null;
  },
  decreaseQuantity: (productId, amount = 1) => {
    const decreaseTimer = performanceLogger.startTimer(
      "CRUD productos",
      `Disminuir cantidad en ${amount}`
    );

    let products = productService.getProducts();
    const product = products.find((p) => Number(p.id) === Number(productId));
    
    if (product) {
      const oldQuantity = Number(product.quantity || 0);
      product.quantity = Math.max(0, oldQuantity - amount);
      console.log(
        `➖ [STORAGE] Producto ${productId}: ${oldQuantity} → ${product.quantity} (-${amount})`
      );
      productService.saveAllProducts(products);
      performanceLogger.endTimer(
        decreaseTimer,
        `Cantidad disminuida: ${oldQuantity} → ${product.quantity}`
      );
      return product;
    }
    
    performanceLogger.endTimer(decreaseTimer, "Producto no encontrado");
    return null;
  },
  sellProduct: (productId, quantity = 1) => {
    const sellTimer = performanceLogger.startTimer(
      "Venta",
      `Vender ${quantity} unidad(es)`
    );

    let products = productService.getProducts();
    const product = products.find((p) => Number(p.id) === Number(productId));
    
    if (!product) {
      performanceLogger.endTimer(sellTimer, "Producto no encontrado");
      return null;
    }

    const oldQuantity = Number(product.quantity || 0);
    
    if (oldQuantity < quantity) {
      console.log(
        `⚠️ [VENTA] Stock insuficiente: ${oldQuantity} unidades disponibles, se intentó vender ${quantity}`
      );
      performanceLogger.endTimer(sellTimer, "Stock insuficiente");
      return { success: false, message: "Stock insuficiente" };
    }

    product.quantity = Math.max(0, oldQuantity - quantity);
    const saleValue = Number(product.price || 0) * quantity;
    
    console.log(
      `💰 [VENTA] Producto vendido: ${product.name || product.sku} | Cantidad: ${oldQuantity} → ${product.quantity} | Valor venta: ${saleValue} CLP`
    );
    
    productService.saveAllProducts(products);
    
    // Guardar registro de venta
    const saleRecord = {
      id: Date.now() + Math.random(),
      productId: productId,
      productName: product.name || product.sku,
      productSku: product.sku,
      quantity: quantity,
      unitPrice: Number(product.price || 0),
      totalValue: saleValue,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-CL'),
      time: new Date().toLocaleTimeString('es-CL')
    };
    
    salesService.addSale(saleRecord);
    
    performanceLogger.endTimer(
      sellTimer,
      `Venta realizada: ${quantity} unidad(es) por ${saleValue} CLP`
    );
    
    return {
      success: true,
      product: product,
      quantitySold: quantity,
      saleValue: saleValue,
      remainingStock: product.quantity,
      saleRecord: saleRecord
    };
  },
};

// --- Lógica de Ventas ---
const salesService = {
  getSales: () => {
    const sales = localStorage.getItem(SALES_KEY);
    if (!sales) {
      return [];
    }
    return JSON.parse(sales);
  },
  addSale: (saleRecord) => {
    const sales = salesService.getSales();
    sales.push(saleRecord);
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    console.log(`📝 [VENTAS] Venta registrada: ${saleRecord.productName} - ${saleRecord.totalValue} CLP`);
  },
  getSalesByDate: (date) => {
    const sales = salesService.getSales();
    return sales.filter(sale => sale.date === date);
  },
  getTotalSales: () => {
    const sales = salesService.getSales();
    return sales.reduce((total, sale) => total + sale.totalValue, 0);
  },
  getSalesCount: () => {
    return salesService.getSales().length;
  },
  clearSales: () => {
    localStorage.removeItem(SALES_KEY);
    console.log(`🗑️ [VENTAS] Historial de ventas eliminado`);
  }
};

// Funciones globales para acceder desde la consola del navegador
window.verVentas = () => {
  const sales = salesService.getSales();
  console.table(sales);
  console.log(`📊 Total de ventas: ${sales.length}`);
  console.log(`💰 Valor total: ${salesService.getTotalSales().toLocaleString('es-CL')} CLP`);
  return sales;
};

window.verVentasHoy = () => {
  const today = new Date().toLocaleDateString('es-CL');
  const salesToday = salesService.getSalesByDate(today);
  console.table(salesToday);
  console.log(`📊 Ventas de hoy: ${salesToday.length}`);
  const totalToday = salesToday.reduce((sum, sale) => sum + sale.totalValue, 0);
  console.log(`💰 Total de hoy: ${totalToday.toLocaleString('es-CL')} CLP`);
  return salesToday;
};

window.exportarVentas = () => {
  const sales = salesService.getSales();
  const dataStr = JSON.stringify(sales, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ventas_hencho_tcg_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  console.log('📥 Ventas exportadas');
};
