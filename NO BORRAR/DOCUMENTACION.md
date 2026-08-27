# Jueguito y Mascotas - Documentación Completa

## Descripción General

**Jueguito y Mascotas** (también llamado "Trivia Live - Individual FFA v2") es un juego de trivia en vivo integrado con TikTok Live. Los espectadores en el live de TikTok envían respuestas, likes, regalos y comandos por el chat, y el juego procesa todo en tiempo real. Incluye un sistema de **mascotas virtuales tipo Tamagotchi** que evolucionan según la participación, múltiples modos de juego, efectos visuales premium, música de fondo, narración por voz TTS, videos de agradecimiento, y un sistema de ranking semanal.

---

## Estructura del Proyecto

```
Jueguito y mascotas/
├── .env                          # Variables de entorno
├── EsteSI.code-workspace         # Workspace de VS Code
├── animals.json                  # Base de datos de animales (53 entradas)
├── database.sqlite               # Base de datos SQLite (usuarios + mascotas)
├── flags.json                    # Base de datos de banderas (395 países)
├── gameLogic.js                  # Lógica principal del juego (1491 líneas)
├── geography.json                # Preguntas de geografía (152 entradas)
├── img/                          # Imágenes de objetos/personajes (15 archivos)
├── index.html                    # Frontend completo (1556 líneas)
├── injectHtml.js                 # Script de inyección: sabotage banner + minijuego UI
├── injectMechanics.js            # Script de inyección: lógica de minijuego + sabotaje
├── injectPause.js                # Script de inyección: sistema de pausa + debug panel
├── injectThemes.js               # Script de inyección: sistema de temas premium
├── injectVideos.js               # Script de inyección: cola de videos de agradecimiento
├── inspectDb.js                  # Utilidad para inspeccionar la base de datos
├── movies.json                   # Base de datos de películas/series (211 entradas)
├── node_modules/                 # Dependencias npm
├── objects.json                  # Base de datos de objetos/imágenes (14 entradas)
├── objetos.js                    # Base de datos extendida de objetos/emoji (1238+ entradas)
├── package.json                  # Dependencias del proyecto
├── package-lock.json             # Lock de dependencias
├── public/
│   └── video/                    # Videos de agradecimiento (4 archivos .mp4)
├── refactor.js                   # Script de refactorización (migración SQLite, limpieza)
├── server.js                     # Servidor Node.js + WebSocket + TikTok connector
├── simulateTikTok.js             # Simulador de eventos TikTok para testing
├── sounds/                       # Audio TTS cacheado (112 archivos .mp3)
├── temp_script_0.js ... temp_script_5.js  # Scripts temporales
├── testTTS.js                    # Test del sistema TTS
├── tts.js                        # Motor de Text-to-Speech con TikTok API
└── weeklyStats.json.bak          # Backup de estadísticas semanales migradas
```

---

## Stack Tecnológico

### Backend
| Componente | Tecnología | Versión |
|---|---|---|
| Servidor | Node.js + Express | v5.2.1 |
| WebSockets | Socket.IO | v4.8.3 |
| Base de datos | better-sqlite3 | v13.0.3 |
| TikTok Live | tiktok-live-connector | v2.4.3 |
| TTS | @google-cloud/text-to-speech + google-tts-api | v7.0.0 / v2.0.2 |
| Variables de entorno | dotenv | v17.4.2 |
| CORS | cors | v2.8.6 |

### Frontend
| Componente | Tecnología | Versión |
|---|---|---|
| CSS Framework | Tailwind CSS | CDN |
| Animaciones | Canvas Confetti | v1.5.1 |
| Partículas | particles.js | v2.0.0 |
| Animaciones JS | anime.js | v3.2.1 |
| Fuente | Google Fonts - Outfit | - |
| WebSockets | Socket.IO Client | v4.8.3 |
| Video player | HTML5 Video nativo | - |

### Dependencias de desarrollo
| Componente | Tecnología | Versión |
|---|---|---|
| Auto-reload | nodemon | v3.1.14 |

---

## Configuración (.env)

```env
PORT=3000
SIMULATE_TIKTOK=true
ELEVENLABS_API_KEY=sk_b63bdb5bb99cb28d3ef8b8fad25be2d256fa8d137526cf97
```

