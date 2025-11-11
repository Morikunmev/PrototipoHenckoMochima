#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para revisar el contenido del archivo Excel de Carta Gantt
"""

import pandas as pd
import os

def revisar_carta_gantt():
    """Revisa el archivo Excel de Carta Gantt"""
    
    archivo = "Carta_Gantt_Henko_Mochima_12_Oct_2025.xlsx"
    
    if not os.path.exists(archivo):
        print(f"[ERROR] El archivo {archivo} no existe")
        return
    
    print("=" * 80)
    print("REVISION DEL ARCHIVO EXCEL - CARTA GANTT")
    print("=" * 80)
    
    # Leer el archivo Excel
    try:
        # Primero, verificar qué hojas tiene el archivo
        excel_file = pd.ExcelFile(archivo)
        print(f"\nArchivo: {archivo}")
        print(f"Hojas disponibles: {excel_file.sheet_names}")
        print(f"Total de hojas: {len(excel_file.sheet_names)}")
        
        # Revisar cada hoja
        for sheet_name in excel_file.sheet_names:
            print("\n" + "=" * 80)
            print(f"HOJA: {sheet_name}")
            print("=" * 80)
            
            df = pd.read_excel(archivo, sheet_name=sheet_name)
            
            print(f"\nTotal de filas: {len(df)}")
            print(f"Total de columnas: {len(df.columns)}")
            
            # Mostrar columnas
            print(f"\nColumnas encontradas:")
            for i, col in enumerate(df.columns, 1):
                print(f"   {i}. {col} (tipo: {df[col].dtype})")
            
            # Mostrar primeras filas
            print(f"\nPrimeras 10 filas:")
            print("-" * 80)
            print(df.head(10).to_string(index=False))
            
            # Mostrar últimas filas si hay muchas
            if len(df) > 10:
                print(f"\nUltimas 5 filas:")
                print("-" * 80)
                print(df.tail(5).to_string(index=False))
            
            # Estadísticas básicas
            print(f"\nESTADISTICAS BASICAS:")
            print("-" * 80)
            print(f"   Total de filas: {len(df)}")
            print(f"   Total de columnas: {len(df.columns)}")
            
            # Verificar datos nulos
            print(f"\nVERIFICACION DE CALIDAD DE DATOS:")
            print("-" * 80)
            nulos = df.isnull().sum()
            if nulos.sum() == 0:
                print("   [OK] No hay valores nulos en el archivo")
            else:
                print("   [ADVERTENCIA] Valores nulos encontrados:")
                for col, count in nulos.items():
                    if count > 0:
                        porcentaje = (count / len(df)) * 100
                        print(f"      - {col}: {count} valores nulos ({porcentaje:.1f}%)")
            
            # Verificar tipos de datos
            print(f"\nTIPOS DE DATOS:")
            print("-" * 80)
            for col, dtype in df.dtypes.items():
                valores_unicos = df[col].nunique()
                print(f"   {col}: {dtype} (valores unicos: {valores_unicos})")
            
            # Si hay columnas de fechas, analizarlas
            columnas_fecha = []
            for col in df.columns:
                if 'fecha' in col.lower() or 'date' in col.lower() or 'inicio' in col.lower() or 'fin' in col.lower():
                    columnas_fecha.append(col)
            
            if columnas_fecha:
                print(f"\nANALISIS DE FECHAS:")
                print("-" * 80)
                for col in columnas_fecha:
                    print(f"   Columna: {col}")
                    try:
                        # Intentar convertir a fecha
                        fechas = pd.to_datetime(df[col], errors='coerce')
                        fechas_validas = fechas.notna().sum()
                        print(f"      Fechas validas: {fechas_validas}/{len(df)}")
                        if fechas_validas > 0:
                            print(f"      Fecha minima: {fechas.min()}")
                            print(f"      Fecha maxima: {fechas.max()}")
                    except:
                        print(f"      No se pudo analizar como fecha")
            
            # Si hay columnas numéricas, mostrar estadísticas
            columnas_numericas = df.select_dtypes(include=['int64', 'float64']).columns
            if len(columnas_numericas) > 0:
                print(f"\nESTADISTICAS DE COLUMNAS NUMERICAS:")
                print("-" * 80)
                for col in columnas_numericas:
                    print(f"   {col}:")
                    print(f"      Minimo: {df[col].min()}")
                    print(f"      Maximo: {df[col].max()}")
                    print(f"      Promedio: {df[col].mean():.2f}")
                    print(f"      Mediana: {df[col].median():.2f}")
            
            # Resumen de la hoja
            print(f"\nRESUMEN DE LA HOJA '{sheet_name}':")
            print("-" * 80)
            print(f"   Filas: {len(df)}")
            print(f"   Columnas: {len(df.columns)}")
            print(f"   Valores nulos: {df.isnull().sum().sum()}")
            print(f"   Memoria usada: {df.memory_usage(deep=True).sum() / 1024:.2f} KB")
        
        print("\n" + "=" * 80)
        print("[OK] Revision completada")
        print("=" * 80)
        
    except Exception as e:
        print(f"[ERROR] Error al leer el archivo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    revisar_carta_gantt()
