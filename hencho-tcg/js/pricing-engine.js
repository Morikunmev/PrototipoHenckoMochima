/**
 * Motor de Cálculo Automático de Precios (HU002)
 * Calcula precios automáticamente basado en costos y márgenes
 */

const pricingEngine = {
  // Configuración de márgenes por defecto
  DEFAULT_MARGIN_PERCENTAGE: 30, // 30% de margen por defecto
  MIN_MARGIN_PERCENTAGE: 15, // Margen mínimo
  MAX_MARGIN_PERCENTAGE: 50, // Margen máximo

  // Márgenes específicos por tipo de producto (se pueden personalizar)
  getMargins: () => {
    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = localStorage.getItem("hencho_tcg_pricing_config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.margins) {
          return config.margins;
        }
      } catch (e) {
        console.warn("Error al cargar márgenes guardados:", e);
      }
    }
    return {
      premium: 40, // Productos premium (precio > 50000)
      standard: 30, // Productos estándar
      basic: 25, // Productos básicos
    };
  },
  
  // Mantener compatibilidad con código existente
  get MARGINS_BY_CATEGORY() {
    return this.getMargins();
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
    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = localStorage.getItem("hencho_tcg_pricing_config");
    let ranges = {
      premium: { min: 50000, max: null },
      standard: { min: 25000, max: 50000 },
      basic: { min: 0, max: 25000 }
    };
    
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.categoryRanges) {
          ranges = config.categoryRanges;
        }
      } catch (e) {
        console.warn("Error al cargar configuración de precios:", e);
      }
    }
    
    // Orden de verificación: Premium > Standard > Basic
    if (ranges.premium.min && price > ranges.premium.min) return "premium";
    if (ranges.standard.min && ranges.standard.max && price > ranges.standard.min && price <= ranges.standard.max) return "standard";
    // Basic: todos los demás (precio <= basic.max o precio <= standard.min)
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
    // Prioridad: 1) cost proporcionado, 2) product.cost, 3) estimación (70% del precio)
    const productCost = cost !== null ? cost : (Number(product.cost || 0) > 0 ? Number(product.cost) : (Number(product.price || 0) > 0 ? Number(product.price || 0) * 0.7 : 0));

    // Determinar categoría
    const productCategory =
      category ||
      pricingEngine.getProductCategory(Number(product.price || 0));

    // Obtener margen según categoría
    const margins = pricingEngine.getMargins();
    const marginPercentage =
      margins[productCategory] ||
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

    // Calcular potencial solo de productos que necesitan ajuste (excluir los que tienen precio adecuado)
    const productsNeedingAdjustment = [...productsNeedingIncrease, ...productsNeedingDecrease];
    const totalPotentialRevenue = productsNeedingAdjustment.reduce(
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