- `PORT`: Puerto del servidor (por defecto 3000)
- `SIMULATE_TIKTOK`: Activa el modo simulación para testing sin TikTok real
- `ELEVENLABS_API_KEY`: API key para ElevenLabs TTS (opcional, principalmente se usa TikTok TTS)

---

## Base de Datos (SQLite - `database.sqlite`)

### Tabla `users` - Ranking Semanal
```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    nickname TEXT,
    profilePic TEXT,
    score INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```
- Almacena el ranking semanal de jugadores
- `score` se acumula semana a semana hasta reset manual
- Migrado automáticamente desde `weeklyStats.json` al iniciar

### Tabla `pets` - Mascotas Virtuales
```sql
CREATE TABLE IF NOT EXISTS pets (
    username TEXT PRIMARY KEY,
    pet_name TEXT,
    color TEXT,
    pattern TEXT,
    stage TEXT DEFAULT 'huevo',
    evolution_points INTEGER DEFAULT 0,
    hunger INTEGER DEFAULT 100,
    last_fed DATETIME DEFAULT CURRENT_TIMESTAMP
)
```
- `stage`: huevo → bebé → niño → adolescente → adulto → señor
- `hunger`: 0-100, decrece con el tiempo, se alimenta con `!maiz`
- `color` y `pattern`: aleatorios al crear la mascota

---

## Tipos de Pregunta

El juego rota entre 6 tipos de preguntas en orden cíclico:

| Tipo | Descripción | Fuente de datos |
|---|---|---|
| `flag` | Adivinar la bandera de un país | `flags.json` (395 banderas) |
| `object` | Adivinar qué es una imagen/emoji | `objects.json` (14 con imagen) + `objetos.js` (1200+ con emoji) |
| `math` | Resolver operación matemática | Generada proceduralmente |
| `animal` | Adivinar el animal por emoji | `animals.json` (53 animales) |
| `easy` | Preguntas de trivia general | Hardcodeadas en `gameLogic.js` (140 preguntas) |
| `movie` | Adivinar película/serie por emojis | `movies.json` (211 películas) |
| `geography` | Preguntas de geografía | `geography.json` (152 preguntas) - solo en Hot Rounds |

---

## Contenido de Preguntas

### Banderas (`flags.json` - 395 países)
- Incluye todos los países del mundo organizados por código ISO
- Marcados como `popular`: Argentina, Brasil, Colombia, Chile, Perú, Venezuela, México, España, Estados Unidos, Canadá, Francia, Italia, Alemania, Reino Unido, Japón, China, Corea del Sur, Rusia, Australia, India, Egipto, Sudáfrica, Uruguay, Ecuador, Bolivia (24 países populares)
- 75% de probabilidad de elegir un país popular si está disponible
- Las banderas se cargan desde `https://flagcdn.com/256x192/{code}.png`

