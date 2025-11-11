/**
 * Sistema de Anticipación 7 Días para Hencho TCG
 * Calcula qué productos necesitarán reabastecimiento en los próximos 7 días
 */

const anticipationService = {
  // Días de anticipación
  ANTICIPATION_DAYS: 7,

  /**
   * Calcula la tasa de consumo promedio diario basado en historial
   * @param {Object} product - Producto
   * @param {Array} history - Historial de movimientos (opcional)
   * @returns {number} Tasa de consumo diario
   */
  calculateDailyConsumption: (product, history = []) => {
    // Si hay historial, calcular basado en eso
    if (history && history.length > 0) {
      const totalConsumed = history.reduce(
        (sum, entry) => sum + (entry.quantityConsumed || 0),
        0
      );
      const days = history.length;
      return totalConsumed / days;
    }

    // Si no hay historial, estimar basado en stock actual y precio
    // Productos más caros tienden a venderse menos
    const price = Number(product.price || 0);
    const quantity = Number(product.quantity || 0);

    // Estimación: productos más caros (>50000) se venden 0.1 unidades/día
    // Productos medios (25000-50000) se venden 0.3 unidades/día
    // Productos baratos (<25000) se venden 0.5 unidades/día
    if (price > 50000) {
      return 0.1;
    } else if (price >= 25000) {
      return 0.3;
    } else {
      return 0.5;
    }
  },

  /**
   * Calcula cuánto stock se necesitará en los próximos N días
   * @param {Object} product - Producto
   * @param {number} days - Días a anticipar
   * @param {Array} history - Historial de movimientos (opcional)
   * @returns {number} Stock necesario
   */
  calculateNeededStock: (product, days = null, history = []) => {
    const anticipationDays = days || anticipationService.ANTICIPATION_DAYS;
    const dailyConsumption = anticipationService.calculateDailyConsumption(
      product,
      history
    );
    return dailyConsumption * anticipationDays;
  },

  /**
   * Identifica productos que necesitarán reabastecimiento
   * @param {Array} products - Lista de productos
   * @param {number} days - Días a anticipar
   * @returns {Array} Productos que necesitan reabastecimiento
   */
  getProductsNeedingRestock: (products, days = null) => {
    const anticipationDays = days || anticipationService.ANTICIPATION_DAYS;
    const productsNeedingRestock = [];

    products.forEach((product) => {
      const currentStock = Number(product.quantity || 0);
      const neededStock = anticipationService.calculateNeededStock(
        product,
        anticipationDays
      );
      const dailyConsumption =
        anticipationService.calculateDailyConsumption(product);

      // Si el stock actual es menor al necesario, necesita reabastecimiento
      if (currentStock < neededStock) {
        productsNeedingRestock.push({
          ...product,
          currentStock,
          neededStock: Math.ceil(neededStock),
          dailyConsumption: dailyConsumption.toFixed(2),
          daysUntilOutOfStock: Math.floor(
            currentStock / (dailyConsumption || 0.1)
          ),
          recommendedOrder: Math.ceil(neededStock - currentStock),
        });
      }
    });

    // Ordenar por urgencia (menos días hasta quedar sin stock)
    return productsNeedingRestock.sort(
      (a, b) => a.daysUntilOutOfStock - b.daysUntilOutOfStock
    );
  },

  /**
   * Genera resumen de anticipación
   * @param {Array} products - Lista de productos
   * @returns {Object} Resumen de anticipación
   */
  getAnticipationSummary: (products) => {
    const productsNeedingRestock =
      anticipationService.getProductsNeedingRestock(products);
    const totalRecommendedOrder = productsNeedingRestock.reduce(
      (sum, p) => sum + p.recommendedOrder,
      0
    );
    const urgentProducts = productsNeedingRestock.filter(
      (p) => p.daysUntilOutOfStock <= 3
    );

    return {
      totalProductsNeedingRestock: productsNeedingRestock.length,
      totalRecommendedOrder,
      urgentProducts: {
        count: urgentProducts.length,
        products: urgentProducts,
      },
      products: productsNeedingRestock,
    };
  },
};

// Exportar para uso global
window.anticipationService = anticipationService;
