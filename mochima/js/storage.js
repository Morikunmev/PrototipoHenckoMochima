const PRODUCTS_KEY = "mochima_products";
const AUTH_KEY = "isAuthenticated";
const SALES_KEY = "mochima_sales";

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
  increaseQuantity: (productId, amount = 1) => {
    let products = productService.getProducts();
    const product = products.find((p) => Number(p.id) === Number(productId));
    
    if (product) {
      const oldQuantity = Number(product.quantity || 0);
      product.quantity = Math.max(0, oldQuantity + amount);
      console.log(
        `➕ [STORAGE] Producto ${productId}: ${oldQuantity} → ${product.quantity} (+${amount})`
      );
      productService.saveAllProducts(products);
      return product;
    }
    return null;
  },
  decreaseQuantity: (productId, amount = 1) => {
    let products = productService.getProducts();
    const product = products.find((p) => Number(p.id) === Number(productId));
    
    if (product) {
      const oldQuantity = Number(product.quantity || 0);
      product.quantity = Math.max(0, oldQuantity - amount);
      console.log(
        `➖ [STORAGE] Producto ${productId}: ${oldQuantity} → ${product.quantity} (-${amount})`
      );
      productService.saveAllProducts(products);
      return product;
    }
    return null;
  },
  sellProduct: (productId, quantity = 1) => {
    let products = productService.getProducts();
    const product = products.find((p) => Number(p.id) === Number(productId));
    
    if (!product) {
      return null;
    }

    const oldQuantity = Number(product.quantity || 0);
    
    if (oldQuantity < quantity) {
      console.log(
        `⚠️ [VENTA] Stock insuficiente: ${oldQuantity} unidades disponibles, se intentó vender ${quantity}`
      );
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
  link.download = `ventas_mochima_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  console.log('📥 Ventas exportadas');
};