### Objetos (`objetos.js` - 1200+ items)
- **Personajes con imagen PNG**: Goku, Naruto, Luffy, Pikachu, Shrek, Saitama, Vegeta, Sasuke, Zoro, Bob Esponja, Homero Simpson, Alicate (12 personajes en `/img/`)
- **Emojis de frutas**: manzana, pera, naranja, limón, plátano, sandía, uva, fresa, cereza, durazno, piña, kiwi, tomate, aguacate, berenjena, papa, zanahoria, maíz, pepino, lechuga, brócoli, ajo, cebolla, champiñón, maní, castaña (26 frutas/verduras)
- **Emojis de comida**: pan, croissant, baguette, pretzel, queso, huevo, tocino, hamburguesa, papas fritas, pizza, hot dog, sandwich, taco, burrito, ensalada, palomitas, mantequilla, sal, lata, bento, sushi, arroz, fideos, espaguetis, sopa, helado, dona, galleta, pastel, chocolate, caramelo, paleta, flan, miel, café, té, mate, leche, jugo, cerveza, vino, coctel, hielo, cubiertos, cuchara, cuchillo, plato, taza, copa, botella (50+ alimentos/bebidas)
- **Emojis de deportes**: balón, béisbol, softbol, básquetbol, voleibol, fútbol, rugby, tenis, boliche, cricket, hockey, ping pong, badminton, boxeo, artes marciales, patinaje, esquí, trineo, dardos, golf, cometa, arco, pesca, buceo, natación, surf, trofeo, medalla, patineta (28 deportes)
- **Emojis de transporte**: carro, taxi, camioneta, autobús, ambulancia, bomberos, policía, tractor, bicicleta, motocicleta, scooter, tren, metro, tranvía, monorriel, avión, helicóptero, cohete, platillo, satélite, barco, lancha, velero, canoa, ancla (25 vehículos)
- **Emojis de tecnología**: reloj, teléfono, laptop, teclado, ratón, impresora, cámara, televisión, radio, audífonos, micrófono, altavoz, batería, enchufe, bombilla, linterna, vela (17 dispositivos)
- **Emojis de hogar/objetos**: libro, cuaderno, periódico, billete, moneda, tarjeta, diamante, anillo, corona, sombrero, gorra, casco, lentes, corbata, camisa, pantalón, vestido, zapato, tenis, bota, calcetín, guante, bufanda, abrigo, mochila, bolso, paraguas, hilo, aguja, tijeras, llave, candado, puerta, ventana, cama, sofá, silla, mesa, inodoro, ducha, bañera, espejo, cepillo, jabón (44 objetos hogar)
- **Emojis varios**: corazón, estrella, fuego, gota, sol, luna, nube, rayo, nieve, viento, arcoíris, planeta, cometa, árbol, pino, palmera, cactus, flor, rosa, girasol, hoja, trébol, hongo, castillo, casa, edificio, hospital, banco, fábrica, carpa, volcán, montaña, isla, estadio, puente, estatua, rueda, montaña rusa, tren, semáforo, barrera, gasolinera, oso, muñeca, trompo, yoyo, rompecabezas, dado, ajedrez, billar, joystick, guitarra, piano, trompeta, violín, tambor, martillo, hacha, pico, tuerca, engranaje, imán, brújula, microscopio, telescopio, termómetro, píldora, jeringa, estetoscopio, ADN, tubo, petri, balanza, reloj de arena, calendario, lupa, carta, paquete, lápiz, pluma, pincel, crayola, marcador, regla, clip, chincheta, carpeta, gráfico, escudo, arco (70+ objetos varios)

### Animales (`animals.json` - 53 animales)
```
león 🦁, tigre 🐯, elefante 🐘, jirafa 🦒, oso 🐻, oso panda 🐼, mono 🐒,
gato 🐱, perro 🐶, delfín 🐬, tiburón 🦈, ballena 🐋, pingüino 🐧, águila 🦅,
serpiente 🐍, tortuga 🐢, rana 🐸, conejo 🐰, caballo 🐴, vaca 🐮, cerdo 🐷,
oveja 🐑, gallina 🐔, pato 🦆, mariposa 🦋, abeja 🐝, lobo 🐺, zorro 🦊,
león marino 🦭, koala 🐨, canguro 🦘, gorila 🦍, hipopótamo 🦛, leopardo 🐆,
cebra 🦓, ciervo 🦌, murciélago 🦇, búho 🦉, flamenco 🦩, loro 🦜,
dinosaurio 🦖, pulpo 🐙, cangrejo 🦀, langosta 🦞, caracol 🐌, araña 🕷️,
hormiga 🐜, ratón 🐭, camello 🐫, pavo real 🦚, erizo 🦔
```

### Películas/Series (`movies.json` - 211 entradas)
- Harry Potter, El Rey León, Spider-Man, Jurassic Park, Titanic, Star Wars,
  Rápidos y Furiosos, IT, Charlie y la Fábrica de Chocolate, Toy Story,
  Tiburón, Batman, El Señor de los Anillos, Sherlock Holmes, Los Juegos del Hambre,
  Shrek, Cenicienta, Buscando a Nemo, Kung Fu Panda, Matrix, Cazafantasmas,
  Volver al Futuro, Frozen, Up, Hombres de Negro, The Walking Dead, Zootopia,
  Transformers, Tortugas Ninja, La Bella y la Bestia, Mulan, La Sirenita,
  El Libro de la Selva, El Hombre Araña, Blancanieves, y muchas más...

### Geografía (`geography.json` - 152 preguntas)
- Ríos, océanos, continentes, países, capitales, volcanes, lagos, desiertos
- Solo activas durante **Hot Rounds** (Rondas Calientes)

### Preguntas Fáciles (140 preguntas hardcodeadas)
- Ciencia, cultura general, capitales, deportes, música, objetos cotidianos
- Ejemplos: "¿De qué color es el caballo blanco de Simón Bolívar?", "¿Cuántos dientes tiene un gato adulto?", "¿Quién pintó la Mona Lisa?"

