# 🏗️ ARQUITECTURA DEL PROYECTO - SISTEMA DE INVENTARIO

## 📋 DESCRIPCIÓN GENERAL

Sistema de gestión de inventario para dos empresas (Hencho TCG y Mochima) con autenticación, dashboards independientes, importación/exportación Excel y visualizaciones de datos.

## 🌳 ESTRUCTURA DE ARCHIVOS

```
Prototipo1/
├── 📁 RAIZ (Login y Selección de Empresa)
│   ├── index.html                    # Página principal con login y selección
│   ├── css/style.css                 # Estilos globales y login
│   ├── js/                          # Scripts globales (legacy)
│   │   ├── app.js
│   │   ├── excel.js
│   │   ├── storage.js
│   │   └── ui.js
│   └── lib/                         # Librerías externas
│       ├── chart.min.js             # Chart.js para gráficos
│       └── xlsx.full.min.js         # SheetJS para Excel
│
├── 📁 HENCHO-TCG/ (Dashboard Empresa 1)
│   ├── index.html                   # Dashboard específico Hencho TCG
│   ├── css/style.css                # Estilos específicos (tema azul)
│   ├── js/                          # Lógica específica Hencho TCG
│   │   ├── app.js                   # Controlador principal
│   │   ├── excel.js                 # Importación/exportación Excel
│   │   ├── storage.js               # Gestión localStorage (hencho_tcg_products)
│   │   └── ui.js                    # Interfaz de usuario
│   ├── lib/                         # Librerías específicas
│   │   ├── chart.min.js
│   │   └── xlsx.full.min.js
│   └── productos_muestra.html      # Página de muestra (legacy)
│
├── 📁 MOCHIMA/ (Dashboard Empresa 2)
│   ├── index.html                   # Dashboard específico Mochima
│   ├── css/style.css                # Estilos específicos (tema rojo/naranja)
│   ├── js/                          # Lógica específica Mochima
│   │   ├── app.js                   # Controlador principal
│   │   ├── excel.js                 # Importación/exportación Excel
│   │   ├── storage.js               # Gestión localStorage (mochima_products)
│   │   └── ui.js                    # Interfaz de usuario
│   ├── lib/                         # Librerías específicas
│   │   ├── chart.min.js
│   │   └── xlsx.full.min.js
│   └── productos_muestra.html      # Página de muestra (legacy)
│
├── 📁 GENERADORES EXCEL
│   ├── generar_productos.py         # Script principal unificado
│   ├── generar_productos_hencho_tcg.py  # Generador específico Hencho TCG
│   ├── generar_productos_mochima.py    # Generador específico Mochima
│   ├── generar_productos.bat        # Script Windows para ejecutar
│   ├── requirements.txt             # Dependencias Python
│   └── README_generador.md          # Documentación generadores
│
└── 📁 ARCHIVOS EXCEL GENERADOS
    ├── productos_hencho_tcg_*.xlsx  # Archivos de prueba Hencho TCG
    └── productos_mochima_*.xlsx     # Archivos de prueba Mochima
```

## 🔧 ARQUITECTURA TÉCNICA

### 🎯 PATRÓN DE DISEÑO

- **Arquitectura**: MVC (Model-View-Controller)
- **Tipo**: Single Page Application (SPA)
- **Almacenamiento**: localStorage (cliente)
- **Separación**: Por empresa (carpetas independientes)

### 📊 COMPONENTES PRINCIPALES

#### 1. **AUTENTICACIÓN** (`index.html`)

```javascript
// Credenciales: admin/admin
// Almacenamiento: localStorage['isAuthenticated']
// Flujo: Login → Selección Empresa → Dashboard
```

#### 2. **MODELO DE DATOS** (`storage.js`)

```javascript
// Hencho TCG: localStorage['hencho_tcg_products']
// Mochima: localStorage['mochima_products']
// Estructura producto:
{
  id: number,
  sku: string,
  name: string,
  quantity: number,
  price: number
}
```

#### 3. **CONTROLADOR** (`app.js`)

```javascript
// Eventos: login, logout, CRUD productos, import/export
// Validaciones: autenticación, formularios
// Navegación: entre vistas y empresas
```

#### 4. **VISTA** (`ui.js`)

```javascript
// Renderizado: tablas, estadísticas, gráficos
// Modales: añadir/editar productos
// Formateo: moneda CLP, números
```

#### 5. **EXCEL** (`excel.js`)

```javascript
// Importación: mapeo columnas Excel → objeto JS
// Exportación: objeto JS → Excel
// Librería: SheetJS (xlsx.full.min.js)
```

## 🎨 SISTEMA DE DISEÑO

### 🌈 PALETAS DE COLORES

#### **Hencho TCG** (Tema Azul)

