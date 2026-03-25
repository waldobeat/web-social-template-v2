# 🛡️ Setup de Seguridad - Sheddit

## Requisitos Previos

1. **Cuenta de Firebase** (https://console.firebase.google.com)
2. **Proyecto de Firebase** creado
3. **Firebase CLI** instalado (`npm install -g firebase-tools`)

---

## Paso 1: Configurar Firebase App Check

### Web (reCAPTCHA Enterprise)

1. Ve a **Firebase Console** → Tu proyecto → **App Check**
2. Haz clic en **Registrar tu app**
3. Selecciona **Web** (HTTPS)
4. En **reCAPTCHA Enterprise**, crea una clave:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/security/recaptcha)
   - Crea un sitio → Configura la clave
   - Copia la **Site Key**
5. En Firebase App Check, pega la Site Key
6. Añade la clave al archivo `.env.local`:
   ```
   VITE_RECAPTCHA_SITE_KEY=TU_SITE_KEY_AQUI
   ```

### Proteger Firestore

```bash
# Despliega las reglas de seguridad
firebase deploy --only firestore:rules
```

---

## Paso 2: Configurar Firebase Cloud Functions

### Inicializar Functions

```bash
# En la raíz del proyecto
firebase init functions

# Selecciona:
# - TypeScript
# - ESLint
# - Instalar dependencias
```

### Desplegar funciones de seguridad

Las funciones en el código actual están diseñadas para Firebase Functions. Para desplegarlas:

```bash
cd functions
npm run deploy
```

**Funciones necesarias:**
- `generateLivenessChallenge` - Genera desafío de liveness
- `verifyLivenessChallenge` - Verifica el gesto
- `onCommunityCreate` - Crea ModBot al crear comunidad
- `analyzePostingSpeed` - Analiza velocidad de posts
- `analyzeSpamPattern` - Detecta spam
- `checkFollowHeuristics` - Analiza patrones de follows

---

## Paso 3: Configurar Vertex AI (para Liveness)

### Habilitar API

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Busca **Vertex AI API** y actívala
3. Crea credenciales de servicio

### Actualizar función de verificación

En `functions/src/liveness.ts`, reemplaza la función de validación:

```typescript
async function validateGestureWithAI(imageBase64: string, challenge: string): Promise<boolean> {
  // Implementar con Vertex AI Vision
  const { Image } = require('@google-cloud/vision');
  const client = new ImageAnnotatorClient();
  
  const [result] = await client.labelDetection({
    image: { content: Buffer.from(imageBase64, 'base64') }
  });
  
  // Analizar resultado según el desafío
  return result.labelAnnotations.length > 0;
}
```

---

## Paso 4: Variables de Entorno

Crea/actualiza `.env.local`:

```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Security
VITE_RECAPTCHA_SITE_KEY=TU_SITE_KEY
VITE_USE_DEBUG_APP_CHECK=false
```

---

## Paso 5: Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

---

## Estructura de Colecciones

Cuando las funciones estén activas, Firestore tendrá:

```
users/
  {userId}/
    is_human: boolean
    liveness_verified_at: timestamp
    onboarding_step: 'email' | 'selfie' | 'complete'
    account_status: 'active' | 'flagged' | 'suspended'

communities/
  {communityId}/
    moderationType: 'bot' | 'human' | 'hybrid'
    botModeratorId: 'm/AutoMod_c/nombre'

posts/
  {postId}/
    flagged_as_spam: boolean
    status: 'published' | 'pending_review'

liveness_challenges/
  {challengeId}/

behavior_flags/
  {flagId}/
```

---

## Para Desarrollo Local

Si quieres probar sin Cloud Functions, el código frontend funciona en modo "demo" donde:

- `is_human` se puede marcar manualmente
- Los análisis de comportamiento se ejecutan en el cliente
- La verificación de liveness es simulada

---

## Troubleshooting

### Error: "App Check not initialized"
→ Asegúrate de llamar `initializeAppCheck()` en `main.tsx`

### Error: "Permission denied" en Firestore
→ Despliega las reglas: `firebase deploy --only firestore:rules`

### Error: Camera not working
→ Asegúrate de usar HTTPS en producción (o localhost para desarrollo)