### Preguntas Difíciles (50 preguntas hardcodeadas)
- Historia, ciencia, geografía avanzada, arte, literatura
- Ejemplos: "¿Cuál es la capital de Mongolia?", "¿Qué elemento químico tiene el símbolo 'Au'?", "¿En qué año cayó el Muro de Berlín?"

---

## Modos de Juego

### 1. Modo Normal (FFA Free-For-All)
- Duración: **10 minutos** por ronda
- 6 rondas macro por torneo (1 hora total)
- Los jugadores compiten individualmente por puntos
- Rotación automática entre tipos de pregunta

### 2. Hot Round (Ronda Caliente) 🔥
- Se activa aleatoriamente cada **15-25 minutos**
- 10 preguntas rápidas de geografía
- Los jugadores con más aciertos ganan **multiplicador x2 por 5 minutos**
- Las preguntas no se repiten hasta agotar todo el banco

### 3. Hard Mode (Modo Difícil) 🌽
- Se activa cuando alguien envía el regalo **"maíz/corn"**
- Duración: **3 minutos**
- Preguntas de dificultad alta
- Los ganadores obtienen **multiplicador x2 por 5 minutos**
- Interrumpe cualquier otro modo activo

### 4. Frenzy Mode (Modo Frenesí) 🔥
- Se activa al alcanzar **5000 taps globales** acumulados
- Duración: **60 segundos**
- **Puntos dobles** para todos los aciertos durante este modo
- El contador de taps se reinicia y la próxima activación es a los 10000 taps

### 5. Minijuego: Tira y Afloja (Tug of War)
- Se activa cada X rondas
- Los jugadores se unen a equipo Rojo (`!r`) o Azul (`!a`)
- Deben escribir correctamente 6 palabras rápidamente
- Gana el equipo con más aciertos
- Los ganadores reciben **10 puntos adicionales**

### 6. Modo Sabotaje 🚨
- Se activa con el regalo **"Rosa"**
- Duración: **30 segundos**
- Solo el saboteador puede sumar puntos durante este tiempo
- Si el saboteador acierta, gana 5 puntos extra

---

## Sistema de Puntuación

### Puntos por Acierto
| Posición | Puntos |
|---|---|
| 1er acierto | 10 |
| 2do acierto | 7 |
| 3er acierto | 5 |
| 4to acierto | 3 |
| 5to acierto | 2 |
| 6to+ acierto | 1 |

### Puntos por Otros Eventos
| Evento | Puntos |
|---|---|
| Like (tap) | Progresa hacia Frenzy Mode |
| Regalo (x1) | 50 × cantidad |
| Share (compartir live) | 5 |
| Minijuego ganador | 10 |
| Respuesta incorrecta | -1 |

### Multiplicadores
- **x2**: Ganador de Hot Round (5 min)
- **x2**: Ganador de Hard Mode (5 min)
- **x2**: Racha de 3+ aciertos seguidos (streak)
- **x2**: Durante Frenzy Mode

### Reglas de Puntuación
- Los puntos nunca bajan de 0 (score mínimo = 0)
- Las respuestas incorrectas restan 1 punto personal
- Si la mascota tiene hambre = 0, no gana puntos de evolución

---

## Sistema de Mascotas Virtuales (Tamagotchi)

### Etapas de Evolución
| Etapa | Emoji | Puntos Requeridos |
|---|---|---|
| Huevo | 🥚 | 0 - 49 |
| Bebé | 🐣 | 50 - 149 |
| Niño | 🐥 | 150 - 299 |
| Adolescente | 🐔 | 300 - 599 |
| Adulto | 🦅 | 600 - 999 |
| Señor | 🐉 | 1000+ |

### Características
- Cada jugador tiene una mascota única con **color y patrón aleatorios**
- La mascota **evoluciona automáticamente** al ganar puntos en trivia
- Si la mascota tiene **hambre = 0**, no gana puntos de evolución
- Al evolucionar: el juego se pausa 8 segundos, se muestra un modal especial con confetti, y se reproduce una voz de celebración
- Las mascotas se muestran en el leaderboard junto a cada jugador

### Hambre
- Valor inicial: 100
- Decrece **5 puntos por hora**
- Se alimenta con el comando `!maiz` (+30 hambre)
- Máximo: 100

