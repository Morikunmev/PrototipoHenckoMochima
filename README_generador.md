# 🚀 Generador de Productos de Muestra

Este directorio contiene scripts para generar archivos Excel con productos de muestra para los dashboards de **Hencho TCG** y **Mochima**.

## 📁 Archivos Incluidos

### Scripts Python

- `generar_productos.py` - Script principal que genera ambos archivos
- `generar_productos_hencho_tcg.py` - Solo productos para Hencho TCG
- `generar_productos_mochima.py` - Solo productos para Mochima

### Archivos de Configuración

- `requirements.txt` - Dependencias de Python necesarias
- `generar_productos.bat` - Script para Windows (doble clic para ejecutar)

## 🛠️ Instalación y Uso

### Opción 1: Usar el archivo .bat (Windows)

1. **Doble clic** en `generar_productos.bat`
2. El script verificará Python y las dependencias automáticamente
3. Se generarán los archivos Excel

### Opción 2: Usar Python directamente

#### 1. Instalar Python

- Descargar desde [python.org](https://python.org)
- Asegurarse de marcar "Add Python to PATH" durante la instalación

#### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 3. Ejecutar el script

```bash
# Generar ambos archivos
python generar_productos.py

# O generar individualmente
python generar_productos_hencho_tcg.py
python generar_productos_mochima.py
```

## 📊 Productos Generados

### 🎴 Hencho TCG

- **30 productos** de cartas Pokémon/TCG
- SKUs: PKM001 - PKM030
- Precios: $24,000 - $65,000 CLP
- Ejemplos: Charizard VMAX, Pikachu V-UNION, Mewtwo GX

### 🍱 Mochima

- **30 productos** de comida japonesa
- SKUs: MOCH001 - MOCH030
- Precios: $3,500 - $18,000 CLP
- Ejemplos: Ramen Tonkotsu, Sushi Nigiri, Gyoza

## 📋 Formato de Archivos

Los archivos Excel generados contienen las siguientes columnas:

- **SKU**: Código único del producto
- **Nombre**: Nombre descriptivo del producto
- **Cantidad**: Stock disponible
- **Precio**: Precio en CLP

## 🔄 Uso en los Dashboards

1. **Ejecutar el script** para generar los archivos Excel
2. **Abrir el dashboard** correspondiente (Hencho TCG o Mochima)
3. **Hacer clic en "Importar Excel"**
4. **Seleccionar el archivo** generado
5. **¡Listo!** Los productos aparecerán en la tabla

## ⚠️ Requisitos del Sistema

- **Python 3.7+**
- **pandas** (para manejo de datos)
- **openpyxl** (para archivos Excel)
- **Windows/Linux/Mac** (compatible con todos)

## 🎯 Características

- ✅ **Archivos únicos** con timestamp para evitar sobrescritura
- ✅ **Datos realistas** con precios y cantidades apropiadas
- ✅ **Formato compatible** con el sistema de importación
- ✅ **Fácil de usar** con scripts automatizados
- ✅ **Documentación completa** con instrucciones paso a paso

## 🆘 Solución de Problemas

### Error: "Python no encontrado"

- Instalar Python desde [python.org](https://python.org)
- Asegurarse de marcar "Add Python to PATH"

### Error: "ModuleNotFoundError: No module named 'pandas'"

```bash
pip install pandas openpyxl
```

### Error: "Permission denied"

- Ejecutar como administrador
- Verificar que el directorio no esté protegido

## 📞 Soporte

Si tienes problemas con los scripts, verifica:

1. ✅ Python está instalado correctamente
2. ✅ Las dependencias están instaladas
3. ✅ Tienes permisos de escritura en el directorio
4. ✅ El archivo .bat se ejecuta desde el directorio correcto

---

**¡Disfruta generando productos de muestra para tus dashboards!** 🎉
