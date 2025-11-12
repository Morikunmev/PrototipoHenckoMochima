#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para analizar las tareas de la Carta Gantt hasta el 11-11-2025
"""

import pandas as pd
from datetime import datetime

def analizar_tareas_gantt():
    archivo = "Carta_Gantt_Henko_Mochima_12_Oct_2025.xlsx"
    
    try:
        df = pd.read_excel(archivo, sheet_name="Gantt Henko & Mochima")
        
        # Ver nombres de columnas
        print("Columnas encontradas:", list(df.columns)[:10])
        print()
        
        # Buscar columnas por nombre (puede tener caracteres especiales)
        col_tarea = [c for c in df.columns if 'TAREA' in str(c).upper()][0]
        col_responsable = [c for c in df.columns if 'RESPONSABLE' in str(c).upper()][0]
        col_dias = [c for c in df.columns if 'D' in str(c).upper() and 'AS' in str(c).upper()][0] if [c for c in df.columns if 'D' in str(c).upper() and 'AS' in str(c).upper()] else None
        col_inicio = [c for c in df.columns if 'INICIO' in str(c).upper()][0]
        col_fin = [c for c in df.columns if 'FIN' in str(c).upper()][0]
        col_estado = [c for c in df.columns if 'ESTADO' in str(c).upper()][0]
        
        # Filtrar solo filas con tareas (que tengan TAREA no nulo)
        df_tareas = df[df[col_tarea].notna()].copy()
        
        # Convertir fechas
        df_tareas[col_inicio] = pd.to_datetime(df_tareas[col_inicio], errors='coerce')
        df_tareas[col_fin] = pd.to_datetime(df_tareas[col_fin], errors='coerce')
        
        # Fecha límite: 11-11-2025
        fecha_limite = pd.to_datetime('2025-11-11')
        
        print("=" * 80)
        print("TAREAS DE LA CARTA GANTT HASTA EL 11-11-2025")
        print("=" * 80)
        print()
        
        # Filtrar tareas que terminan antes o en el 11-11-2025
        tareas_hasta_limite = df_tareas[df_tareas[col_fin] <= fecha_limite].copy()
        
        print(f"Total de tareas hasta el 11-11-2025: {len(tareas_hasta_limite)}")
        print()
        
        # Mostrar tareas por sprint
        print("TAREAS POR SPRINT:")
        print("-" * 80)
        
        for idx, row in tareas_hasta_limite.iterrows():
            tarea = str(row[col_tarea])
            responsable = str(row[col_responsable]) if pd.notna(row[col_responsable]) else "N/A"
            dias = row[col_dias] if col_dias and pd.notna(row[col_dias]) else "N/A"
            inicio = row[col_inicio].strftime('%d-%m-%Y') if pd.notna(row[col_inicio]) else "N/A"
            fin = row[col_fin].strftime('%d-%m-%Y') if pd.notna(row[col_fin]) else "N/A"
            estado = str(row[col_estado]) if pd.notna(row[col_estado]) else "N/A"
            
            # Determinar si es sprint o subtarea
            if any(palabra in tarea.upper() for palabra in ['SPRINT', 'ANALISIS', 'DISEÑO']):
                print(f"\n[TITULO] {tarea}")
                print(f"   Responsable: {responsable} | Dias: {dias} | {inicio} a {fin} | Estado: {estado}")
            else:
                print(f"   [TAREA] {tarea}")
                print(f"     Responsable: {responsable} | Dias: {dias} | {inicio} a {fin} | Estado: {estado}")
        
        print()
        print("=" * 80)
        print("RESUMEN DE IMPLEMENTACIÓN")
        print("=" * 80)
        
        # Contar tareas completadas
        completadas = tareas_hasta_limite[tareas_hasta_limite[col_estado].str.contains('Completada', case=False, na=False)]
        en_progreso = tareas_hasta_limite[tareas_hasta_limite[col_estado].str.contains('progreso', case=False, na=False)]
        pendientes = tareas_hasta_limite[tareas_hasta_limite[col_estado].str.contains('Pendiente', case=False, na=False)]
        
        print(f"[OK] Completadas: {len(completadas)}")
        print(f"[EN PROGRESO] En progreso: {len(en_progreso)}")
        print(f"[PENDIENTE] Pendientes: {len(pendientes)}")
        print()
        
        # Mostrar tareas pendientes que deberían estar implementadas
        if len(pendientes) > 0:
            print("TAREAS PENDIENTES HASTA EL 11-11-2025:")
            print("-" * 80)
            for idx, row in pendientes.iterrows():
                tarea = str(row[col_tarea])
                fin = row[col_fin].strftime('%d-%m-%Y') if pd.notna(row[col_fin]) else "N/A"
                print(f"   - {tarea} (Fin: {fin})")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analizar_tareas_gantt()
