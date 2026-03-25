/**
 * Script para crear usuarios de prueba en Firebase
 * Ejecutar: node createTestUsers.cjs
 * 
 * Requiere variables de entorno (puedes copiar de .env.local):
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase desde variables de entorno
// Nota: Las variables en .env.local usan prefijo VITE_, las renombramos aquí
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser(index) {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const email = `test${uniqueId}@sheddit.blog`;
    const password = `Test${Math.random().toString(36).substring(2, 10)}!${index}`;

    try {
        // Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Crear perfil en Firestore
        await addDoc(collection(db, 'users'), {
            id: uid,
            email: email,
            username: `u/test${uniqueId}`,
            avatar: `https://i.pravatar.cc/150?u=test${index}`,
            bio: `Usuario de prueba #${index}`,
            age: String(18 + Math.floor(Math.random() * 30)),
            interests: ['Moda', 'Arte', 'Música'],
            followers: [],
            following: [],
            joinedCommunityIds: [],
            is_human: true,
            liveness_verified_at: serverTimestamp(),
            account_status: 'active',
            onboarding_step: 'complete',
            createdAt: serverTimestamp()
        });

        console.log(`✅ Usuario ${index}: ${email}`);
        return { email, password, uid };
    } catch (error) {
        console.log(`❌ Error usuario ${index}: ${error.message}`);
        return null;
    }
}

async function createManyUsers(count) {
    console.log(`🚀 Creando ${count} usuarios de prueba...\n`);

    const results = [];
    for (let i = 1; i <= count; i++) {
        const result = await createTestUser(i);
        if (result) results.push(result);

        // Pequeña pausa para no saturar Firebase
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`\n📊 Total creados: ${results.length}/${count}`);

    // Guardar credenciales en archivo
    const fs = require('fs');
    fs.writeFileSync('test_users.json', JSON.stringify(results, null, 2));
    console.log('💾 Credenciales guardadas en test_users.json');
}

createManyUsers(100);