### Colores y Patrones Disponibles
**Colores**: #f4a261, #e76f51, #2a9d8f, #e9c46a, #264653, #d4a373, #ffb5a7, #fcd5ce, #f8edeb, #f9dcc4, #fec89a

**Patrones**: solid, striped, spotted

### UI de Mascotas
- **Salón de Mascotas**: Pantalla inicial mostrando todas las mascotas ordenadas por puntos de evolución
- **Top Mascotas**: Panel en el juego mostrando las 5 mascotas con más puntos
- **Pet Badge**: Insignia pequeña junto a cada jugador en el leaderboard con:
  - Emoji de la etapa actual
  - Nombre de la etapa
  - Barra de hambre visual

---

## Sistema de Eventos TikTok

### Eventos Soportados
| Evento | Acción en el Juego |
|---|---|
| **Chat** | Procesar respuestas, comandos (`!maiz`) |
| **Like** | Sumar taps para Frenzy Mode |
| **Gift** | Sumar puntos, activar efectos especiales |
| **Share** | Sumar 5 puntos |
| **Follow** | Dar la bienvenida con voz |

### Efectos por Regalo
| Regalo | Efecto |
|---|---|
| **Quiéreme/Rosa** | Cambiar tema premium (con cooldown 10s) |
| **Maíz/Corn** | Activar Hard Mode |
| **Fuegos Artificiales/Fireworks** | Reproducir video de rose (con cooldown 30s) |
| **Otro regalo** | Reproducir video de agradecimiento (con cooldown 2 min) + 50 pts |

### Regalo "Quiéreme" - Cambio de Temas
Temas disponibles (rotativos):
1. **Rose Gold** (Rosa Premium) - Degradado oscuro con acentos rosados
2. **Lavender Neón** (Lavanda Pastel Chic) - Degradado oscuro con acentos lavanda
3. **Default** (Azul/Verde oscuro) - Tema original

Al cambiar de tema:
1. Flash de color sincronizado con el TTS (rose/lavender/default)
2. Transición suave del fondo (0.8s)
3. Destello en overlay que cubre toda la pantalla

### Video de Agradecimiento
- 4 videos en cola (`/public/video/video1.mp4` a `video4.mp4`)
- Cola de reproducción (no se superponen)
- Pausa el juego mientras se reproduce
- Silencia la música y el TTS durante el video
- Cooldown de 2 minutos por usuario

---

## Sistema de Audio

### Música de Fondo
| Audio | Archivo | Uso |
|---|---|---|
| Música principal | `sounds/main.mp3` | Loop durante todo el juego |
| Sonido magia | `sounds/magic.mp3` | Al acertar una respuesta |
| Sonido victoria | `sounds/win.mp3` | Al final de ronda/torneo |

### Text-to-Speech (TTS)
- **Motor principal**: TikTok TTS API (`tiktok-tts.weilnet.workers.dev`)
- **Voces rotativas**:
  1. `es_mx_002` - Narrador masculino mexicano (muy dinámico)
  2. `es_female_f6` - Voz femenina clásica de TikTok (muy natural)
  3. `es_es_001` - Locutor masculino de España
- **Caché**: Los audios se guardan en `/sounds/` con hash MD5
- **Limpieza automática**: Cada 1 hora se borran archivos de caché antiguos
- **Cola TTS**: Los mensajes se encolan y reproducen secuencialmente
- **Duck audio**: La música se baja a 5% mientras habla la voz
- **Playback rate**: 1.25x para sonido más natural

### Narrador Interactivo
- Cada 2-4 minutos saluda aleatoriamente a un jugador activo
- Frases como: "¡[Nombre]! ¿Estás disfrutando verdad? No olvides apoyar con regalos..."
- Solo se activa si hay jugadores activos en los últimos 5 minutos

### Moderador Bot
- Envía mensajes aleatorios cada 20-40 segundos
- Frases: "¡Responde rápido!", "A ver cuántas aciertas", "¡Se acaba el tiempo!"
- Reproducido por voz TTS

---

## Sistema de Temas Premium

### Tema Default (Azul/Verde oscuro)
- Fondo: Degradado `#090e17` → `#0d1527`
- Acentos: Verde esmeralda (`#10b981`)
- Glass cards: `rgba(20, 20, 30, 0.4)`

