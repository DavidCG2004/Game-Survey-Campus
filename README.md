# 🎮 Radar Gamer - Campus Survey App

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-7+-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Hardware-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Hosting-Dashboard-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Radar Gamer** es una aplicación móvil híbrida y un tablero web (PWA) desarrollado para realizar actividades de campo e investigación dentro del campus universitario. Permite registrar las preferencias de videojuegos de estudiantes y docentes, recolectando datos demográficos, ubicación GPS exacta y evidencia fotográfica en tiempo real.

---

## 🚀 Características Principales

- **🔐 Autenticación Segura**: Sistema de Login y Registro gestionado mediante Supabase Auth.
- **📝 Formulario Dinámico**: Captura de datos estructurados (edad, rol, lugar del campus, plataforma).
- **🔎 Búsqueda Predictiva de Juegos**: Integración con la **RAWG Video Games Database API** para buscar entre más de 800,000 títulos en tiempo real.
- **📸 Evidencia Nativa**: Uso de hardware del dispositivo para capturar fotografías (Cámara/Galería) subidas a Supabase Storage Bucket.
- **📍 Geolocalización (GPS)**: Registro de coordenadas exactas (Latitud/Longitud) al momento de realizar la encuesta.
- **📊 Tablero de Visualización (Dashboard)**: Interfaz web responsiva con métricas y filtros en tiempo real, alojada en Firebase Hosting.
- **🔗 Sistema de Invitación**: Generación de Códigos QR integrados para promover la descarga y prueba de la aplicación.

---

## 🏗️ Arquitectura y Buenas Prácticas

Este proyecto fue construido siguiendo estándares de desarrollo **Senior** para garantizar mantenibilidad, escalabilidad y rendimiento:

- **Angular Standalone Components**: Proyecto 100% libre de `NgModules`.
- **Clean Architecture**: Separación estricta entre la Capa de Infraestructura/Servicios (Supabase, RAWG, Capacitor) y la Capa de Presentación (Componentes UI).
- **Gestión de Estado Reactiva**: Implementación profunda de **Angular Signals** (`signal`, `computed`) para una interfaz de usuario síncrona y reactiva sin suscripciones complejas.
- **Inyección de Dependencias Moderna**: Uso exclusivo de la función `inject()`.
- **Patrón Adapter**: Transformación y normalización de payloads complejos (RAWG API) a interfaces de dominio internas.
- **UI/UX Minimalista**: Paleta de colores restringida, animaciones en cascada (fade-in-stagger) y micro-interacciones.

---

## 📱 Capturas de Pantalla

|src="<img width="1366" height="768" alt="Captura de pantalla (156)" src="https://github.com/user-attachments/assets/fc5a4631-3b41-43d0-aad0-91fe0e9c9161" />| <img src="<img width="1366" height="768" alt="Captura de pantalla (152)" src="https://github.com/user-attachments/assets/8f76fb70-7813-43ba-97cd-6a61d90bb459" />
 | src="<img width="1366" height="768" alt="Captura de pantalla (157)" src="https://github.com/user-attachments/assets/d57a8f5a-206c-4a6f-9b5b-a65029359e9c" />
 |src="<img width="1366" height="768" alt="Captura de pantalla (153)" src="https://github.com/user-attachments/assets/ed503d6e-8c8a-4985-b4c4-d42e1a434720" />
|src="<img width="1366" height="768" alt="Captura de pantalla (154)" src="https://github.com/user-attachments/assets/d534ec1c-c61e-49b9-9452-72afbc163b53" /> |


---

## 🛠️ Instalación y Configuración Local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)
- Cuenta en [Supabase](https://supabase.com/) y API Key de [RAWG](https://rawg.io/apidocs)

### Pasos

1. **Clonar el repositorio:**

```bash
   git clone https://github.com/DavidCG2004/Game-Survey-Campus.git
   cd game-survey-campus
```

2. **Instalar dependencias:**

```bash
   npm install
```

3. **Configurar Variables de Entorno:**

   Crea el archivo `src/environments/environment.ts` con tus credenciales:

```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'TU_SUPABASE_URL',
     supabaseKey: 'TU_SUPABASE_ANON_KEY',
     Games_Key: 'TU_RAWG_API_KEY'
   };
```

4. **Ejecutar en entorno de desarrollo (Web):**

```bash
   ionic serve
```

---

## 📦 Compilación y Despliegue

### Despliegue Web (Dashboard en Firebase)

```bash
ionic build --prod
firebase deploy --only hosting
```

### Compilación Nativa (Android)

Sincroniza los plugins de Capacitor y abre el proyecto en Android Studio:

```bash
npx cap sync android
npx cap open android
```

> Asegúrate de revisar el archivo `AndroidManifest.xml` para los permisos de **Internet**, **Cámara** y **GPS** requeridos antes de compilar el APK.

---

## 👨‍💻 Autores

- **[David Cajamarca]** — Desarrollo Mobile, Arquitectura & UI/UX — 