- **Fondo**: `#0f0f1a` → `#080a15` (gradiente oscuro)
- **Acentos**: `#4A90E2` → `#357ABD` (azul)
- **Paneles**: `rgba(20, 20, 40, 0.8)` (transparente)

#### **Mochima** (Tema Rojo/Naranja)

- **Fondo**: `#CC3333` → `#CC6B35` (gradiente rojo/naranja)
- **Acentos**: `#CCAA00` (amarillo dorado)
- **Paneles**: `rgba(204, 51, 51, 0.8)` (transparente)

#### **Login** (Tema Mixto)

- **Fondo**: Gradiente combinado de ambas empresas
- **Botones**: Colores específicos por empresa

### 📱 RESPONSIVE DESIGN

- **Desktop**: Grid layout completo
- **Tablet**: Columnas adaptativas
- **Mobile**: Stack vertical

## 🔄 FLUJO DE DATOS

### 1. **AUTENTICACIÓN**

```
Usuario → Login (admin/admin) → localStorage['isAuthenticated'] = true
```

### 2. **SELECCIÓN EMPRESA**

```
Login exitoso → Panel selección → Redirección a dashboard específico
```

### 3. **GESTIÓN PRODUCTOS**

```
Dashboard → CRUD productos → localStorage[empresa_products] → UI actualizada
```

### 4. **IMPORTACIÓN EXCEL**

```
Archivo Excel → SheetJS → Mapeo propiedades → localStorage → UI
```

### 5. **EXPORTACIÓN EXCEL**

```
localStorage → SheetJS → Archivo Excel descargable
```

## 📚 DEPENDENCIAS

### **Frontend**

- **Chart.js 3.9.1**: Gráficos interactivos
- **SheetJS**: Manipulación archivos Excel
- **CSS3**: Flexbox, Grid, Gradientes, Backdrop-filter

### **Backend (Generadores)**

- **Python 3.x**: Scripts generación Excel
- **pandas**: Manipulación datos
- **openpyxl**: Escritura archivos Excel

## 🚀 FUNCIONALIDADES

### **Autenticación**

- ✅ Login/logout con credenciales admin/admin
- ✅ Protección rutas dashboard
- ✅ Persistencia sesión

### **Gestión Inventario**

- ✅ CRUD completo productos
- ✅ Importación Excel (formato flexible)
- ✅ Exportación Excel
- ✅ Validaciones formularios

### **Visualización**

- ✅ Estadísticas en tiempo real
- ✅ Gráficos de barras interactivos
- ✅ Tablas responsivas
- ✅ Modales para edición

### **Multi-empresa**

- ✅ Dashboards independientes
- ✅ Datos separados por empresa
- ✅ Temas visuales diferenciados
- ✅ Navegación fluida

### **Excel Integration**

- ✅ Importación automática
- ✅ Mapeo flexible columnas
- ✅ Generación archivos prueba
- ✅ Validación datos

## 🔒 SEGURIDAD

### **Autenticación**

- Credenciales hardcodeadas (prototipo)
- Validación cliente-side
- Persistencia localStorage

### **Datos**

- Validación formularios
- Sanitización inputs
- Prevención XSS básica

## 📈 RENDIMIENTO

### **Optimizaciones**

- Lazy loading librerías
- Event delegation
- Debounce inputs
- LocalStorage eficiente

### **Métricas**

- Tiempo carga inicial: < 2s
- Responsividad UI: < 100ms
- Tamaño total: ~500KB

## 🧪 TESTING

### **Archivos Prueba**

- `productos_hencho_tcg_*.xlsx`: 30 productos Pokémon
- `productos_mochima_*.xlsx`: 30 productos comida japonesa

### **Casos Prueba**

- Login/logout
- CRUD productos
- Importación/exportación Excel
- Navegación entre empresas
- Responsive design

## 🔧 CONFIGURACIÓN

### **Desarrollo**

```bash
# Generar archivos Excel de prueba
python generar_productos.py

# Ejecutar en servidor local
# Abrir index.html en navegador
```

### **Producción**

- Servir archivos estáticos
- Configurar HTTPS
- Implementar autenticación real
- Backup localStorage

## 📝 NOTAS TÉCNICAS

### **Compatibilidad**

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- CSS3 avanzado

### **Limitaciones**

- Solo cliente-side
- Sin base de datos
- Autenticación básica
- Sin backup automático

### **Extensiones Futuras**

- Base de datos real
- Autenticación robusta
- API REST
- Sincronización cloud
- Notificaciones push

---

## 🎯 RESUMEN EJECUTIVO

**Arquitectura**: SPA con MVC, separación por empresa, localStorage como persistencia
**Tecnologías**: HTML5, CSS3, JavaScript ES6+, Python, Excel
**Funcionalidades**: Autenticación, CRUD, Excel, visualizaciones, multi-empresa
**Estado**: Prototipo funcional completo, listo para pruebas y demostración
