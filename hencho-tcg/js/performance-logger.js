/**
 * Sistema de Logging de Rendimiento
 * Registra tiempos de ejecución de operaciones para análisis de rendimiento
 */

class PerformanceLogger {
  constructor() {
    this.logs = [];
    this.isEnabled = true;
    this.startTimes = new Map();
  }

  /**
   * Inicia el cronómetro para una operación
   * @param {string} operation - Nombre de la operación
   * @param {string} details - Detalles adicionales
   */
  startTimer(operation, details = "") {
    if (!this.isEnabled) return;

    const timestamp = Date.now();
    const key = `${operation}_${timestamp}`;
    this.startTimes.set(key, {
      operation,
      details,
      startTime: performance.now(),
      timestamp: new Date().toISOString(),
    });

    console.log(
      `🚀 [PERFORMANCE] Iniciando: ${operation}${
        details ? ` - ${details}` : ""
      }`
    );
    return key;
  }

  /**
   * Finaliza el cronómetro y registra el tiempo
   * @param {string} key - Clave del timer iniciado
   * @param {string} additionalInfo - Información adicional
   */
  endTimer(key, additionalInfo = "") {
    if (!this.isEnabled) return;

    const timerData = this.startTimes.get(key);
    if (!timerData) {
      console.warn(`⚠️ [PERFORMANCE] Timer no encontrado: ${key}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - timerData.startTime;

    const logEntry = {
      operation: timerData.operation,
      details: timerData.details,
      duration: Math.round(duration * 100) / 100, // Redondear a 2 decimales
      timestamp: timerData.timestamp,
      endTime: new Date().toISOString(),
      additionalInfo,
    };

    this.logs.push(logEntry);
    this.startTimes.delete(key);

    // Determinar el estado basado en objetivos de rendimiento
    const status = this.getPerformanceStatus(logEntry.operation, duration);
    const statusEmoji =
      status === "Cumple" ? "✅" : status === "Advertencia" ? "⚠️" : "❌";

    console.log(
      `${statusEmoji} [PERFORMANCE] ${logEntry.operation}: ${duration}ms${
        additionalInfo ? ` - ${additionalInfo}` : ""
      } (${status})`
    );

    return logEntry;
  }

  /**
   * Determina el estado de rendimiento basado en objetivos
   * @param {string} operation - Nombre de la operación
   * @param {number} duration - Duración en ms
   */
  getPerformanceStatus(operation, duration) {
    const objectives = {
      Login: 100,
      "CRUD productos": 100,
      "Importar Excel": 5000,
      "Exportar Excel": 3000,
      "Renderizar gráfico": 500,
      "Cargar dashboard": 2000,
      "Guardar producto": 100,
      "Eliminar producto": 100,
      "Renderizar tabla": 200,
      "Renderizar estadísticas": 150,
    };

    const objective = objectives[operation] || 1000;

    if (duration <= objective) {
      return "Cumple";
    } else if (duration <= objective * 1.5) {
      return "Advertencia";
    } else {
      return "No cumple";
    }
  }

  /**
   * Mide una operación completa de forma síncrona
   * @param {string} operation - Nombre de la operación
   * @param {Function} fn - Función a ejecutar
   * @param {string} details - Detalles adicionales
   */
  measureSync(operation, fn, details = "") {
    const key = this.startTimer(operation, details);
    try {
      const result = fn();
      this.endTimer(key);
      return result;
    } catch (error) {
      this.endTimer(key, `ERROR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mide una operación completa de forma asíncrona
   * @param {string} operation - Nombre de la operación
   * @param {Function} fn - Función async a ejecutar
   * @param {string} details - Detalles adicionales
   */
  async measureAsync(operation, fn, details = "") {
    const key = this.startTimer(operation, details);
    try {
      const result = await fn();
      this.endTimer(key);
      return result;
    } catch (error) {
      this.endTimer(key, `ERROR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene el resumen de rendimiento
   */
  getPerformanceSummary() {
    const summary = {};

    this.logs.forEach((log) => {
      if (!summary[log.operation]) {
        summary[log.operation] = {
          count: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
          status: {
            Cumple: 0,
            Advertencia: 0,
            "No cumple": 0,
          },
        };
      }

      const stats = summary[log.operation];
      stats.count++;
      stats.totalTime += log.duration;
      stats.minTime = Math.min(stats.minTime, log.duration);
      stats.maxTime = Math.max(stats.maxTime, log.duration);

      const status = this.getPerformanceStatus(log.operation, log.duration);
      stats.status[status]++;
    });

    // Calcular promedios
    Object.keys(summary).forEach((operation) => {
      const stats = summary[operation];
      stats.avgTime = Math.round((stats.totalTime / stats.count) * 100) / 100;
    });

    return summary;
  }

  /**
   * Exporta los logs a formato CSV
   */
  exportLogsToCSV() {
    if (this.logs.length === 0) {
      console.log("📊 [PERFORMANCE] No hay logs para exportar");
      return;
    }

    const headers = [
      "Operación",
      "Detalles",
      "Duración (ms)",
      "Timestamp",
      "Estado",
    ];
    const csvContent = [
      headers.join(","),
      ...this.logs.map((log) =>
        [
          log.operation,
          `"${log.details}"`,
          log.duration,
          log.timestamp,
          this.getPerformanceStatus(log.operation, log.duration),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance_logs_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Muestra el resumen en consola
   */
  showSummary() {
    const summary = this.getPerformanceSummary();

    console.log("\n📊 ===== RESUMEN DE RENDIMIENTO =====");
    console.table(summary);

    // Mostrar métricas específicas
    console.log("\n🎯 MÉTRICAS DE RENDIMIENTO VALIDADAS:");
    Object.keys(summary).forEach((operation) => {
      const stats = summary[operation];
      const objective = this.getObjective(operation);
      const improvement =
        objective > stats.avgTime
          ? `${Math.round(
              ((objective - stats.avgTime) / objective) * 100
            )}% más rápido`
          : `${Math.round(
              ((stats.avgTime - objective) / objective) * 100
            )}% más lento`;

      console.log(
        `• ${operation}: ${stats.avgTime}ms (Objetivo: ${objective}ms) - ${improvement}`
      );
    });
  }

  /**
   * Obtiene el objetivo de rendimiento para una operación
   */
  getObjective(operation) {
    const objectives = {
      Login: 100,
      "CRUD productos": 100,
      "Importar Excel": 5000,
      "Exportar Excel": 3000,
      "Renderizar gráfico": 500,
      "Cargar dashboard": 2000,
      "Guardar producto": 100,
      "Eliminar producto": 100,
      "Renderizar tabla": 200,
      "Renderizar estadísticas": 150,
    };
    return objectives[operation] || 1000;
  }

  /**
   * Limpia todos los logs
   */
  clearLogs() {
    this.logs = [];
    this.startTimes.clear();
    console.log("🧹 [PERFORMANCE] Logs limpiados");
  }

  /**
   * Habilita/deshabilita el logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(
      `🔧 [PERFORMANCE] Logging ${enabled ? "habilitado" : "deshabilitado"}`
    );
  }
}

// Crear instancia global
window.performanceLogger = new PerformanceLogger();

// Funciones de conveniencia globales
window.startPerformanceTimer = (operation, details) =>
  window.performanceLogger.startTimer(operation, details);
window.endPerformanceTimer = (key, additionalInfo) =>
  window.performanceLogger.endTimer(key, additionalInfo);
window.measurePerformance = (operation, fn, details) =>
  window.performanceLogger.measureSync(operation, fn, details);
window.showPerformanceSummary = () => window.performanceLogger.showSummary();
window.exportPerformanceLogs = () => window.performanceLogger.exportLogsToCSV();

console.log("📊 Sistema de logging de rendimiento inicializado");
console.log("💡 Usa: showPerformanceSummary() para ver el resumen");
console.log("💡 Usa: exportPerformanceLogs() para exportar a CSV");


