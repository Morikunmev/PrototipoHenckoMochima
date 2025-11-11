#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar archivo Excel con productos de muestra para Mochima
"""

import pandas as pd
import random
from datetime import datetime

def generar_productos_mochima():
    """Genera productos de muestra para Mochima"""
    
    # Lista de productos japoneses/comida
    productos = [
        {"sku": "MOCH001", "nombre": "Ramen Tonkotsu Premium", "cantidad": 25, "precio": 8500},
        {"sku": "MOCH002", "nombre": "Sushi Nigiri Salmón", "cantidad": 30, "precio": 12000},
        {"sku": "MOCH003", "nombre": "Gyoza de Cerdo", "cantidad": 40, "precio": 6500},
        {"sku": "MOCH004", "nombre": "Tempura de Camarón", "cantidad": 20, "precio": 9500},
        {"sku": "MOCH005", "nombre": "Yakitori de Pollo", "cantidad": 35, "precio": 7500},
        {"sku": "MOCH006", "nombre": "Miso Soup Tradicional", "cantidad": 50, "precio": 3500},
        {"sku": "MOCH007", "nombre": "California Roll", "cantidad": 28, "precio": 8000},
        {"sku": "MOCH008", "nombre": "Teriyaki de Res", "cantidad": 22, "precio": 11000},
        {"sku": "MOCH009", "nombre": "Edamame Fresco", "cantidad": 45, "precio": 4000},
        {"sku": "MOCH010", "nombre": "Chirashi Bowl", "cantidad": 18, "precio": 13500},
        {"sku": "MOCH011", "nombre": "Takoyaki (8 piezas)", "cantidad": 32, "precio": 7000},
        {"sku": "MOCH012", "nombre": "Onigiri de Atún", "cantidad": 38, "precio": 4500},
        {"sku": "MOCH013", "nombre": "Karaage de Pollo", "cantidad": 26, "precio": 8500},
        {"sku": "MOCH014", "nombre": "Udon de Mariscos", "cantidad": 24, "precio": 10000},
        {"sku": "MOCH015", "nombre": "Sashimi Mixto", "cantidad": 15, "precio": 15000},
        {"sku": "MOCH016", "nombre": "Okonomiyaki", "cantidad": 20, "precio": 9000},
        {"sku": "MOCH017", "nombre": "Matcha Latte", "cantidad": 60, "precio": 3500},
        {"sku": "MOCH018", "nombre": "Dorayaki de Anko", "cantidad": 42, "precio": 5000},
        {"sku": "MOCH019", "nombre": "Taiyaki de Crema", "cantidad": 36, "precio": 4500},
        {"sku": "MOCH020", "nombre": "Mochi de Fresa", "cantidad": 48, "precio": 4000},
        {"sku": "MOCH021", "nombre": "Ramen Shoyu Clásico", "cantidad": 30, "precio": 7500},
        {"sku": "MOCH022", "nombre": "Sashimi de Atún", "cantidad": 12, "precio": 18000},
        {"sku": "MOCH023", "nombre": "Gyoza Vegetariano", "cantidad": 35, "precio": 6000},
        {"sku": "MOCH024", "nombre": "Tempura de Vegetales", "cantidad": 25, "precio": 8000},
        {"sku": "MOCH025", "nombre": "Yakitori de Res", "cantidad": 28, "precio": 8500},
        {"sku": "MOCH026", "nombre": "Miso Soup con Tofu", "cantidad": 40, "precio": 3800},
        {"sku": "MOCH027", "nombre": "Dragon Roll", "cantidad": 22, "precio": 9500},
        {"sku": "MOCH028", "nombre": "Teriyaki de Pollo", "cantidad": 32, "precio": 9000},
        {"sku": "MOCH029", "nombre": "Edamame con Sal", "cantidad": 50, "precio": 3500},
        {"sku": "MOCH030", "nombre": "Poke Bowl Salmón", "cantidad": 20, "precio": 12000}
    ]
    
    # Crear DataFrame
    df = pd.DataFrame(productos)
    
    # Generar nombre de archivo con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_archivo = f"productos_mochima_{timestamp}.xlsx"
    
    # Guardar como Excel
    df.to_excel(nombre_archivo, index=False, sheet_name="Productos")
    
    print(f"✅ Archivo generado: {nombre_archivo}")
    print(f"📊 Total de productos: {len(productos)}")
    print(f"💰 Valor total del inventario: ${df['cantidad'].sum() * df['precio'].mean():,.0f} CLP")
    print(f"📦 Stock total: {df['cantidad'].sum()} unidades")
    
    return nombre_archivo

if __name__ == "__main__":
    print("🍱 Generando productos de muestra para Mochima...")
    archivo = generar_productos_mochima()
    print(f"\n🎉 ¡Listo! Archivo {archivo} generado exitosamente.")
    print("📋 Puedes importar este archivo en el dashboard de Mochima.")
