/**
 * Dashboard Centro de Control para KPIs y Automatización
 * Proporciona métricas clave y controles de automatización
 */

const kpiDashboard = {
  /**
   * Calcula KPIs principales del inventario
   * @param {Array} products - Lista de productos
   * @returns {Object} KPIs calculados
   */
  calculateKPIs: (products) => {
    if (!products || products.length === 0) {
      console.warn("[KPI] No hay productos para calcular KPIs");
      return {
        inventory: { totalProducts: 0, totalStock: 0, totalValue: 0, averagePrice: 0, averageStock: 0 },
        alerts: { totalAlerts: 0, lowStock: 0, criticalStock: 0, outOfStock: 0 },
        anticipation: { productsNeedingRestock: 0, totalRecommendedOrder: 0, urgentProducts: { count: 0 } },
        pricing: { productsNeedingPriceAdjustment: 0, potentialRevenueIncrease: 0, productsWithAdequatePrice: 0 },
        health: { score: 0, status: "critico" }
      };
    }

    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    );
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
      0
    );
    const averagePrice = products.length > 0
      ? products.reduce((sum, p) => sum + Number(p.price || 0), 0) / products.length
      : 0;

    // Obtener alertas
    const alerts = typeof alertService !== "undefined" && alertService.getAlertsSummary
      ? alertService.getAlertsSummary(products)
      : { totalAlerts: 0, lowStock: { count: 0 }, criticalStock: { count: 0 }, outOfStock: { count: 0 } };

    // Obtener anticipación
    const anticipation = typeof anticipationService !== "undefined" && anticipationService.getAnticipationSummary
      ? anticipationService.getAnticipationSummary(products)
      : { totalProductsNeedingRestock: 0, totalRecommendedOrder: 0, urgentProducts: { count: 0 } };

    // Obtener análisis de precios
    const pricing = typeof pricingEngine !== "undefined" && pricingEngine.getPricingSummary
      ? pricingEngine.getPricingSummary(products)
      : { productsNeedingIncrease: { count: 0 }, productsNeedingDecrease: { count: 0 }, totalPotentialRevenue: 0, productsWithAdequatePrice: { count: 0 } };

    console.log("[KPI] Calculando KPIs:", {
      totalProducts,
      alerts: alerts.totalAlerts,
      anticipation: anticipation.totalProductsNeedingRestock,
      pricing: pricing.productsNeedingIncrease.count + pricing.productsNeedingDecrease.count
    });

    return {
      inventory: {
        totalProducts,
        totalStock,
        totalValue,
        averagePrice: Math.round(averagePrice),
        averageStock: totalProducts > 0 ? Math.round(totalStock / totalProducts) : 0,
      },
      alerts: {
        totalAlerts: alerts.totalAlerts,
        lowStock: alerts.lowStock.count,
        criticalStock: alerts.criticalStock.count,
        outOfStock: alerts.outOfStock.count,
      },
      anticipation: {
        productsNeedingRestock: anticipation.totalProductsNeedingRestock,
        totalRecommendedOrder: anticipation.totalRecommendedOrder,
        urgentProducts: anticipation.urgentProducts.count,
      },
      pricing: {
        productsNeedingPriceAdjustment:
          pricing.productsNeedingIncrease.count +
          pricing.productsNeedingDecrease.count,
        potentialRevenueIncrease: pricing.totalPotentialRevenue,
        productsWithAdequatePrice: pricing.productsWithAdequatePrice.count,
      },
      health: {
        score: kpiDashboard.calculateHealthScore(alerts, anticipation, pricing),
        status: kpiDashboard.getHealthStatus(alerts, anticipation, pricing),
      },
    };
  },

  /**
   * Calcula el score de salud del inventario (0-100)
   * @param {Object} alerts - Resumen de alertas
   * @param {Object} anticipation - Resumen de anticipación
   * @param {Object} pricing - Resumen de precios
   * @returns {number} Score de salud
   */
  calculateHealthScore: (alerts, anticipation, pricing) => {
    let score = 100;

    // Penalizar por alertas (valores reducidos)
    score -= alerts.totalAlerts * 1;  // Reducido de 5 a 1
    score -= alerts.criticalStock.count * 3;  // Reducido de 10 a 3
    score -= alerts.outOfStock.count * 5;  // Reducido de 15 a 5

    // Penalizar por productos que necesitan reabastecimiento urgente
    score -= anticipation.urgentProducts.count * 2;  // Reducido de 8 a 2

    // Penalizar por productos con precios inadecuados
    score -= (pricing.productsNeedingIncrease.count + pricing.productsNeedingDecrease.count) * 0.5;  // Reducido de 2 a 0.5

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  /**
   * Obtiene el estado de salud del inventario
   * @param {Object} alerts - Resumen de alertas
   * @param {Object} anticipation - Resumen de anticipación
   * @param {Object} pricing - Resumen de precios
   * @returns {string} Estado de salud
   */
  getHealthStatus: (alerts, anticipation, pricing) => {
    const score = kpiDashboard.calculateHealthScore(alerts, anticipation, pricing);

    if (score >= 80) return "excelente";
    if (score >= 60) return "bueno";
    if (score >= 40) return "regular";
    return "critico";
  },

  /**
   * Genera recomendaciones automáticas
   * @param {Array} products - Lista de productos
   * @returns {Array} Lista de recomendaciones
   */
  generateRecommendations: (products) => {
    const recommendations = [];
    const alerts = alertService.getAlertsSummary(products);
    const anticipation = anticipationService.getAnticipationSummary(products);
    const pricing = pricingEngine.getPricingSummary(products);

    // Recomendaciones de stock
    if (alerts.outOfStock.count > 0) {
      recommendations.push({
        type: "urgent",
        category: "stock",
        message: `${alerts.outOfStock.count} productos sin stock. Reabastecer inmediatamente.`,
        action: "restock",
        products: alerts.outOfStock.products,
      });
    }

    if (alerts.criticalStock.count > 0) {
      recommendations.push({
        type: "high",
        category: "stock",
        message: `${alerts.criticalStock.count} productos con stock crítico.`,
        action: "restock",
        products: alerts.criticalStock.products,
      });
    }

    // Recomendaciones de anticipación
    if (anticipation.urgentProducts.count > 0) {
      recommendations.push({
        type: "high",
        category: "anticipation",
        message: `${anticipation.urgentProducts.count} productos necesitarán reabastecimiento en menos de 3 días.`,
        action: "order",
        products: anticipation.urgentProducts.products,
      });
    }

    // Recomendaciones de precios
    if (pricing.productsNeedingIncrease.count > 0) {
      recommendations.push({
        type: "medium",
        category: "pricing",
        message: `${pricing.productsNeedingIncrease.count} productos con precios por debajo del recomendado.`,
        action: "adjust_prices",
        products: pricing.productsNeedingIncrease.products,
      });
    }

    return recommendations.sort((a, b) => {
      const priority = { urgent: 3, high: 2, medium: 1, low: 0 };
      return priority[b.type] - priority[a.type];
    });
  },
};

// Exportar para uso global
window.kpiDashboard = kpiDashboard;
