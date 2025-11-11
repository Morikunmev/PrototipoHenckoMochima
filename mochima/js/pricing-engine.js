/**
 * Motor de Cálculo Automático de Precios (HU002) - Mochima
 * Calcula precios automáticamente basado en costos variables (especial pollo)
 */

const pricingEngine = {
  // Configuración de márgenes para comida
  DEFAULT_MARGIN_PERCENTAGE: 35, // 35% de margen por defecto para comida
  MIN_MARGIN_PERCENTAGE: 20, // Margen mínimo
  MAX_MARGIN_PERCENTAGE: 45, // Margen máximo

  // Márgenes específicos por tipo de producto
  MARGINS_BY_CATEGORY: {
    premium: 40, // Productos premium (sashimi, etc.)
    standard: 35, // Productos estándar
    basic: 30, // Productos básicos
  },

  // Costos variables especiales (ej: pollo)
  VARIABLE_COSTS: {
    pollo: {
      baseCost: 3500,
      volatility: 0.15, // 15% de variabilidad
    },
    salmon: {
      baseCost: 8000,
      volatility: 0.20,
    },
    atun: {
      baseCost: 6000,
      volatility: 0.18,
    },
  },

  /**
   * Calcula el costo variable actual de un ingrediente
   * @param {string} ingredient - Nombre del ingrediente
   * @returns {number} Costo actual estimado
   */
  getVariableCost: (ingredient) => {
    const variableCost = pricingEngine.VARIABLE_COSTS[ingredient.toLowerCase()];
    if (!variableCost) return null;

    // Simular variabilidad del costo
    const variation =
      variableCost.baseCost * variableCost.volatility * (Math.random() - 0.5);
    return Math.round(variableCost.baseCost + variation);
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
    if (price > 12000) return "premium";
    if (price >= 6000) return "standard";
    return "basic";
  },

  /**
   * Detecta ingredientes variables en el nombre del producto
   * @param {string} productName - Nombre del producto
   * @returns {Array} Ingredientes variables detectados
   */
  detectVariableIngredients: (productName) => {
    const name = productName.toLowerCase();
    const detected = [];

    Object.keys(pricingEngine.VARIABLE_COSTS).forEach((ingredient) => {
      if (name.includes(ingredient)) {
        detected.push(ingredient);
      }
    });

    return detected;
  },

  /**
   * Calcula el precio recomendado para un producto
   * @param {Object} product - Producto
   * @param {number} cost - Costo del producto (si no está en el producto)
   * @param {string} category - Categoría del producto (opcional)
   * @returns {Object} Información de precio calculado
   */
  calculateRecommendedPrice: (product, cost = null, category = null) => {
    // Obtener costo base
    let productCost = cost || Number(product.cost || 0);

    // Si no hay costo, estimar basado en precio actual
    if (!productCost || productCost === 0) {
      productCost = Number(product.price || 0) * 0.65; // Estimación 65% del precio
    }

    // Detectar ingredientes variables y ajustar costo
    const variableIngredients = pricingEngine.detectVariableIngredients(
      product.name || ""
    );
    if (variableIngredients.length > 0) {
      // Ajustar costo basado en ingredientes variables
      variableIngredients.forEach((ingredient) => {
        const variableCost = pricingEngine.getVariableCost(ingredient);
        if (variableCost) {
          // Aumentar costo base en proporción al ingrediente variable
          productCost += variableCost * 0.3; // 30% del costo variable
        }
      });
    }

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
      cost: Math.round(productCost),
      currentPrice: currentPrice || null,
      recommendedPrice,
      marginPercentage,
      currentMargin,
      category: productCategory,
      variableIngredients,
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