### Tema Rose Gold (Rosa Premium)
- Fondo: Degradado `#2a0a14` → `#3d0f22` → `#1a0810`
- Acentos: Rosa (`#ff758c`) y rosa claro (`#ff7eb3`)
- Glow: `0 0 60px rgba(255,117,140,0.2)`
- Flash overlay: Degradado radial rosa

### Tema Lavender Neón (Lavanda Pastel Chic)
- Fondo: Degradado `#0f0818` → `#1a0d2e` → `#0a0614`
- Acentos: Lavanda (`#b19cd9`) y lila (`#d582ff`)
- Glow: `0 0 60px rgba(177,156,217,0.2)`
- Flash overlay: Degradado radial lavanda

### Transiciones
- Cambio de fondo: 0.8s ease
- Flash overlay: Animación de pulso de 0.8s
- Glass cards: transición suave de border y background

---

## Sistema de Torneo (Macro Rondas)

### Estructura
- **1 torneo = 6 rondas macro** = 1 hora de juego
- Cada ronda macro = **5 minutos**
- Entre rondas: 20 segundos de transición con podio

### Flujo de una Ronda Macro
1. Inicio: Se selecciona pregunta aleatoria
2. Primer acierto: Cuenta regresiva de 5 segundos para más aciertos
3. Sin aciertos en 18 segundos: Se pasa automáticamente
4. Fin de ronda: Modal de resultados (4.5s) → Podio (18s) → Siguiente ronda
5. Al terminar las 6 rondas: Podio de campeones absolutos

### Persistencia entre Rondas
- `tournamentStats`: Acumula puntajes de todas las rondas del torneo
- `userStats`: Se resetea cada ronda macro
- Las mascotas **NO** se resetean entre rondas
- Al final del torneo: Se resetea `tournamentStats` y las mascotas

### Donadores
- Se reconocen los **top 3 donadores de regalos** al final de cada ronda
- Si no hay donadores: mensaje especial "no sean tan tacaños"

---

## Sistema de Ranking

### Ranking Semanal (Top 3)
- Persistente en SQLite (`users` table)
- Se acumula hasta reset manual
- Muestra medallas: 🥇 🥈 🥉
- Incluye foto de perfil, nickname y puntaje

### Ranking de Sesión (Top 10)
- Temporal, se resetea cada ronda macro
- Muestra:
  - Medalla o posición numérica
  - Foto de perfil
  - Nickname
  - Puntaje
  - Badge de mascota
  - Indicador de racha (🔥x2) si streak ≥ 3
  - Indicador de multiplicador activo (x2)

### Top Mascotas (Top 5)
- Ordenado por puntos de evolución
- Muestra: posición, emoji de etapa, nombre, dueño, puntos, etapa

---

## Eventos Especiales

### Confetti
- Se activa al final de ronda con ganadores
- Se activa al evolucionar una mascota
- Colores: `#fde047`, `#10b981`, `#06b6d4`, `#ec4899`, `#8b5cf6`

### Animaciones
| Animación | Uso |
|---|---|
| `quiéremePulse` | Flash de overlay al cambiar tema |
| `sabotageSlideUp` | Banner de sabotaje |
| `sabotageScan` | Efecto scan en banner de sabotaje |
| `chatSlideIn` | Mensajes de chat |
| `lightningFlash` | Fondo del podio macro |
| `shakeCrazy` | Efecto shake |
| `shine` | Brillo en tarjetas de resultados |
| `roseFloat` | Icono de maíz flotante |
| `tickerSlide` | Chat ticker |
| `animate-bounce` | Títulos y elementos destacados |
| `animate-pulse` | Banners y temporizadores |

### Notificaciones Toast
- Slide-in desde la derecha
- Iconos detectados automáticamente: 🎁 🌹 🎆 💖
- Formato especial para puntos: `(+X pts)` en badge verde
- Duración: 4.5 segundos
- Eliminación con slide-out

---

## Comandos de Chat

| Comando | Efecto |
|---|---|
| `!maiz` | Alimentar la mascota (+30 hambre) |
| `!a` o `a!` | Unirse al equipo Azul (minijuego) |
| `!r` o `r!` | Unirse al equipo Rojo (minijuego) |
| Respuesta correcta | Sumar puntos (1-10 según posición) |
| Respuesta incorrecta | Restar 1 punto |

---

## Assets del Juego

