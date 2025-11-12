#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar archivo Excel con productos de muestra para Hencho TCG
"""

import pandas as pd
import random
from datetime import datetime

def generar_productos_hencho_tcg():
    """Genera productos de muestra para Hencho TCG"""
    
    # Lista de productos Pokémon/TCG
    # El costo se calcula como aproximadamente 60-70% del precio de venta
    productos = [
        {"sku": "PKM001", "nombre": "Charizard VMAX Brillante", "cantidad": 5, "costo": 27000, "precio": 45000},
        {"sku": "PKM002", "nombre": "Pikachu V-UNION", "cantidad": 8, "costo": 15000, "precio": 25000},
        {"sku": "PKM003", "nombre": "Mewtwo GX Rainbow", "cantidad": 3, "costo": 22800, "precio": 38000},
        {"sku": "PKM004", "nombre": "Lugia V Alt Art", "cantidad": 6, "costo": 19200, "precio": 32000},
        {"sku": "PKM005", "nombre": "Rayquaza VMAX Shiny", "cantidad": 4, "costo": 33000, "precio": 55000},
        {"sku": "PKM006", "nombre": "Blastoise VMAX", "cantidad": 7, "costo": 16800, "precio": 28000},
        {"sku": "PKM007", "nombre": "Venusaur VMAX", "cantidad": 6, "costo": 15600, "precio": 26000},
        {"sku": "PKM008", "nombre": "Mew VMAX Fusion Strike", "cantidad": 5, "costo": 21000, "precio": 35000},
        {"sku": "PKM009", "nombre": "Gengar VMAX Chilling Reign", "cantidad": 4, "costo": 25200, "precio": 42000},
        {"sku": "PKM010", "nombre": "Espeon VMAX Evolving Skies", "cantidad": 6, "costo": 18000, "precio": 30000},
        {"sku": "PKM011", "nombre": "Umbreon VMAX Alt Art", "cantidad": 3, "costo": 28800, "precio": 48000},
        {"sku": "PKM012", "nombre": "Dragonite V Alt Art", "cantidad": 5, "costo": 19800, "precio": 33000},
        {"sku": "PKM013", "nombre": "Tyranitar VMAX", "cantidad": 4, "costo": 21600, "precio": 36000},
        {"sku": "PKM014", "nombre": "Machamp VMAX", "cantidad": 7, "costo": 16200, "precio": 27000},
        {"sku": "PKM015", "nombre": "Alakazam VMAX", "cantidad": 5, "costo": 18600, "precio": 31000},
        {"sku": "PKM016", "nombre": "Gyarados VMAX", "cantidad": 6, "costo": 17400, "precio": 29000},
        {"sku": "PKM017", "nombre": "Snorlax VMAX", "cantidad": 8, "costo": 14400, "precio": 24000},
        {"sku": "PKM018", "nombre": "Lucario VMAX", "cantidad": 5, "costo": 20400, "precio": 34000},
        {"sku": "PKM019", "nombre": "Gardevoir VMAX", "cantidad": 4, "costo": 22200, "precio": 37000},
        {"sku": "PKM020", "nombre": "Metagross VMAX", "cantidad": 6, "costo": 19200, "precio": 32000},
        {"sku": "PKM021", "nombre": "Arceus VSTAR Brillante", "cantidad": 2, "costo": 39000, "precio": 65000},
        {"sku": "PKM022", "nombre": "Mewtwo VSTAR", "cantidad": 4, "costo": 31200, "precio": 52000},
        {"sku": "PKM023", "nombre": "Lugia VSTAR", "cantidad": 3, "costo": 34800, "precio": 58000},
        {"sku": "PKM024", "nombre": "Giratina VSTAR", "cantidad": 2, "costo": 37200, "precio": 62000},
        {"sku": "PKM025", "nombre": "Palkia VSTAR", "cantidad": 3, "costo": 33000, "precio": 55000},
        {"sku": "PKM026", "nombre": "Dialga VSTAR", "cantidad": 3, "costo": 33600, "precio": 56000},
        {"sku": "PKM027", "nombre": "Regigigas VMAX", "cantidad": 4, "costo": 28800, "precio": 48000},
        {"sku": "PKM028", "nombre": "Zacian VSTAR", "cantidad": 5, "costo": 27000, "precio": 45000},
        {"sku": "PKM029", "nombre": "Zamazenta VSTAR", "cantidad": 4, "costo": 27600, "precio": 46000},
        {"sku": "PKM030", "nombre": "Eternatus VMAX", "cantidad": 3, "costo": 30600, "precio": 51000}
    ]
    
    # Crear DataFrame
    df = pd.DataFrame(productos)
    
    # Generar nombre de archivo con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_archivo = f"productos_hencho_tcg_{timestamp}.xlsx"
    
    # Guardar como Excel
    df.to_excel(nombre_archivo, index=False, sheet_name="Productos")
    
    print(f"Archivo generado: {nombre_archivo}")
    print(f"Total de productos: {len(productos)}")
    print(f"Valor total del inventario: ${df['cantidad'].sum() * df['precio'].mean():,.0f} CLP")
    print(f"Stock total: {df['cantidad'].sum()} unidades")
    
    return nombre_archivo

if __name__ == "__main__":
    print("Generando productos de muestra para Hencho TCG...")
    archivo = generar_productos_hencho_tcg()
    print(f"\nListo! Archivo {archivo} generado exitosamente.")
    print("Puedes importar este archivo en el dashboard de Hencho TCG.")
