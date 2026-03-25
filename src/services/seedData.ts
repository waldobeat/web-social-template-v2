import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const seedDefaultCommunities = async () => {
  const defaults = [
    { name: 'c/Farandula', description: 'Lo último en chismes y celebridades.', colorTheme: '#FF477E' },
    { name: 'c/Arte', description: 'Expresión, pintura, escultura y más.', colorTheme: '#8B5CF6' },
    { name: 'c/Moda', description: 'Tendencias, outfits y pasarelas.', colorTheme: '#EC4899' },
    { name: 'c/Maquillaje', description: 'Tutoriales, reseñas y tips de belleza.', colorTheme: '#F43F5E' },
    { name: 'c/Empleos Remoto', description: 'Oportunidades y consejos para trabajar desde casa.', colorTheme: '#10B981' },
    { name: 'c/Recetas', description: 'Cocina, postres y comida saludable.', colorTheme: '#F59E0B' },
    { name: 'c/Gym', description: 'Rutinas, fitness y vida sana.', colorTheme: '#3B82F6' },
    { name: 'c/Curiosidades', description: 'Datos curiosos y cosas interesantes.', colorTheme: '#6366F1' },
  ];

  console.log("Seeding default communities...");
  const promises = defaults.map(async (comm) => {
    return addDoc(collection(db, 'communities'), {
      name: comm.name,
      description: comm.description,
      colorTheme: comm.colorTheme,
      ownerId: 'system',
      memberIds: [],
      memberCount: 0,
      createdAt: serverTimestamp()
    });
  });

  try {
    await Promise.all(promises);
    console.log("Default communities successfully seeded!");
  } catch (e) {
    console.error("Error seeding communities: ", e);
  }

  // Seed ModBot user
  try {
    const modBotRef = doc(db, 'users', 'system_modbot');
    const modBotSnap = await getDoc(modBotRef);
    if (!modBotSnap.exists()) {
      await setDoc(modBotRef, {
        id: 'system_modbot',
        username: 'u/ModBot',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712010.png',
        bio: '🤖 Moderadora Oficial de SoloChicas. Protegiendo a mis amigas del spam y malas palabras juntas. ✨',
        followers: [],
        following: [],
        joinedCommunityIds: [],
        age: '99',
        interests: ['Paz', 'Tranquilidad', 'Seguridad']
      });
      console.log("ModBot profile seeded.");
    }
  } catch (e) {
     console.error("Error seeding bot: ", e);
  }
};