### Imágenes (`img/`)
| Archivo | Uso |
|---|---|
| `Alicate.png` | Objeto: alicate |
| `Bob Esponja.png` | Personaje: Bob Esponja |
| `Goku.png` | Personaje: Goku |
| `Homero Simpson.png` | Personaje: Homero Simpson |
| `Luffy.png` | Personaje: Luffy |
| `Naruto.png` | Personaje: Naruto |
| `Pikachu.png` | Personaje: Pikachu |
| `Saitama.png` | Personaje: Saitama |
| `Sasuke.png` | Personaje: Sasuke |
| `Shrek.png` | Personaje: Shrek |
| `Vegeta.png` | Personaje: Vegeta |
| `Zoro.png` | Personaje: Zoro |
| `marcas_bg.png` | Fondo de marcas |
| `pausa.png` | Icono de pausa |

### Videos (`public/video/`)
| Archivo | Uso |
|---|---|
| `video1.mp4` | Video de agradecimiento |
| `video2.mp4` | Video de agradecimiento |
| `video3.mp4` | Video de rose/fuegos artificiales |
| `video4.mp4` | Video de agradecimiento |

### Audio (`sounds/`)
- `main.mp3` - Música de fondo en loop
- `magic.mp3` - Sonido al acertar
- `win.mp3` - Sonido de victoria
- 109 archivos `.mp3` de TTS cacheados con nombres hash

---

## Scripts de Inyección (Modificación Dinámica)

El proyecto incluye scripts que modifican dinámicamente archivos del juego:

### `injectThemes.js`
- Inyecta sistema de temas premium en `index.html`
- Inyecta listener de `themeChange` en Socket.IO
- Modifica `gameLogic.js` para cambiar temas con regalo "Quiéreme"
- Reemplaza el viejo sistema de videos de Quiéreme por cambio de temas

### `injectVideos.js`
- Inyecta reproductor de video fullscreen en `index.html`
- Inyecta lógica de cola de videos en el frontend
- Modifica `gameLogic.js` para emitir evento `playThankYouVideo`
- Agrega cooldown de 2 minutos por usuario

### `injectPause.js`
- Agrega variable global `isGamePaused`
- Modifica lógica de video para pausar el juego
- Agrega debug panel con botones de simulación

### `injectHtml.js`
- Inyecta banner de sabotaje en el HTML
- Inyecta UI del minijuego "Tira y Afloja"
- Agrega lógica de toggle entre trivia y minijuego

### `injectMechanics.js`
- Agrega sistema de minijuego completo
- Agrega sistema de sabotaje
- Modifica `handleChat` para priorizar minijuego
- Agrega preguntas fáciles (`isEasy`) al ciclo de rotación

### `refactor.js`
- Migra `weeklyStats.json` a SQLite
- Elimina código del modo ahorcado (hangman)
- Actualiza queries de ranking semanal

---

## Utilidades

### `simulateTikTok.js`
- Simula eventos de TikTok para testing local
- Genera chats, likes, comandos y regalos aleatorios
- Usuarios mock: @Kuro_99, @Misa_chan, @ModBot_Chan, @Sakura_x, etc.
- Países mock para simular aciertos

### `testTTS.js`
- Prueba el sistema TTS con textos cortos y largos
- Verifica que el caché funcione correctamente
- Mide el tamaño de los archivos generados

### `inspectDb.js`
- Inspecciona las tablas de SQLite
- Muestra columnas y cantidad de filas por tabla

---

## Puertos y URLs

| Servicio | URL |
|---|---|
| Juego (frontend + backend) | `http://localhost:3000` |
| Servir videos | `/video/*` |
| Servir imágenes | `/img/*` |
| Socket.IO | `/socket.io/socket.io.js` |
| TTS API externa | `https://tiktok-tts.weilnet.workers.dev/api/generation` |
| Flag CDN | `https://flagcdn.com/256x192/{code}.png` |
| TikTok Live | `@xdinamica` (hardcodeado) |

---

## Dependencias npm (`package.json`)

