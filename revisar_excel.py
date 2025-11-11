#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para revisar el contenido del archivo Excel de Hencho TCG
"""

import pandas as pd
import os

def revisar_excel_hencho_tcg():
    """Revisa el archivo Excel de Hencho TCG"""
    
    archivo = "productos_hencho_tcg_20251012_201624.xlsx"
    
    if not os.path.exists(archivo):
        print(f"ERROR: El archivo {archivo} no existe")
        return
    
    print("=" * 70)
    print("REVISION DEL ARCHIVO EXCEL - HENCHO TCG")
    print("=" * 70)
    
    # Leer el archivo Excel
    try:
        df = pd.read_excel(archivo)
        
        print(f"\nArchivo: {archivo}")
        print(f"Hoja: Productos")
        print(f"Total de filas: {len(df)}")
        
        # Mostrar columnas
        print(f"\nColumnas encontradas:")
        for i, col in enumerate(df.columns, 1):
            print(f"   {i}. {col}")
        
        # Verificar formato esperado
        columnas_esperadas = ['sku', 'nombre', 'cantidad', 'precio']
        columnas_encontradas = [col.lower() for col in df.columns]
        
        print(f"\nVerificacion de formato:")
        for col_esperada in columnas_esperadas:
            if col_esperada in columnas_encontradas:
                print(f"   [OK] {col_esperada.upper()}: Encontrada")
            else:
                print(f"   [ERROR] {col_esperada.upper()}: NO encontrada")
        
        # Mostrar primeras filas
        print(f"\nPrimeras 10 filas del archivo:")
        print("-" * 70)
        print(df.head(10).to_string(index=False))
        
        # Mostrar últimas filas
        print(f"\nUltimas 5 filas del archivo:")
        print("-" * 70)
        print(df.tail(5).to_string(index=False))
        
        # Estadísticas
        print(f"\nESTADISTICAS DEL ARCHIVO:")
        print("-" * 70)
        print(f"   Total de productos: {len(df)}")
        
        # Calcular estadísticas según las columnas encontradas
        if 'cantidad' in df.columns:
            print(f"   Stock total: {df['cantidad'].sum()} unidades")
            print(f"   Cantidad promedio: {df['cantidad'].mean():.2f} unidades")
            print(f"   Cantidad minima: {df['cantidad'].min()} unidades")
            print(f"   Cantidad maxima: {df['cantidad'].max()} unidades")
        
        if 'precio' in df.columns:
            print(f"   Precio promedio: ${df['precio'].mean():,.0f} CLP")
            print(f"   Precio minimo: ${df['precio'].min():,.0f} CLP")
            print(f"   Precio maximo: ${df['precio'].max():,.0f} CLP")
            
            if 'cantidad' in df.columns:
                valor_total = (df['cantidad'] * df['precio']).sum()
                print(f"   Valor total del inventario: ${valor_total:,.0f} CLP")
        
        # Verificar datos nulos
        print(f"\nVERIFICACION DE CALIDAD DE DATOS:")
        print("-" * 70)
        nulos = df.isnull().sum()
        if nulos.sum() == 0:
            print("   [OK] No hay valores nulos en el archivo")
        else:
            print("   [ADVERTENCIA] Valores nulos encontrados:")
            for col, count in nulos.items():
                if count > 0:
                    print(f"      - {col}: {count} valores nulos")
        
        # Verificar tipos de datos
        print(f"\nTIPOS DE DATOS:")
        print("-" * 70)
        for col, dtype in df.dtypes.items():
            print(f"   {col}: {dtype}")
        
        # Verificar duplicados
        print(f"\nVERIFICACION DE DUPLICADOS:")
        print("-" * 70)
        if 'sku' in df.columns:
            duplicados_sku = df['sku'].duplicated().sum()
            if duplicados_sku == 0:
                print("   [OK] No hay SKUs duplicados")
            else:
                print(f"   [ADVERTENCIA] {duplicados_sku} SKUs duplicados encontrados")
        
        # Verificar formato de SKU
        if 'sku' in df.columns:
            print(f"\nFORMATO DE SKUs:")
            print("-" * 70)
            skus_validos = df['sku'].str.match(r'^PKM\d{3}$', na=False).sum()
            print(f"   SKUs con formato PKM###: {skus_validos}/{len(df)}")
            if skus_validos < len(df):
                print(f"   [ADVERTENCIA] {len(df) - skus_validos} SKUs no tienen el formato esperado")
                skus_invalidos = df[~df['sku'].str.match(r'^PKM\d{3}$', na=False)]
                print(f"   SKUs con formato incorrecto:")
                for idx, row in skus_invalidos.iterrows():
                    print(f"      - Fila {idx + 2}: {row['sku']}")
        
        print("\n" + "=" * 70)
        print("[OK] Revision completada")
        print("=" * 70)
        
    except Exception as e:
        print(f"[ERROR] Error al leer el archivo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    revisar_excel_hencho_tcg()
