# SoloChicasWeb 🌸

Una red social segura y divertida creada especialmente para chicas. ¡Comparte, conecta y crece juntas! ✨

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28)

## 🚀 Características

- 📝 **Publicaciones** - Crea y comparte posts con tu comunidad
- 💬 **Comentarios** -Interactúa con comentarios anidados
- ❤️ **Likes y Reposts** -Interactúa con el contenido de otras chicas
- 👥 **Comunidades** - Crea y únete a comunidades de interés
- 💌 **Mensajería Directa** - Chatea de forma privada
- 🔔 **Notificaciones** - Mantente al día con las actividades
- 🛡️ **ModBot** - Sistema de moderación automática para una comunidad segura

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Backend**: Firebase (Firestore + Authentication)
- **Routing**: React Router DOM v7
- **Styling**: CSS Modules
- **Icons**: Lucide React
- **Emojis**: emoji-picker-react

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── CommentSection.tsx
│   ├── CookieBanner.tsx
│   ├── CreatePostModal.tsx
│   ├── LazyImage.tsx      # Lazy loading de imágenes
│   ├── PostCard.tsx
│   └── ...
├── context/
│   └── AppContext.tsx    # Estado global + Firebase
├── hooks/              # Custom hooks
│   ├── useIntersectionObserver.ts
│   └── useToast.tsx     # Sistema de toasts
├── pages/              # Páginas/Rutas
│   ├── Feed.tsx
│   ├── Explore.tsx
│   ├── Profile.tsx
│   └── ...
├── services/           # Lógica de negocio
│   ├── firebase.ts
│   ├── moderationConfig.ts
│   ├── moderatorBot.ts
│   └── seedData.ts
├── utils/              # Utilidades
│   ├── helpers.ts
│   └── sorting.ts
└── data/               # Datos mock
    └── mockData.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm o yarn
- Una cuenta de Firebase

### Instalación

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd SoloChicasWeb
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura Firebase**
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus credenciales de Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
# ... otras variables
```

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

5. **Abre en el navegador**
```
http://localhost:5173
```

## 🔥 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa de la build |
| `npm run lint` | Ejecuta el linter |

## 🛡️ Sistema de Moderación (ModBot)

El sistema de moderación automática incluye:

- **Filtro de contenido**: Detecta palabras inapropiadas y spam
- **Sistema de strikes**: 3 strikes = ban permanente
- **Auto-DM**: Mensajes automáticos de advertencia
- **Detección de enlaces**: Previene spam externo

### Configuración

Edita [`src/services/moderationConfig.ts`](src/services/moderationConfig.ts) para personalizar:

```typescript
export const MODERATION_CONFIG = {
  maxStrikes: 3,           // Strikes antes del ban
  autoBanEnabled: true,    // Ban automático
  autoDMEnabled: true,      // Mensajes de advertencia
  minContentLength: 5,     // Longitud mínima
  maxContentLength: 500,   // Longitud máxima
  forbiddenWords: [...],   // Palabras prohibidas
  // ...
};
```

## 🎨 Hooks Personalizados

### `useIntersectionObserver`
Lazy loading para componentes.

```tsx
const { ref, hasIntersected } = useIntersectionObserver({ triggerOnce: true });
```

### `useToast`
Sistema de notificaciones toast.

```tsx
const { addToast } = useToast();
addToast('success', '¡Post creado exitosamente!');
```

### `useDebounce`
Valores con delay.

```tsx
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 🔒 Seguridad

- Las credenciales de Firebase se manejan a través de variables de entorno
- El archivo `.env.local` está excluded del repositorio
- Sistema de moderación para prevenir contenido inapropiado
- XSS prevention en la sanitización de texto

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

Hecho con 💖 para la comunidad de SoloChicas 🌸
