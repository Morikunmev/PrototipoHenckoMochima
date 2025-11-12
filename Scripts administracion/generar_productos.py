#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script unificado para generar archivos Excel con productos de muestra
para Hencho TCG y Mochima
"""

import pandas as pd
import random
from datetime import datetime
import os

def generar_productos_hencho_tcg():
    """Genera productos de muestra para Hencho TCG"""
    
    productos = [
        {"sku": "PKM001", "nombre": "Charizard VMAX Brillante", "cantidad": 5, "precio": 45000},
        {"sku": "PKM002", "nombre": "Pikachu V-UNION", "cantidad": 8, "precio": 25000},
        {"sku": "PKM003", "nombre": "Mewtwo GX Rainbow", "cantidad": 3, "precio": 38000},
        {"sku": "PKM004", "nombre": "Lugia V Alt Art", "cantidad": 6, "precio": 32000},
        {"sku": "PKM005", "nombre": "Rayquaza VMAX Shiny", "cantidad": 4, "precio": 55000},
        {"sku": "PKM006", "nombre": "Blastoise VMAX", "cantidad": 7, "precio": 28000},
        {"sku": "PKM007", "nombre": "Venusaur VMAX", "cantidad": 6, "precio": 26000},
        {"sku": "PKM008", "nombre": "Mew VMAX Fusion Strike", "cantidad": 5, "precio": 35000},
        {"sku": "PKM009", "nombre": "Gengar VMAX Chilling Reign", "cantidad": 4, "precio": 42000},
        {"sku": "PKM010", "nombre": "Espeon VMAX Evolving Skies", "cantidad": 6, "precio": 30000},
        {"sku": "PKM011", "nombre": "Umbreon VMAX Alt Art", "cantidad": 3, "precio": 48000},
        {"sku": "PKM012", "nombre": "Dragonite V Alt Art", "cantidad": 5, "precio": 33000},
        {"sku": "PKM013", "nombre": "Tyranitar VMAX", "cantidad": 4, "precio": 36000},
        {"sku": "PKM014", "nombre": "Machamp VMAX", "cantidad": 7, "precio": 27000},
        {"sku": "PKM015", "nombre": "Alakazam VMAX", "cantidad": 5, "precio": 31000},
        {"sku": "PKM016", "nombre": "Gyarados VMAX", "cantidad": 6, "precio": 29000},
        {"sku": "PKM017", "nombre": "Snorlax VMAX", "cantidad": 8, "precio": 24000},
        {"sku": "PKM018", "nombre": "Lucario VMAX", "cantidad": 5, "precio": 34000},
        {"sku": "PKM019", "nombre": "Gardevoir VMAX", "cantidad": 4, "precio": 37000},
        {"sku": "PKM020", "nombre": "Metagross VMAX", "cantidad": 6, "precio": 32000},
        {"sku": "PKM021", "nombre": "Arceus VSTAR Brillante", "cantidad": 2, "precio": 65000},
        {"sku": "PKM022", "nombre": "Mewtwo VSTAR", "cantidad": 4, "precio": 52000},
        {"sku": "PKM023", "nombre": "Lugia VSTAR", "cantidad": 3, "precio": 58000},
        {"sku": "PKM024", "nombre": "Giratina VSTAR", "cantidad": 2, "precio": 62000},
        {"sku": "PKM025", "nombre": "Palkia VSTAR", "cantidad": 3, "precio": 55000},
        {"sku": "PKM026", "nombre": "Dialga VSTAR", "cantidad": 3, "precio": 56000},
        {"sku": "PKM027", "nombre": "Regigigas VMAX", "cantidad": 4, "precio": 48000},
        {"sku": "PKM028", "nombre": "Zacian VSTAR", "cantidad": 5, "precio": 45000},
        {"sku": "PKM029", "nombre": "Zamazenta VSTAR", "cantidad": 4, "precio": 46000},
        {"sku": "PKM030", "nombre": "Eternatus VMAX", "cantidad": 3, "precio": 51000}
    ]
    
    return productos

def generar_productos_mochima():
    """Genera productos de muestra para Mochima"""
    
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
    
    return productos

def generar_archivos_excel():
    """Genera ambos archivos Excel"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Generar productos Hencho TCG
    print("Generando productos para Hencho TCG...")
    productos_hencho = generar_productos_hencho_tcg()
    df_hencho = pd.DataFrame(productos_hencho)
    archivo_hencho = f"productos_hencho_tcg_{timestamp}.xlsx"
    df_hencho.to_excel(archivo_hencho, index=False, sheet_name="Productos")
    
    # Generar productos Mochima
    print("Generando productos para Mochima...")
    productos_mochima = generar_productos_mochima()
    df_mochima = pd.DataFrame(productos_mochima)
    archivo_mochima = f"productos_mochima_{timestamp}.xlsx"
    df_mochima.to_excel(archivo_mochima, index=False, sheet_name="Productos")
    
    # Mostrar resumen
    print("\n" + "="*60)
    print("RESUMEN DE ARCHIVOS GENERADOS")
    print("="*60)
    
    print(f"\nHENCHO TCG:")
    print(f"   Archivo: {archivo_hencho}")
    print(f"   Productos: {len(productos_hencho)}")
    print(f"   Valor total: ${df_hencho['cantidad'].sum() * df_hencho['precio'].mean():,.0f} CLP")
    print(f"   Stock total: {df_hencho['cantidad'].sum()} unidades")
    
    print(f"\nMOCHIMA:")
    print(f"   Archivo: {archivo_mochima}")
    print(f"   Productos: {len(productos_mochima)}")
    print(f"   Valor total: ${df_mochima['cantidad'].sum() * df_mochima['precio'].mean():,.0f} CLP")
    print(f"   Stock total: {df_mochima['cantidad'].sum()} unidades")
    
    print(f"\nArchivos generados exitosamente!")
    print(f"Puedes importar estos archivos en sus respectivos dashboards.")
    
    return archivo_hencho, archivo_mochima

if __name__ == "__main__":
    print("Generador de Productos de Muestra")
    print("="*40)
    archivos = generar_archivos_excel()
    print(f"\nArchivos creados: {archivos[0]}, {archivos[1]}")
