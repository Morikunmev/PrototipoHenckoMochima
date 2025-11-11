/**
 * Sistema de Alertas de Stock Mínimo (HU006) - Mochima
 * Detecta productos con stock bajo y genera alertas
 */

const alertService = {
  // Configuración de umbrales de stock mínimo para comida
  MIN_STOCK_THRESHOLD: 10, // Stock mínimo por defecto (más alto para comida)
  CRITICAL_STOCK_THRESHOLD: 5, // Stock crítico

  /**
   * Obtiene productos con stock bajo
   * @param {Array} products - Lista de productos
   * @param {number} threshold - Umbral de stock mínimo (opcional)
   * @returns {Array} Productos con stock bajo
   */
  getLowStockProducts: (products, threshold = null) => {
    const minStock = threshold || alertService.MIN_STOCK_THRESHOLD;
    return products.filter(
      (p) => Number(p.quantity || 0) <= minStock && Number(p.quantity || 0) > 0
    );
  },

  /**
   * Obtiene productos con stock crítico
   * @param {Array} products - Lista de productos
   * @returns {Array} Productos con stock crítico
   */
  getCriticalStockProducts: (products) => {
    return products.filter(
      (p) => Number(p.quantity || 0) <= alertService.CRITICAL_STOCK_THRESHOLD
    );
  },

  /**
   * Obtiene productos sin stock
   * @param {Array} products - Lista de productos
   * @returns {Array} Productos sin stock
   */
  getOutOfStockProducts: (products) => {
    return products.filter((p) => Number(p.quantity || 0) === 0);
  },

  /**
   * Genera resumen de alertas
   * @param {Array} products - Lista de productos
   * @returns {Object} Resumen de alertas
   */
  getAlertsSummary: (products) => {
    const lowStock = alertService.getLowStockProducts(products);
    const criticalStock = alertService.getCriticalStockProducts(products);
    const outOfStock = alertService.getOutOfStockProducts(products);

    return {
      lowStock: {
        count: lowStock.length,
        products: lowStock,
      },
      criticalStock: {
        count: criticalStock.length,
        products: criticalStock,
      },
      outOfStock: {
        count: outOfStock.length,
        products: outOfStock,
      },
      totalAlerts: lowStock.length + criticalStock.length + outOfStock.length,
    };
  },

  /**
   * Verifica si un producto necesita alerta
   * @param {Object} product - Producto a verificar
   * @param {number} threshold - Umbral personalizado
   * @returns {string|null} Tipo de alerta o null
   */
  checkProductAlert: (product, threshold = null) => {
    const quantity = Number(product.quantity || 0);
    const minStock = threshold || alertService.MIN_STOCK_THRESHOLD;

    if (quantity === 0) {
      return "out_of_stock";
    } else if (quantity <= alertService.CRITICAL_STOCK_THRESHOLD) {
      return "critical";
    } else if (quantity <= minStock) {
      return "low_stock";
    }
    return null;
  },
};

// Exportar para uso global
window.alertService = alertService;
