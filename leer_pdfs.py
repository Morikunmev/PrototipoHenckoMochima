#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script temporal para leer archivos PDF
"""

import sys

try:
    import PyPDF2
    tiene_pypdf2 = True
except ImportError:
    tiene_pypdf2 = False

try:
    import pdfplumber
    tiene_pdfplumber = True
except ImportError:
    tiene_pdfplumber = False

def leer_pdf_pypdf2(archivo):
    """Lee PDF usando PyPDF2"""
    with open(archivo, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        texto = ""
        for page in reader.pages:
            texto += page.extract_text() + "\n\n"
        return texto

def leer_pdf_pdfplumber(archivo):
    """Lee PDF usando pdfplumber"""
    texto = ""
    with pdfplumber.open(archivo) as pdf:
        for page in pdf.pages:
            texto += page.extract_text() + "\n\n"
    return texto

import os
import glob

# Buscar archivos PDF que empiecen con TRA
archivos = glob.glob("TRA*.pdf")

if not archivos:
    print("No se encontraron archivos PDF que empiecen con TRA")
    sys.exit(1)

for archivo in archivos:
    print("=" * 80)
    print(f"LEYENDO: {archivo}")
    print("=" * 80)
    print()
    
    try:
        if tiene_pdfplumber:
            texto = leer_pdf_pdfplumber(archivo)
        elif tiene_pypdf2:
            texto = leer_pdf_pypdf2(archivo)
        else:
            print("ERROR: No se encontró ninguna librería para leer PDFs")
            print("Instala una de estas: pip install PyPDF2 o pip install pdfplumber")
            continue
        
        # Guardar en archivo de texto para evitar problemas de encoding en consola
        archivo_salida = archivo.replace('.pdf', '_contenido.txt')
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write(texto)
        
        print(f"Contenido extraído y guardado en: {archivo_salida}")
        print(f"Total de caracteres: {len(texto)}")
        print()
        print("PRIMEROS 2000 CARACTERES:")
        print("-" * 80)
        # Mostrar solo los primeros caracteres para evitar problemas de encoding
        try:
            print(texto[:2000])
        except:
            print(texto[:2000].encode('ascii', 'ignore').decode('ascii'))
        print()
        print("=" * 80)
        print()
        
    except Exception as e:
        print(f"ERROR al leer {archivo}: {e}")
        import traceback
        traceback.print_exc()
        print()

