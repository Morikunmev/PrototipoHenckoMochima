const excelService = {
  exportToExcel: (products) => {
    // Eliminar 'id' para la exportación
    const productsToExport = products.map(({ id, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(productsToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "Inventario.xlsx");
  },
  importFromExcel: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          // Mapear las propiedades del Excel a las propiedades esperadas por la aplicación
          const mappedProducts = json.map((product, index) => {
            const mapped = {
              id: Date.now() + index + Math.random() * 1000, // Generar ID único
              sku: product.SKU || product.sku || `ITEM${index + 1}`,
              name:
                product.Nombre ||
                product.nombre ||
                product.name ||
                `Producto ${index + 1}`,
              quantity: Number(
                product.Cantidad || product.cantidad || product.quantity || 0
              ),
              cost: product.Costo || product.costo || product.cost ? Number(product.Costo || product.costo || product.cost) : null,
              price: Number(
                product.Precio || product.precio || product.price || 0
              ),
            };
            return mapped;
          });

          // Eliminar duplicados por SKU (tarea 2.4)
          const existingProducts = productService.getProducts();
          const existingSkus = new Set(existingProducts.map((p) => p.sku));
          
          const uniqueProducts = [];
          const duplicates = [];
          const skusSeen = new Set();

          mappedProducts.forEach((product) => {
            const sku = product.sku;
            
            // Si el SKU ya existe en el inventario actual, actualizar en lugar de duplicar
            if (existingSkus.has(sku)) {
              const existingProduct = existingProducts.find((p) => p.sku === sku);
              if (existingProduct) {
                // Actualizar producto existente con datos del Excel
                uniqueProducts.push({
                  ...existingProduct,
                  name: product.name,
                  quantity: product.quantity,
                  cost: product.cost !== undefined ? product.cost : existingProduct.cost,
                  price: product.price,
                });
                duplicates.push({ sku, action: "updated" });
              }
            } else if (!skusSeen.has(sku)) {
              // SKU nuevo y único
              uniqueProducts.push(product);
              skusSeen.add(sku);
            } else {
              // SKU duplicado en el mismo archivo Excel
              duplicates.push({ sku, action: "skipped" });
            }
          });

          console.log(
            `✅ [EXCEL] Importación completada: ${uniqueProducts.length} productos únicos, ${duplicates.length} duplicados manejados`
          );
          
          if (duplicates.length > 0) {
            console.log(`⚠️ [EXCEL] Duplicados detectados y manejados:`, duplicates);
          }
          
          resolve(uniqueProducts);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  },
};
