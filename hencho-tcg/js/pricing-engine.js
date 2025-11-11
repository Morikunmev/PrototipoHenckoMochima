/**
 * Motor de Cálculo Automático de Precios (HU002)
 * Calcula precios automáticamente basado en costos y márgenes
 */

const pricingEngine = {
  // Configuración de márgenes por defecto
  DEFAULT_MARGIN_PERCENTAGE: 30, // 30% de margen por defecto
  MIN_MARGIN_PERCENTAGE: 15, // Margen mínimo
  MAX_MARGIN_PERCENTAGE: 50, // Margen máximo

  // Márgenes específicos por tipo de producto
  MARGINS_BY_CATEGORY: {
    premium: 40, // Productos premium (precio > 50000)
    standard: 30, // Productos estándar
    basic: 25, // Productos básicos
  },

  /**
   * Calcula el precio de venta basado en costo y margen
   * @param {number} cost - Costo del producto
   * @param {number} marginPercentage - Porcentaje de margen
   * @returns {number} Precio de venta calculado
   */
  calculatePrice: (cost, marginPercentage = null) => {
    const margin = marginPercentage || pricingEngine.DEFAULT_MARGIN_PERCENTAGE;
    if (cost <= 0) return 0;
    return Math.round(cost * (1 + margin / 100));
  },

  /**
   * Calcula el margen basado en costo y precio de venta
   * @param {number} cost - Costo del producto
   * @param {number} price - Precio de venta
   * @returns {number} Porcentaje de margen
   */
  calculateMargin: (cost, price) => {
    if (cost <= 0 || price <= 0) return 0;
    return Math.round(((price - cost) / cost) * 100);
  },

  /**
   * Determina la categoría del producto basado en su precio
   * @param {number} price - Precio del producto
   * @returns {string} Categoría del producto
   */
  getProductCategory: (price) => {
    if (price > 50000) return "premium";
    if (price >= 25000) return "standard";
    return "basic";
  },

  /**
   * Calcula el precio recomendado para un producto
   * @param {Object} product - Producto
   * @param {number} cost - Costo del producto (si no está en el producto)
   * @param {string} category - Categoría del producto (opcional)
   * @returns {Object} Información de precio calculado
   */
  calculateRecommendedPrice: (product, cost = null, category = null) => {
    // Obtener costo del producto o usar el proporcionado
    const productCost = cost || Number(product.cost || 0) || Number(product.price || 0) * 0.7; // Estimación si no hay costo

    // Determinar categoría
    const productCategory =
      category ||
      pricingEngine.getProductCategory(Number(product.price || 0));

    // Obtener margen según categoría
    const marginPercentage =
      pricingEngine.MARGINS_BY_CATEGORY[productCategory] ||
      pricingEngine.DEFAULT_MARGIN_PERCENTAGE;

    // Calcular precio recomendado
    const recommendedPrice = pricingEngine.calculatePrice(
      productCost,
      marginPercentage
    );

    // Calcular margen actual si existe precio
    const currentPrice = Number(product.price || 0);
    const currentMargin =
      currentPrice > 0
        ? pricingEngine.calculateMargin(productCost, currentPrice)
        : null;

    return {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      cost: productCost,
      currentPrice: currentPrice || null,
      recommendedPrice,
      marginPercentage,
      currentMargin,
      category: productCategory,
      priceDifference: currentPrice
        ? recommendedPrice - currentPrice
        : recommendedPrice,
      recommendation:
        currentPrice === 0
          ? "Sin precio actual"
          : currentPrice < recommendedPrice * 0.9
          ? "Aumentar precio"
          : currentPrice > recommendedPrice * 1.1
          ? "Reducir precio"
          : "Precio adecuado",
    };
  },

  /**
   * Calcula precios recomendados para todos los productos
   * @param {Array} products - Lista de productos
   * @returns {Array} Lista de recomendaciones de precio
   */
  calculateAllRecommendedPrices: (products) => {
    return products.map((product) =>
      pricingEngine.calculateRecommendedPrice(product)
    );
  },

  /**
   * Aplica precios recomendados a productos
   * @param {Array} products - Lista de productos
   * @param {boolean} onlyIfLower - Solo aplicar si el precio recomendado es menor
   * @returns {Array} Productos con precios actualizados
   */
  applyRecommendedPrices: (products, onlyIfLower = false) => {
    return products.map((product) => {
      const recommendation = pricingEngine.calculateRecommendedPrice(product);
      const newPrice = onlyIfLower
        ? Math.min(
            Number(product.price || 0) || recommendation.recommendedPrice,
            recommendation.recommendedPrice
          )
        : recommendation.recommendedPrice;

      return {
        ...product,
        price: newPrice,
        previousPrice: product.price,
        priceUpdated: new Date().toISOString(),
      };
    });
  },

  /**
   * Genera resumen de análisis de precios
   * @param {Array} products - Lista de productos
   * @returns {Object} Resumen de análisis
   */
  getPricingSummary: (products) => {
    const recommendations = pricingEngine.calculateAllRecommendedPrices(products);
    const productsNeedingIncrease = recommendations.filter(
      (r) => r.recommendation === "Aumentar precio"
    );
    const productsNeedingDecrease = recommendations.filter(
      (r) => r.recommendation === "Reducir precio"
    );
    const productsWithAdequatePrice = recommendations.filter(
      (r) => r.recommendation === "Precio adecuado"
    );

    const totalPotentialRevenue = recommendations.reduce(
      (sum, r) => sum + (r.recommendedPrice - (r.currentPrice || 0)),
      0
    );

    return {
      totalProducts: products.length,
      productsNeedingIncrease: {
        count: productsNeedingIncrease.length,
        products: productsNeedingIncrease,
      },
      productsNeedingDecrease: {
        count: productsNeedingDecrease.length,
        products: productsNeedingDecrease,
      },
      productsWithAdequatePrice: {
        count: productsWithAdequatePrice.length,
        products: productsWithAdequatePrice,
      },
      totalPotentialRevenue,
      recommendations,
    };
  },
};

// Exportar para uso global
window.pricingEngine = pricingEngine;