```json
{
  "dependencies": {
    "@google-cloud/text-to-speech": "^7.0.0",
    "better-sqlite3": "^13.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "google-tts-api": "^2.0.2",
    "socket.io": "^4.8.3",
    "socket.io-client": "^4.8.3",
    "tiktok-live-connector": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

---

## Características Técnicas Destacadas

### Optimización de Audio TTS
- Caché en disco con hash MD5 del texto
- Limpieza automática cada 1 hora
- Cola de reproducción secuencial (no superposición)
- Ducking de música de fondo
- Rotación de 3 voces diferentes
- Playback rate 1.25x para naturalidad

### Optimización de Banderas
- 75% probabilidad de bandera popular
- No se repite la misma bandera consecutivamente
- Pool se vacía y recicla cuando se agotan
- Fallback a emoji si la imagen falla

### Optimización de Preguntas
- No se repite ninguna pregunta hasta agotar todo el banco
- Cada tipo de pregunta tiene su propio `usedSet`
- Al agotarse, se recicla el pool completo

### Tolerancia a Errores
- Fallback de banderas a emojis si `flagcdn.com` falla
- Tolerancia a errores en TTS (continúa el juego sin voz)
- Reconexión automática de TikTok Live
- Try-catch en todas las operaciones de base de datos

### Accesibilidad
- Normalización Unicode para tildes (NFD)
- Múltiples respuestas aceptadas por pregunta
- Textos en español de España y Latinoamérica
- Comandos sin case-sensitivity

---

## Flujo del Juego

```
1. Inicio del servidor
   └── Carga datos (flags, objetos, animales, películas, geografía)
   └── Inicializa base de datos SQLite
   └── Conecta a TikTok Live (@xdinamica)
   └── Inicia GameManager
       ├── Inicia Bot Moderador
       ├── Inicia Narrador Interactivo
       ├── Programa siguiente Hot Round
       └── Inicia juego (selectRandomFlag)

2. Conexión de Frontend
   └── Muestra Salón de Mascotas
   └── Al hacer clic en JUGAR (o Enter):
       ├── Oculta setup overlay
       ├── Inicia partículas de fondo
       ├── Inicia música de fondo (volumen 0.15)
       └── Comienza primera pregunta

3. Ciclo de Preguntas
   ├── Selecciona pregunta aleatoria (cíclico: flag → object → math → animal → easy → movie)
   ├── Reproduce voz TTS con la pregunta
   ├── Espera primer acierto (máx 18s)
   ├── Si hay acierto: 5s adicionales para más aciertos
   ├── Si no hay acierto: pasa a siguiente
   └── Emite resultados (correctos + incorrectos)

4. Eventos en Tiempo Real
   ├── Chat → Procesar respuesta/comando
   ├── Like → Sumar taps → Verificar Frenzy
   ├── Gift → Sumar puntos → Verificar efectos especiales
   ├── Share → Sumar 5 puntos
   └── Follow → Dar bienvenida

5. Fin de Ronda Macro (cada 5 min)
   ├── Calcula top 3 de la ronda
   ├── Muestra podio (18s)
   ├── Anuncia donadores
   └── Después de 20s: Inicia siguiente ronda o fin de torneo

6. Fin de Torneo (6 rondas)
   ├── Calcula campeones absolutos (puntaje acumulado)
   ├── Muestra podio final
   └── Reinicia todo para nuevo torneo
```

---

## Modos de Ejecución

### Modo Producción
```bash
node server.js
```
- Conecta a TikTok Live real
- Sirve el juego en `http://localhost:3000`
- Puerto configurable por `.env`

### Modo Desarrollo
```bash
nodemon server.js
```
- Auto-reload al cambiar archivos
- Mismo comportamiento que producción

### Modo Simulación
```env
SIMULATE_TIKTOK=true
```
```bash
node simulateTikTok.js
```
- No requiere conexión a TikTok real
- Genera eventos simulados (chat, likes, regalos)
- Ideal para testing y desarrollo

---

## Limitaciones y Consideraciones

1. **TikTok Live Connector**: Requiere que el live esté activo y sea público
2. **TTS API**: Depende de servicios externos (TikTok TTS, Google Cloud)
3. **Flag CDN**: Depende de `flagcdn.com` para imágenes de banderas
4. **Base de datos**: SQLite no es ideal para múltiples instancias del servidor
5. **Memoria**: `userStats` se acumula en memoria durante la sesión
6. **Hardcodeado**: TikTok username `@xdinamica` está hardcodeado en `server.js`

---

## Archivos Temporales y de Desarrollo

| Archivo | Propósito |
|---|---|
| `temp_script_0.js` a `temp_script_5.js` | Scripts temporales de desarrollo |
| `weeklyStats.json.bak` | Backup de estadísticas migradas a SQLite |
| `refactor.js` | Utilidad de migración y limpieza de código |

---

*Documento generado el 2026-08-25*
