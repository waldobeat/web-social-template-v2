const WORD_POOL = [
  'manzana', 'pera', 'naranja', 'plátano', 'uva', 'fresa', 'sandía', 'melón', 'piña', 'mango', 'kiwi', 'limón',
  'perro', 'gato', 'león', 'tigre', 'elefante', 'jirafa', 'delfín', 'ballena', 'águila', 'búho', 'serpiente', 'tortuga',
  'casa', 'hogar', 'puerta', 'ventana', 'techo', 'habitación', 'familia', 'calle', 'ciudad', 'edificio', 'apartamento', 'cocina',
  'sol', 'luna', 'estrella', 'nube', 'río', 'bosque', 'camino', 'puente', 'torre', 'mar', 'océano', 'playa', 'montaña',
  'coche', 'carro', 'tren', 'avión', 'barco', 'bicicleta', 'camión', 'moto', 'autobús', 'gasolina', 'volante', 'rueda', 'asiento',
  'rojo', 'azul', 'verde', 'amarillo', 'blanco', 'negro', 'morado', 'rosa', 'gris', 'naranja',
  'feliz', 'triste', 'enojado', 'asustado', 'sorprendido', 'cansado', 'emocionado', 'nervioso', 'calmado', 'aburrido',
  'correr', 'saltar', 'nadar', 'volar', 'caminar', 'bailar', 'cantar', 'dibujar', 'leer', 'escribir',
  'doctor', 'maestro', 'ingeniero', 'artista', 'cocinero', 'piloto', 'bombero', 'policía', 'granjero', 'programador',
  'libro', 'flor', 'mesa', 'silla', 'zapato', 'reloj', 'pescado', 'árbol', 'música', 'película', 'comida', 'ropa',
  'comida', 'alimento', 'cena', 'desayuno', 'almuerzo', 'pan', 'queso', 'carne', 'pescado', 'arroz', 'pasta', 'ensalada',
  'amor', 'odio', 'paz', 'guerra', 'vida', 'muerte', 'tiempo', 'dinero', 'poder', 'libertad', 'sueño', 'realidad'
];

const SEMANTIC_GROUPS: Record<string, string[]> = {
  frutas: ['manzana', 'pera', 'naranja', 'plátano', 'uva', 'fresa', 'sandía', 'melón', 'piña', 'mango', 'kiwi', 'limón'],
  animales: ['perro', 'gato', 'león', 'tigre', 'elefante', 'jirafa', 'delfín', 'ballena', 'águila', 'búho', 'serpiente', 'tortuga'],
  hogar: ['casa', 'hogar', 'puerta', 'ventana', 'techo', 'habitación', 'familia', 'calle', 'ciudad', 'edificio', 'apartamento', 'cocina'],
  naturaleza: ['sol', 'luna', 'estrella', 'nube', 'río', 'bosque', 'camino', 'puente', 'torre', 'mar', 'océano', 'playa', 'montaña'],
  transporte: ['coche', 'carro', 'tren', 'avión', 'barco', 'bicicleta', 'camión', 'moto', 'autobús', 'gasolina', 'volante', 'rueda', 'asiento'],
  colores: ['rojo', 'azul', 'verde', 'amarillo', 'blanco', 'negro', 'morado', 'rosa', 'gris', 'naranja'],
  emociones: ['feliz', 'triste', 'enojado', 'asustado', 'sorprendido', 'cansado', 'emocionado', 'nervioso', 'calmado', 'aburrido'],
  acciones: ['correr', 'saltar', 'nadar', 'volar', 'caminar', 'bailar', 'cantar', 'dibujar', 'leer', 'escribir'],
  profesiones: ['doctor', 'maestro', 'ingeniero', 'artista', 'cocinero', 'piloto', 'bombero', 'policía', 'granjero', 'programador'],
  objetos: ['libro', 'flor', 'mesa', 'silla', 'zapato', 'reloj', 'pescado', 'árbol', 'música', 'película', 'comida', 'ropa'],
  alimentos: ['comida', 'alimento', 'cena', 'desayuno', 'almuerzo', 'pan', 'queso', 'carne', 'pescado', 'arroz', 'pasta', 'ensalada'],
  abstractos: ['amor', 'odio', 'paz', 'guerra', 'vida', 'muerte', 'tiempo', 'dinero', 'poder', 'libertad', 'sueño', 'realidad']
};

const WORD_TO_GROUP: Record<string, string> = {};
Object.entries(SEMANTIC_GROUPS).forEach(([group, words]) => {
  words.forEach(w => { WORD_TO_GROUP[w.toLowerCase()] = group; });
});

export function getRandomSecretWord(): string {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

export function getRandomWord(): string {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export function calculateSemanticRankFromSimilarity(similarity: number): number {
  if (similarity >= 0.99) return 1;
  // Mapeo no lineal para que valores altos (>0.7) den rangos bajos (2-100)
  if (similarity >= 0.8) return Math.floor(Math.random() * 20) + 2;
  if (similarity >= 0.6) return Math.floor(Math.random() * 50) + 25;
  if (similarity >= 0.4) return Math.floor(Math.random() * 100) + 75;
  if (similarity >= 0.25) return Math.floor(Math.random() * 100) + 180;
  if (similarity >= 0.1) return Math.floor(Math.random() * 150) + 290;
  return Math.floor(Math.random() * 500) + 400;
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-neon-green border-neon-green bg-neon-green/10 border-glow-green';
  if (rank <= 100) return 'text-neon-green border-neon-green/60 bg-neon-green/5';
  if (rank <= 300) return 'text-neon-yellow border-neon-yellow/60 bg-neon-yellow/5';
  return 'text-neon-red border-neon-red/60 bg-neon-red/5';
}

export function getRankLabel(rank: number): string {
  if (rank === 1) return 'ENCONTRADA';
  if (rank <= 100) return 'CERCA';
  if (rank <= 300) return 'TIBIO';
  return 'LEJOS';
}

export function getRankRing(rank: number): string {
  if (rank === 1) return 'border-l-2 border-neon-green border-glow-green';
  if (rank <= 100) return 'border-l-2 border-neon-green/60';
  if (rank <= 300) return 'border-l-2 border-neon-yellow/60';
  return 'border-l-2 border-neon-red/60';
}

export function getRankBgGlow(rank: number): string {
  if (rank === 1) return 'bg-neon-green/5';
  if (rank <= 100) return 'bg-neon-green/5';
  if (rank <= 300) return 'bg-neon-yellow/5';
  return 'bg-neon-red/5';
}
