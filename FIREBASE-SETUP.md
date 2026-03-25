# 🚀 Firebase Setup Guide for SoloChicas/Sheddit

## Prerequisites
- A Google account (Gmail)
- Access to [console.firebase.google.com](https://console.firebase.google.com)

---

## Step 1: Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** or **"Crear un proyecto"**
3. Enter project name: `sheddit` or `solochicas`
4. Disable Google Analytics (optional, for faster setup)
5. Click **"Create project"** and wait

---

## Step 2: Enable Firebase Services

### 2.1 Enable Authentication
1. In the left sidebar, go to **Build → Authentication**
2. Click **"Get started"**
3. Enable **Google** provider:
   - Toggle to enable
   - Add your email in "Support email"
   - Click **Save**
4. Enable **Email/Password** provider:
   - Toggle to enable
   - Enable "Email link (passwordless sign-in)" if you want
   - Click **Save**

### 2.2 Enable Firestore Database
1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select location (closest to your users, e.g., `us-central1`)
4. Start in **"Test mode"** (allows read/write for 30 days)
5. Click **Done**

### 2.3 Enable Storage (optional)
1. Go to **Build → Storage**
2. Click **"Get started"**
3. Start in **"Test mode"**
4. Click **Done**

---

## Step 3: Get Your Credentials

1. Go to **Project Settings** (gear icon ⚙️ next to "Project Overview")
2. Scroll down to **"Your apps"**
3. Click the **</>** web icon (Web app)
4. Register app: `sheddit-web`
5. **Copy these values**:

```
VITE_FIREBASE_API_KEY=AIzaSy_______________
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## Step 4: Create .env File

Create a file named `.env` in the project root:

```env
VITE_FIREBASE_API_KEY=AIzaSy_______________
VITE_FIREBASE_AUTH_DOMAIN=solochicasweb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=solochicasweb
VITE_FIREBASE_STORAGE_BUCKET=solochicasweb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## Step 5: Security Rules (Important!)

> ⚠️ **WARNING**: Never use open rules in production! Your database will be exposed to the public.

This project already includes properly configured security rules in [`firestore.rules`](firestore.rules). 

The default rules require authentication for all read/write operations. Do not modify them unless you fully understand Firestore security.

For production, ensure you have:
```javascript
allow read, write: if request.auth != null;
```

For detailed security setup including App Check, liveness verification, and bot protection, see **[SETUP-SECURITY.md](SETUP-SECURITY.md)**.

---

## Step 6: Restart the App

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🔧 Troubleshooting

### "Configuración Incomplete" still shows?
- Check that `.env` file is in the **root** of the project
- Restart the dev server after creating `.env`
- Make sure there are no spaces or quotes in values

### Console errors about Firebase?
- Check browser console (F12) for specific errors
- Verify all 6 environment variables are set

### Want to test without Firebase?
- The app will show a config error message
- For development mode, the app uses mock data from `src/data/mockData.ts`

---

## 📞 Need Help?

If you get stuck at any step, share a screenshot and I'll help you complete the setup!