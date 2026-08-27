const fs = require('fs');
const path = require('path');
const { generateTTS } = require('./tts');

class GameManager {
    constructor(io) {
        this.io = io;

        const flagsPath = path.join(__dirname, 'flags.json');
        this.flags = JSON.parse(fs.readFileSync(flagsPath, 'utf8'));
        
        const objetosPath = path.join(__dirname, 'objetos.js');
        this.objects = [];
        if (fs.existsSync(objetosPath)) {
            try {
                const objetosData = require(objetosPath);
                this.objects = (objetosData.words || []).map(w => {
                    let image = null;
                    let emoji = null;
                    const imgMatch = w.hint.match(/src=["\\']\/img\/([^"\\']+)["\\']/i);
                    if (imgMatch) {
                        image = imgMatch[1];
                    } else {
                        let cleanText = w.hint.replace(/<[^>]*>/g, '').trim();
                        cleanText = cleanText.replace(/¿Qué es\?|¿Quién es\?|¿Qué objeto es\?|Adivina la figura/gi, '').trim();
                        emoji = cleanText;
                    }
                    return {
                        country: w.word,
                        image: image,
                        emoji: emoji,
                        isObject: true
                    };
                });
            } catch (e) {
                console.error("Error al cargar objetos.js:", e);
            }
        }
        this.usedObjects = new Set();

        const animalsPath = path.join(__dirname, 'animals.json');
        this.animals = fs.existsSync(animalsPath) ? JSON.parse(fs.readFileSync(animalsPath, 'utf8')) : [];
        this.usedAnimals = new Set();

        const moviesPath = path.join(__dirname, 'movies.json');
        this.movies = fs.existsSync(moviesPath) ? JSON.parse(fs.readFileSync(moviesPath, 'utf8')) : [];
        this.usedMovies = new Set();

        const geographyPath = path.join(__dirname, 'geography.json');
        this.geographyQuestions = fs.existsSync(geographyPath) ? JSON.parse(fs.readFileSync(geographyPath, 'utf8')) : [];
        this.usedGeography = new Set();

        this.isHotRound = false;
        this.hotRoundQuestionsLeft = 0;
        this.hotRoundCorrectCounts = {}; 
        
        this.questionTypes = ['flag', 'object', 'math', 'animal', 'easy', 'movie'];
        this.usedEasyQuestions = new Set();
        this.easyQuestions = this.loadJsonQuestions('easy.json');

        this.usedHardQuestions = new Set();
        this.hardQuestions = this.loadJsonQuestions('hard.json');
        
        this.usedSpainQuestions = new Set();
        this.spainQuestions = this.loadJsonQuestions('spain.json');
        this.isSpainRound = false;
        this.spainQuestionsLeft = 0;

        this.currentTypeIndex = 0;
        this.roundTimeout = null;
        
        this.currentFlag = null;
        this.currentLevel = 1;

        this.userStats = {}; 
        this.roundCorrectUsers = []; 
        this.roundIncorrectUsers = [];
        this.roundUserGuesses = {}; 
        this.playerActivity = {};
        this.lastGiftThank = {};
        this.videoCooldowns = {};
        this.gameMode = 'trivia';
        this.currentMacroRound = 1;
        this.totalMacroRounds = 3;
        this.tournamentStats = {};
        this.currentThemeIndex = 0;
        this.themes = ['theme-rose-gold', 'theme-lavender-neon', 'theme-default'];

        // Hard Mode
        this.isHardMode = false;
        this.hardModeTimeLeft = 0;
        this.hardModeInterval = null;
        this.hardModeEndTimeout = null;
        this.hardModeCorrectCounts = {};
        this.gameActive = false;
        this.macroPaused = false;
        
        this.MACRO_TIME = 600; // 10 minutos

        this.macroTimeLeft = this.MACRO_TIME; 
        
        this.globalTaps = 0;
        
        this.isFrenzyMode = false;
        this.frenzyTimeLeft = 0;
        this.FRENZY_DURATION = 60;
        this.FRENZY_MILESTONE = 5000;
        this.nextFrenzyTarget = this.FRENZY_MILESTONE;

        this.INACTIVITY_TIMEOUT = 120000;
                const Database = require('better-sqlite3');
        this.db = new Database(require('path').join(__dirname, 'database.sqlite'));
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                nickname TEXT,
                profilePic TEXT,
                score INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS pets (
                username TEXT PRIMARY KEY,
                pet_name TEXT,
                color TEXT,
                pattern TEXT,
                stage TEXT DEFAULT 'huevo',
                evolution_points INTEGER DEFAULT 0,
                hunger INTEGER DEFAULT 100,
                last_fed DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        this.weeklyStatsFile = require('path').join(__dirname, 'weeklyStats.json');
        if (fs.existsSync(this.weeklyStatsFile)) {
            try {
                const oldStats = JSON.parse(fs.readFileSync(this.weeklyStatsFile, 'utf8'));
                const insert = this.db.prepare('INSERT OR IGNORE INTO users (id, username, nickname, profilePic, score) VALUES (?, ?, ?, ?, ?)');
                this.db.transaction(() => {
                    for (const key in oldStats) {
                        const user = oldStats[key];
                        insert.run(user.username, user.username, user.nickname, user.profilePic || '', user.score);
                    }
                })();
                fs.renameSync(this.weeklyStatsFile, this.weeklyStatsFile + '.bak');
                console.log('Migración de weeklyStats.json a SQLite completada.');
            } catch (e) {
                console.error('Error al migrar weeklyStats.json', e);
            }
        }

        this.roundActive = false;
        this.roundFound = false;
        this.roundEndTimeout = null;
        this.COLLECT_WINDOW = 3000;

        this.usedDrawings = new Set();
        this.roseVideoIndex = 0;
        this.quieremeCooldown = {};
        this.fireworksCooldown = {};

        this.isAnimalMinigameActive = false;
        this.animalMinigamePhase = null;
        this.animalBets = {};
        this.animalMinigameTimer = 0;
        this.animalMinigameInterval = null;
        this.animalRouletteSpinsLeft = 0;
        this.animalRouletteInterval = null;

        this.startGame();
        this.startBot();
        this.startInteractiveNarrator();
        this.startRandomHotRound();
        
        setInterval(() => this.startAnimalMinigame(), 900000); // 15 mins
    }

    loadJsonQuestions(filename) {
        try {
            const data = fs.readFileSync(path.join(__dirname, filename), 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error(`Error loading ${filename}:`, e);
            return [];
        }
    }

    startBot() {
        const botMessages = [
            "¡Bienvenidos a todos! Sigan enviando sus respuestas 🚀",
            "¡La partida dura 10 minutos! Acumula más puntos que nadie 🏆",
            "¡Qué buen nivel tienen! Sigan adivinando 🧠",
            "Recuerden: respuestas equivocadas restan 1 punto personal ⚠️",
            "¡Apoyen con likes y regalitos para destacar! 🎁"
        ];

        const sendRandomMessage = () => {
            if (!this.gameActive || this.macroPaused) return;

            const phrases = [
                '¡Responde rápido!',
                'A ver cuántas aciertas',
                '¡Se acaba el tiempo!',
                '¡Concéntrate y memoriza!'
            ];
            const randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
            
            // Simular mensaje de chat del moderador (opcional)
            this.io.emit('chatMessage', {
                username: '🤖 Moderador',
                profilePic: '',
                message: randomMsg,
                isCorrect: false
            });

            // Reproducir por voz
            this.playVoice(randomMsg);

            const nextInterval = Math.floor(Math.random() * (40000 - 20000 + 1)) + 20000; // 20 a 40 segundos
            this.botTimeout = setTimeout(sendRandomMessage, nextInterval);
        };

        this.botTimeout = setTimeout(sendRandomMessage, 30000);
    }

    getSingleRandomFlag() {
        if (!this.flags || this.flags.length === 0) return null;
        let available = this.flags.filter(item => !this.usedDrawings.has(item.country));
        if (available.length === 0) {
            this.usedDrawings.clear();
            available = this.flags;
        }

        const popularFlags = available.filter(f => f.popular);
        const otherFlags = available.filter(f => !f.popular);
        let pool = [];
        if (popularFlags.length > 0 && Math.random() < 0.75) {
            pool = popularFlags;
        } else if (otherFlags.length > 0) {
            pool = otherFlags;
        } else {
            pool = available;
        }

        let newItem = pool[Math.floor(Math.random() * pool.length)];
        if (this.currentFlag && newItem.country === this.currentFlag.country && pool.length > 1) {
            let attempts = 0;
            while (newItem.country === (this.currentFlag && this.currentFlag.country) && attempts < 10) {
                newItem = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            }
        }

        this.usedDrawings.add(newItem.country);
        return newItem;
    }

    getSingleRandomObject() {
        if (!this.objects || this.objects.length === 0) return null;
        let available = this.objects.filter(item => !this.usedObjects.has(item.country));
        if (available.length === 0) {
            this.usedObjects.clear();
            available = this.objects;
        }
        const newItem = available[Math.floor(Math.random() * available.length)];
        this.usedObjects.add(newItem.country);
        return newItem;
    }

    generateMathQuestion() {
        const operators = ['+', '-', '*'];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let num1, num2, answer, question;
        
        if (op === '+') {
            num1 = Math.floor(Math.random() * 89) + 10;
            num2 = Math.floor(Math.random() * 89) + 10;
            answer = (num1 + num2).toString();
            question = `${num1} + ${num2}`;
        } else if (op === '-') {
            num1 = Math.floor(Math.random() * 89) + 10;
            num2 = Math.floor(Math.random() * (num1 - 9)) + 10;
            answer = (num1 - num2).toString();
            question = `${num1} - ${num2}`;
        } else {
            num1 = Math.floor(Math.random() * 12) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            answer = (num1 * num2).toString();
            question = `${num1} × ${num2}`;
        }
        
        return {
            country: answer,
            question: question,
            isMath: true
        };
    }

    getSingleRandomAnimal() {
        if (!this.animals || this.animals.length === 0) return null;
        let available = this.animals.filter(item => !this.usedAnimals.has(item.country));
        if (available.length === 0) {
            this.usedAnimals.clear();
            available = this.animals;
        }
        const newItem = available[Math.floor(Math.random() * available.length)];
        this.usedAnimals.add(newItem.country);
        return newItem;
    }

    getSingleRandomMovie() {
        if (!this.movies || this.movies.length === 0) return null;
        let available = this.movies.filter(item => !this.usedMovies.has(item.answer));
        if (available.length === 0) {
            this.usedMovies.clear();
            available = this.movies;
        }
        const newItem = available[Math.floor(Math.random() * available.length)];
        this.usedMovies.add(newItem.answer);
        return newItem;
    }

    getSingleRandomEasyQuestion() {
        if (!this.easyQuestions || this.easyQuestions.length === 0) return null;
        let available = this.easyQuestions.filter(item => !this.usedEasyQuestions.has(item.question));
        if (available.length === 0) {
            this.usedEasyQuestions.clear();
            available = this.easyQuestions;
        }
        const newItem = available[Math.floor(Math.random() * available.length)];
        this.usedEasyQuestions.add(newItem.question);
        return newItem;
    }

    getSingleRandomSpainQuestion() {
        if (!this.spainQuestions || this.spainQuestions.length === 0) return null;
        let available = this.spainQuestions.filter(item => !this.usedSpainQuestions.has(item.question));
        if (available.length === 0) {
            this.usedSpainQuestions.clear();
            available = this.spainQuestions;
        }
        const newItem = available[Math.floor(Math.random() * available.length)];
        this.usedSpainQuestions.add(newItem.question);
        newItem.isGeography = true;
        return newItem;
    }

    selectRandomFlag() {
        if (this.roundInterval) {
            clearInterval(this.roundInterval);
            this.roundInterval = null;
        }



        let newItem = null;
        const type = this.questionTypes[this.currentTypeIndex];
        
        if (this.isSpainRound && this.spainQuestionsLeft > 0) {
            newItem = this.getSingleRandomSpainQuestion();
            this.spainQuestionsLeft--;
            if (this.spainQuestionsLeft <= 0) {
                this.isSpainRound = false;
            }
        } else if (type === 'object' && this.objects && this.objects.length > 0) {
            newItem = this.getSingleRandomObject();
        } else if (type === 'math') {
            newItem = this.generateMathQuestion();
        } else if (type === 'animal' && this.animals && this.animals.length > 0) {
            newItem = this.getSingleRandomAnimal();
        } else if (type === 'movie' && this.movies && this.movies.length > 0) {
            newItem = this.getSingleRandomMovie();
        } else if (type === 'easy' && this.easyQuestions && this.easyQuestions.length > 0) {
            newItem = this.getSingleRandomEasyQuestion();
        } else {
            newItem = this.getSingleRandomFlag();
        }

        this.currentTypeIndex = (this.currentTypeIndex + 1) % this.questionTypes.length;

        if (!newItem) {
            newItem = this.getSingleRandomFlag() || this.generateMathQuestion();
        }

        this.currentFlag = newItem;
        this.currentFlags = this.currentFlag ? [this.currentFlag] : [];
        this.roundFound = false;
        this.roundActive = false;
        this.isQuestionCovered = true;
        this.coverTimeLeft = 5;
        this.roundCorrectUsers = [];
        this.roundIncorrectUsers = [];
        this.roundUserGuesses = {};
        
        if (this.roundEndTimeout) {
            clearTimeout(this.roundEndTimeout);
            this.roundEndTimeout = null;
        }
        if (this.roundTimeout) {
            clearTimeout(this.roundTimeout);
            this.roundTimeout = null;
        }

        let randomPhrase;
        if (this.currentFlag && this.currentFlag.isObject) {
            randomPhrase = [
                '¿Qué objeto o personaje es este?',
                'Adivina qué es',
                'Identifica la imagen'
            ][Math.floor(Math.random() * 3)];
        } else if (this.currentFlag && this.currentFlag.isMath) {
            randomPhrase = [
                'Resuelve esta operación',
                '¿Cuánto es?',
                'Calcula el resultado'
            ][Math.floor(Math.random() * 3)];
        } else if (this.currentFlag && this.currentFlag.isAnimal) {
            randomPhrase = [
                '¿Qué animal es este?',
                'Adivina el animal',
                'Identifica este animal'
            ][Math.floor(Math.random() * 3)];
        } else if (this.currentFlag && this.currentFlag.isMovie) {
            randomPhrase = [
                'Adivina la película por los emojis',
                '¿Qué película representan estos emojis?',
                'Adivina el nombre de esta película'
            ][Math.floor(Math.random() * 3)];
        } else if (this.currentFlag && this.currentFlag.isEasy) {
            randomPhrase = this.currentFlag.question;
        } else {
            randomPhrase = [
                '¿Qué bandera es esta?',
                'Adivina el país',
                'Identifica esta bandera'
            ][Math.floor(Math.random() * 3)];
        }
        
        if (this.coverInterval) clearInterval(this.coverInterval);
        
        this.coverInterval = setInterval(() => {
            if (this.macroPaused) return;
            
            this.coverTimeLeft--;
            if (this.coverTimeLeft <= 0) {
                clearInterval(this.coverInterval);
                this.isQuestionCovered = false;
                this.roundActive = true;
                this.broadcastState();
                
                this.playVoice(randomPhrase);
                
                this.roundTimeLeft = 15;
                if (this.roundInterval) clearInterval(this.roundInterval);
                this.roundInterval = setInterval(() => {
                    if (this.macroPaused) return;
                    
                    this.roundTimeLeft--;
                    if (this.roundTimeLeft <= 0) {
                        clearInterval(this.roundInterval);
                        console.log('⏰ [RONDA] 15 segundos agotados. Recopilando 3s...');
                        this.roundActive = false; // Lock answers
                        this.broadcastState();
                        
                        this.roundEndTimeLeft = 3;
                        if (this.roundEndInterval) clearInterval(this.roundEndInterval);
                        this.roundEndInterval = setInterval(() => {
                            if (this.macroPaused) return;
                            
                            this.roundEndTimeLeft--;
                            if (this.roundEndTimeLeft <= 0) {
                                clearInterval(this.roundEndInterval);
                                this.finalizeRound();
                            }
                        }, 1000);
                    }
                }, 1000);
            } else {
                this.broadcastState();
            }
        }, 1000);
        this.broadcastState();
    }

    async playVoice(text) {
        try {
            // Limpiar arrobas, guiones bajos, y emojis/simbolos raros para que el locutor hable natural
            let cleanText = text.replace(/[@#_]/g, ' ');
            // Eliminar emojis (rangos Unicode)
            cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
            cleanText = cleanText.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
            cleanText = cleanText.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
            cleanText = cleanText.replace(/[\u{2600}-\u{26FF}]/gu, '');
            cleanText = cleanText.replace(/[\u{2700}-\u{27BF}]/gu, '');
            // Reducir espacios multiples
            cleanText = cleanText.replace(/\s+/g, ' ').trim();
            
            const audioBase64 = await generateTTS(cleanText);
            if (audioBase64) {
                this.io.emit('playVoice', { audioBase64 });
            }
        } catch (e) {
            console.error('Error in playVoice:', e);
        }
    }

    handleDisconnect(username) {
        delete this.playerActivity[username];
    }

    cleanInactivePlayers() {
        const now = Date.now();
        // Opcional: Eliminar usuarios inactivos del score para no saturar la memoria
        // Pero en un FFA queremos guardar sus puntos hasta que acabe la partida.
        // Así que no borramos userStats aquí, solo playerActivity.
    }

    calculatePetStage(points) {
        if (points >= 2500) return 'dragón';
        if (points >= 1800) return 'cóndor';
        if (points >= 1200) return 'águila';
        if (points >= 800) return 'halcón';
        if (points >= 500) return 'gavilán';
        if (points >= 300) return 'zamuro';
        if (points >= 150) return 'gallo';
        if (points >= 80) return 'pollo';
        if (points >= 30) return 'pollito';
        return 'huevo';
    }

    getOrCreatePet(username) {
        let pet = this.db.prepare('SELECT * FROM pets WHERE username = ?').get(username);
        if (!pet) {
            const colors = ['#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#264653', '#d4a373', '#ffb5a7', '#fcd5ce', '#f8edeb', '#f9dcc4', '#fec89a'];
            const patterns = ['solid', 'striped', 'spotted'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            this.db.prepare(`
                INSERT INTO pets (username, pet_name, color, pattern) 
                VALUES (?, ?, ?, ?)
            `).run(username, `Mascota de ${username}`, color, pattern);
            
            pet = this.db.prepare('SELECT * FROM pets WHERE username = ?').get(username);
            this.io.emit('petCreated', { username, pet });
        } else {
            const hoursPassed = (Date.now() - new Date(pet.last_fed).getTime()) / (1000 * 60 * 60);
            if (hoursPassed > 0.05) { 
                const newHunger = Math.max(0, Math.floor(pet.hunger - (hoursPassed * 5)));
                this.db.prepare('UPDATE pets SET hunger = ?, last_fed = CURRENT_TIMESTAMP WHERE username = ?').run(newHunger, username);
                pet.hunger = newHunger;
            }
        }
        return pet;
    }

    feedPet(username, amount) {
        const pet = this.getOrCreatePet(username);
        if (pet.hunger < 100) {
            const newHunger = Math.min(100, pet.hunger + amount);
            this.db.prepare('UPDATE pets SET hunger = ?, last_fed = CURRENT_TIMESTAMP WHERE username = ?').run(newHunger, username);
            pet.hunger = newHunger;
            this.io.emit('petFed', { username, pet, amount });
        }
    }

    addEvolutionPoints(username, points) {
        const pet = this.getOrCreatePet(username);
        let actualPoints = points;
        
        // Penalización por zona de hambre
        if (pet.hunger === 0) {
            actualPoints = 0; // Dormida - no gana nada
        } else if (pet.hunger <= 29) {
            actualPoints = Math.floor(points * 0.25); // Muy hambrienta - 25%
        } else if (pet.hunger <= 59) {
            actualPoints = Math.floor(points * 0.5); // Hambrienta - 50%
        }
        // 60-100: puntos completos
        
        if (actualPoints > 0) {
            const newPoints = pet.evolution_points + actualPoints;
            const newStage = this.calculatePetStage(newPoints);
            
            this.db.prepare('UPDATE pets SET evolution_points = ?, stage = ? WHERE username = ?').run(newPoints, newStage, username);
            
            if (newStage !== pet.stage) {
                pet.stage = newStage;
                pet.evolution_points = newPoints;
                
                // Pausar el juego para celebrar
                this.macroPaused = true;
                this.io.emit('petEvolved', { username, pet });
                this.playVoice(`¡Guau! La mascota de ${username} acaba de evolucionar a ${newStage}. ¡Muchas Felicidades!`);
                
                // Reanudar despues de 8s
                setTimeout(() => {
                    this.macroPaused = false;
                }, 8000);
            } else {
                pet.evolution_points = newPoints;
                this.io.emit('petUpdated', { username, pet });
            }
        }
    }

    startGame() {
        if (this.gameActive) return;
        
        console.log('🎉 [JUEGO] ¡Partida FFA de 10 Minutos Iniciada!');
        this.gameActive = true;
        this.macroPaused = false;
        this.macroTimeLeft = this.MACRO_TIME;
        this.userStats = {};
        this.globalTaps = 0;
        this.isFrenzyMode = false;
        this.frenzyTimeLeft = 0;
        this.nextFrenzyTarget = this.FRENZY_MILESTONE;
        
        this.selectRandomFlag();

        // Macro-timer (10 minutos)
        this.macroInterval = setInterval(() => {
            if (!this.macroPaused && this.gameActive) {
                this.macroTimeLeft--;
                if (this.macroTimeLeft <= 0) {
                    this.endMacroGame();
                }
                
                // Decrementar contador de frenesí
                if (this.isFrenzyMode) {
                    this.frenzyTimeLeft--;
                    if (this.frenzyTimeLeft <= 0) {
                        this.isFrenzyMode = false;
                        this.io.emit('frenzyEvent', { active: false });
                    }
                }
                
                this.broadcastState();
            }
        }, 1000);

        // Hunger decay: -2 cada 10 minutos a todos los pets activos
        if (this.hungerDecayInterval) clearInterval(this.hungerDecayInterval);
        this.hungerDecayInterval = setInterval(() => {
            if (!this.gameActive) return;
            try {
                const activePets = this.db.prepare('SELECT username, hunger FROM pets WHERE hunger > 0').all();
                for (const pet of activePets) {
                    const newHunger = Math.max(0, pet.hunger - 2);
                    this.db.prepare('UPDATE pets SET hunger = ? WHERE username = ?').run(newHunger, pet.username);
                }
                console.log(`🍖 [HAMBRE] Decay aplicado a ${activePets.length} mascotas (-2 hambre)`);
            } catch(e) {
                console.error('Error in hunger decay:', e);
            }
        }, 10 * 60 * 1000); // Cada 10 minutos

        this.broadcastState();
    }


    getUserMultiplier(username) {
        const now = Date.now();
        const user = this.userStats[username];
        if (user && user.multiplier && user.multiplierUntil && user.multiplierUntil > now) {
            return user.multiplier;
        }
        return 1;
    }

    addPoints(username, nickname, profilePic, basePoints) {
        if (!this.userStats[username]) {
            this.userStats[username] = { username, nickname, profilePic, score: 0, streak: 0 };
        }
        
        let multiplier = 1;
        const now = Date.now();
        if (this.userStats[username].multiplier && this.userStats[username].multiplierUntil > now) {
            multiplier = this.userStats[username].multiplier;
        }
        
        const pointsToAdd = basePoints > 0 ? basePoints * multiplier : basePoints;
        
        this.userStats[username].score = Math.max(0, this.userStats[username].score + pointsToAdd);
        this.addWeeklyPoints(username, nickname, profilePic, pointsToAdd);
        
        if (pointsToAdd > 0) {
            this.addEvolutionPoints(username, pointsToAdd);
        }
        
        return pointsToAdd;
    }

    addWeeklyPoints(username, nickname, profilePic, points) {
        try {
            const stmt = this.db.prepare('INSERT INTO users (id, username, nickname, profilePic, score) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET score = score + ?, nickname = ?, profilePic = excluded.profilePic');
            stmt.run(username, username, nickname, profilePic || '', points, points, nickname);
        } catch(e) {
            console.error('Error in addWeeklyPoints:', e);
        }
    }

    finalizeRound() {
        this.roundActive = false;
        if (this.roundEndInterval) {
            clearInterval(this.roundEndInterval);
            this.roundEndInterval = null;
        }
        if (this.roundInterval) {
            clearInterval(this.roundInterval);
            this.roundInterval = null;
        }

        let voiceMessage = "";

        if (this.roundCorrectUsers.length > 0) {
            const fastestUser = this.roundCorrectUsers[0];
            const fastestNick = fastestUser.nickname || fastestUser.username;
            
            const praisePhrases = [
                `¡Felicidades ${fastestNick}, vas bien!`,
                `¡Felicidades ${fastestNick}, vas muy bien!`,
                `¡Felicidades ${fastestNick}! Vas con todo.`
            ];
            const randomPraise = praisePhrases[Math.floor(Math.random() * praisePhrases.length)];
            voiceMessage += randomPraise + ' ';
        }

        if (voiceMessage.trim() !== "") {
            this.playVoice(voiceMessage.trim());
        }
        
        this.io.emit('roundResults', {
            correctUsers: this.roundCorrectUsers,
            incorrectUsers: this.roundIncorrectUsers
        });

        this.evalTimeLeft = 4;
        if (this.evalInterval) clearInterval(this.evalInterval);
        this.evalInterval = setInterval(() => {
            if (this.macroPaused) return;
            
            this.evalTimeLeft--;
            if (this.evalTimeLeft <= 0) {
                clearInterval(this.evalInterval);
                if (this.isHotRound) {
                    this.hotRoundQuestionsLeft--;
                    this.nextHotRoundQuestion();
                } else if (this.isHardMode) {
                    this.nextHardModeQuestion();
                } else {
                    this.nextRound();
                }
            }
        }, 1000);
    }

    nextRound() {
        if (this.macroPaused) {
            if (!this.pendingNextRound) {
                this.pendingNextRound = setInterval(() => {
                    if (!this.macroPaused) {
                        clearInterval(this.pendingNextRound);
                        this.pendingNextRound = null;
                        this.selectRandomFlag();
                    }
                }, 1000);
            }
            return;
        }

        this.selectRandomFlag();
    }

    endMacroGame() {
        console.log(`🏁 [MACRO] Fin de la ronda ${this.currentMacroRound}`);
        this.macroPaused = true;
        this.roundActive = false;
        if (this.roundEndInterval) {
            clearInterval(this.roundEndInterval);
            this.roundEndInterval = null;
        }
        if (this.roundInterval) {
            clearInterval(this.roundInterval);
            this.roundInterval = null;
        }
        if (this.evalInterval) {
            clearInterval(this.evalInterval);
            this.evalInterval = null;
        }
        
        // Save round score to tournament stats
        for (const username in this.userStats) {
            const user = this.userStats[username];
            if (!this.tournamentStats[username]) {
                this.tournamentStats[username] = { 
                    username: user.username, 
                    nickname: user.nickname, 
                    profilePic: user.profilePic, 
                    score: 0 
                };
            }
            this.tournamentStats[username].score += user.score;
        }

        const top3 = Object.values(this.userStats).sort((a, b) => b.score - a.score).slice(0, 3);
        const isFinal = (this.currentMacroRound >= this.totalMacroRounds);
        
        let endMessage = "";
        let podiumData = [];

        if (isFinal) {
            const tournamentWinners = Object.values(this.tournamentStats)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);
            podiumData = tournamentWinners;

            endMessage = "¡Fin del torneo de una hora! Los campeones absolutos de la jornada son: ";
            if (tournamentWinners[0]) endMessage += `campeón absoluto ${tournamentWinners[0].nickname || tournamentWinners[0].username}, `;
            if (tournamentWinners[1]) endMessage += `segundo lugar para ${tournamentWinners[1].nickname || tournamentWinners[1].username}, `;
            if (tournamentWinners[2]) endMessage += `y tercer lugar para ${tournamentWinners[2].nickname || tournamentWinners[2].username}.`;
            if (tournamentWinners.length === 0) endMessage = "¡Torneo terminado sin puntajes registrados!";
        } else {
            podiumData = top3;
            endMessage = `¡Fin de la ronda ${this.currentMacroRound}! Los ganadores de esta ronda son: `;
            if (top3[0]) endMessage += `primer lugar para ${top3[0].nickname || top3[0].username}, `;
            if (top3[1]) endMessage += `segundo lugar para ${top3[1].nickname || top3[1].username}, `;
            if (top3[2]) endMessage += `y tercer lugar para ${top3[2].nickname || top3[2].username}.`;
            if (top3.length === 0) endMessage = `¡Fin de la ronda ${this.currentMacroRound}! Nadie logró sumar puntos en esta ronda.`;
        }
        
        const topDonators = Object.values(this.userStats)
            .filter(u => u.gifts && u.gifts > 0)
            .sort((a, b) => b.gifts - a.gifts)
            .slice(0, 3);
            
        let donorsMessage = "";
        if (topDonators.length > 0) {
            donorsMessage = " Los mejores donadores de regalos fueron: ";
            topDonators.forEach((d, index) => {
                donorsMessage += `${d.nickname || d.username}${index < topDonators.length - 1 ? ', ' : '.'}`;
            });
        } else {
            donorsMessage = " Chicos no hubo donadores, no sean tan tacaños y apoyen el live.";
        }
        
        endMessage += donorsMessage;
        
        this.playVoice(endMessage);
        
        podiumData.forEach(user => {
            if (user && user.username) {
                try {
                    const pet = this.db.prepare('SELECT * FROM pets WHERE username = ?').get(user.username);
                    if (pet) user.pet = pet;
                } catch (e) {
                    console.error("Error fetching pet for podium", e);
                }
            }
        });
        
        this.io.emit('macroRoundEnd', { 
            top3: podiumData, 
            round: this.currentMacroRound, 
            isFinalRound: isFinal 
        });
        
        this.broadcastNotification(isFinal ? '¡TORNEO TERMINADO! Evaluando a los campeones...' : `¡FIN DE LA RONDA ${this.currentMacroRound}!`);
        
        setTimeout(() => {
            console.log('🔄 [MACRO] Reiniciando partida nueva...');
            this.userStats = {};
            if (isFinal) {
                this.currentMacroRound = 1;
                this.tournamentStats = {};
            } else {
                this.currentMacroRound++;
            }
            // No borramos las mascotas para que mantengan su nivel entre rondas
            // try {
            //     this.db.prepare('DELETE FROM pets').run();
            //     console.log('🔄 [MACRO] Base de datos de mascotas borrada para la nueva partida.');
            // } catch (e) {
            //     console.error("Error deleting pets table:", e);
            // }
            this.macroTimeLeft = this.MACRO_TIME;
            this.macroPaused = false;
            this.selectRandomFlag();
        }, 20000);
    }

    handleChat(username, nickname, profilePic, message) {
        this.playerActivity[username] = Date.now();
        
        let isGuess = true;
        let isCorrect = false;
        const cleanMsgText = message.toLowerCase().trim();
        
        this.getOrCreatePet(username);
        
        if (this.isAnimalMinigameActive && this.animalMinigamePhase === 'betting') {
            const isAnimal = this.animals.find(a => a.country.toLowerCase() === cleanMsgText);
            if (isAnimal) {
                if (!this.animalBets[username]) this.animalBets[username] = [];
                if (this.animalBets[username].length < 5 && !this.animalBets[username].includes(cleanMsgText)) {
                    this.animalBets[username].push(cleanMsgText);
                    this.io.emit('animalMinigameState', {
                        active: true,
                        phase: 'betting',
                        timeLeft: this.animalMinigameTimer,
                        bets: this.animalBets
                    });
                }
            }
        }
        
        // Comando !maiz eliminado - las mascotas se alimentan con taps y respuestas correctas

        if (cleanMsgText === 'rojo' || cleanMsgText === 'azul' || cleanMsgText.length > 50) {
             isGuess = false;
        }



        if (this.roundActive && this.currentFlag) {
            let correctAnswer = '';
            if (this.currentFlag.country) correctAnswer = this.currentFlag.country.toLowerCase().trim();
            else if (this.currentFlag.answer) correctAnswer = this.currentFlag.answer.toLowerCase().trim();
            
            const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            let isAnswerMatch = false;
            if (this.currentFlag.answers && Array.isArray(this.currentFlag.answers)) {
                isAnswerMatch = this.currentFlag.answers.some(ans => {
                    const cleanAns = ans.toLowerCase().trim();
                    return normalize(cleanMsgText) === normalize(cleanAns) || cleanMsgText === cleanAns;
                });
            } else {
                isAnswerMatch = (normalize(cleanMsgText) === normalize(correctAnswer) || cleanMsgText === correctAnswer);
            }
            
            if (isAnswerMatch) {
                // Ignore if the user already guessed correctly in this round
                if (this.roundCorrectUsers.find(u => u.username === username)) {
                    return;
                }
                
                isCorrect = true;
                
                if (!this.userStats[username]) {
                    this.userStats[username] = { username, nickname, profilePic, score: 0, streak: 0 };
                }
                
                const pointsArray = [10, 7, 5, 3, 2, 1];
                const place = this.roundCorrectUsers.length;
                const points = place < pointsArray.length ? pointsArray[place] : 1;
                
                const addedPoints = this.addPoints(username, nickname, profilePic, points);
                
                // Alimentar mascota por respuesta correcta (+5 hambre)
                this.feedPet(username, 5);
                
                // Incrementar racha
                this.userStats[username].streak = (this.userStats[username].streak || 0) + 1;
                
                // Bonus de racha: +15 hambre si llevas 3+ seguidas
                if (this.userStats[username].streak >= 3) {
                    this.feedPet(username, 15);
                }
                
                if (this.isHotRound) {
                    this.hotRoundCorrectCounts[username] = (this.hotRoundCorrectCounts[username] || 0) + 1;
                }
                if (this.isHardMode) {
                    this.hardModeCorrectCounts[username] = (this.hardModeCorrectCounts[username] || 0) + 1;
                }

                this.roundCorrectUsers.push(this.userStats[username]);
                
                console.log(`✅ [ACIERTO] @${username} adivinó en lugar ${place + 1} (+${addedPoints} pts)`);
                
                // Ya NO cortamos el tiempo. Dejamos que corran los 15s.
                if (place === 0) {
                    this.roundFound = true;
                    this.playVoice(`¡Excelente ${nickname || username}, fuiste el primero en acertar!`);
                }
            } else if (isGuess) {
                if (!this.userStats[username]) {
                    this.userStats[username] = { username, nickname, profilePic, score: 0, streak: 0 };
                }
                if (profilePic) this.userStats[username].profilePic = profilePic;
                this.userStats[username].nickname = nickname;
                
                this.userStats[username].streak = 0;
                this.addPoints(username, nickname, profilePic, -1);
                
                if (!this.roundIncorrectUsers) this.roundIncorrectUsers = [];
                if (!Array.isArray(this.roundIncorrectUsers)) {
                    this.roundIncorrectUsers = Object.values(this.roundIncorrectUsers);
                }
                this.roundIncorrectUsers.push(this.userStats[username]);
                
                console.log(`❌ [FALLO] @${username} respondió: ${cleanMsgText}`);
            }
        }

        this.io.emit('chatMessage', {
            username: nickname,
            profilePic,
            message,
            isCorrect,
            isGuess
        });

        this.broadcastState();
    }

    handleFollow(username, nickname) {
        this.playerActivity[username] = Date.now();
        const nick = nickname || username;
        this.playVoice(`¡Bienvenido ${nick}! Gracias por seguir.`);
    }

    handleLike(username, nickname, profilePic, likeCount) {
        this.playerActivity[username] = Date.now();
        const taps = parseInt(likeCount, 10) || 1;
        if (taps <= 0) return;

        if (!this.userStats[username]) {
            this.userStats[username] = { username, nickname, profilePic, score: 0 };
        }
        if (profilePic) this.userStats[username].profilePic = profilePic;

        // Alimentar mascota con taps: +2 hambre por cada 10 taps
        if (!this.userTapAccum) this.userTapAccum = {};
        this.userTapAccum[username] = (this.userTapAccum[username] || 0) + taps;
        if (this.userTapAccum[username] >= 10) {
            const feedTimes = Math.floor(this.userTapAccum[username] / 10);
            this.userTapAccum[username] = this.userTapAccum[username] % 10;
            this.feedPet(username, feedTimes * 2);
        }

        if (this.gameActive && !this.macroPaused) {
            this.globalTaps += taps;
            
            // Check for Frenzy Mode
            if (this.globalTaps >= this.nextFrenzyTarget && !this.isFrenzyMode) {
                this.isFrenzyMode = true;
                this.frenzyTimeLeft = this.FRENZY_DURATION;
                this.nextFrenzyTarget += this.FRENZY_MILESTONE;
                this.playVoice("¡Locura total! Modo frenesí activado. Puntos dobles.");
                this.broadcastNotification("🔥 ¡MODO FRENESÍ x2 ACTIVADO! 🔥");
                this.io.emit('frenzyEvent', { active: true });
            }
            
            // Enviar actualización del progreso de taps intermitentemente o siempre si se prefiere
            this.broadcastState();
        }
    }


    handleGift(username, nickname, profilePic, giftName, count) {
        this.playerActivity[username] = Date.now();
        if (this.gameActive && !this.macroPaused) {
            if (!this.userStats[username]) {
                this.userStats[username] = { username, nickname, profilePic, score: 0, gifts: 0 };
            }
            this.userStats[username].gifts = (this.userStats[username].gifts || 0) + count;
            
            // En lugar de puntos, otorgar un multiplicador x2 temporal por regalo
            const multiplierDuration = 2 * 60 * 1000 * count; // 2 minutos por cada cantidad del regalo
            const currentUntil = this.userStats[username].multiplierUntil || 0;
            this.userStats[username].multiplier = 2;
            
            if (giftName.toLowerCase().includes('fuego') || giftName.toLowerCase().includes('firework') || giftName.toLowerCase().includes('artificial')) {
                this.startAnimalMinigame();
            }
            
            if (giftName.toLowerCase().includes('capibara') || giftName.toLowerCase().includes('capybara')) {
                this.isSpainRound = true;
                this.spainQuestionsLeft = 10;
                this.playVoice("¡Modo España activado! Prepárense para 10 preguntas sobre España.");
            }

            if (currentUntil > Date.now()) { this.userStats[username].multiplierUntil = Math.max(currentUntil, Date.now()) + multiplierDuration; }
            else { this.userStats[username].multiplierUntil = Date.now() + multiplierDuration; }

            const nick = nickname || username;
            
            // Agradecimiento por voz con Debounce (evita spam de la misma voz)
            const now = Date.now();
            const thankKey = `${username}-gift`;
            const lastThank = this.lastGiftThank[thankKey];
            if (!lastThank || (now - lastThank) > 8000) {
                this.lastGiftThank[thankKey] = now;
                this.playVoice(`¡Gracias por el regalo, ${nick}!`);
            }
            
            this.broadcastNotification(`🎁 ¡${nick} ha enviado ${count}x ${giftName}! (Multiplicador x2 activado)`);
            
            // ─── Lógica diferenciada por tipo de regalo ───
            if (/quiereme|quiéreme/i.test(giftName)) {
                // Quiereme: Solo cambia el skin. NO activa video.
                const lastQuiereme = this.quieremeCooldown[username];
                if (!lastQuiereme || (now - lastQuiereme) >= 10000) {
                    this.quieremeCooldown[username] = now;
                    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
                    const newTheme = this.themes[this.currentThemeIndex];
                    this.io.emit('themeChange', { themeClass: newTheme, username: nick });
                }
                this.playVoice(`¡Wow! ${nick} ha cambiado la energía del juego con un Quiéreme.`);
                this.broadcastNotification(`💖 ¡${nick} envió un Quiéreme y cambió el Tema del Juego!`);
            } else {
                // Cualquier otro regalo: aplica cooldown de video de 2 minutos
                const lastVideo = this.videoCooldowns[username];
                if (!lastVideo || (now - lastVideo) >= 120000) {
                    this.videoCooldowns[username] = now;
                    this.io.emit('playThankYouVideo', { username, nickname: nick, giftName });
                }

                if (/rosquilla|donut/i.test(giftName)) {
                    this.startHardMode();
                } else if (/fuegos\s*artificiales|fireworks|firework/i.test(giftName)) {
                    const lastFireworks = this.fireworksCooldown[username];
                    if (!lastFireworks || (now - lastFireworks) >= 30000) {
                        this.fireworksCooldown[username] = now;
                        this.io.emit('roseEvent', { username: nick, giftName, count, videoIndex: 2 });
                    }
                    this.broadcastNotification(`🎆 ¡${nick} envió Fuegos Artificiales!`);
                }
            }
            
            this.broadcastState();
        }
    }

    handleShare(username) {
        this.playerActivity[username] = Date.now();
        if (this.gameActive && !this.macroPaused) {
            if (this.userStats[username]) {
                const nick = this.userStats[username].nickname || username;
                const pic = this.userStats[username].profilePic || '';
                const addedPoints = this.addPoints(username, nick, pic, 5);
                this.broadcastNotification(`¡🚀 ${nick} compartió el Live! (+${addedPoints} pts)`);
                this.playVoice(`¡${nick} compartió el live! ¡Gracias por el apoyo!`);
                this.broadcastState();
            }
        }
    }




    


    broadcastState() {
        this.io.emit('gameStateUpdate', {
            gameActive: this.gameActive,
            macroPaused: this.macroPaused,
            macroTimeLeft: this.macroTimeLeft,
            macroTotalTime: this.MACRO_TIME,
            currentFlag: this.currentFlag,
            currentFlags: this.currentFlags,
            currentLevel: this.currentLevel,
            roundActive: this.roundActive,
            roundFound: this.roundFound,
            isQuestionCovered: this.isQuestionCovered,
            coverTimeLeft: this.coverTimeLeft,
            globalTaps: this.globalTaps,
            isFrenzyMode: this.isFrenzyMode,
            frenzyTimeLeft: this.frenzyTimeLeft,
            gameMode: this.gameMode,
            isHotRound: this.isHotRound,
            hotRoundQuestionsLeft: this.hotRoundQuestionsLeft,
            isHardMode: this.isHardMode,
            hardModeTimeLeft: this.hardModeTimeLeft,
            isSpainRound: this.isSpainRound,
            spainQuestionsLeft: this.spainQuestionsLeft,
            currentMacroRound: this.currentMacroRound,
            totalMacroRounds: this.totalMacroRounds
        });
        this.broadcastLeaderboard();
    }

    getAllPets() {
        try {
            return this.db.prepare('SELECT username, pet_name, color, pattern, stage, evolution_points, hunger FROM pets ORDER BY evolution_points DESC').all();
        } catch (e) {
            console.error('Error fetching all pets:', e);
            return [];
        }
    }

    broadcastLeaderboard() {
        const topUsers = Object.values(this.userStats)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
            
        let topPets = [];
        try {
            topPets = this.db.prepare('SELECT username, pet_name, color, pattern, stage, evolution_points, hunger FROM pets ORDER BY evolution_points DESC LIMIT 5').all();
            topPets = topPets.map(pet => {
                if (this.userStats[pet.username] && this.userStats[pet.username].nickname) {
                    pet.nickname = this.userStats[pet.username].nickname;
                }
                return pet;
            });
        } catch (e) {
            console.error('Error fetching topPets:', e);
        }
            
        let topWeekly = [];
        try {
            topWeekly = this.db.prepare('SELECT username, nickname, profilePic, score FROM users ORDER BY score DESC LIMIT 3').all();
        } catch (e) {
            console.error('Error fetching topWeekly:', e);
        }
            
        const topFastest = Object.values(this.userStats)
            .filter(u => u.fastestTime !== undefined && u.fastestTime < Infinity)
            .sort((a, b) => a.fastestTime - b.fastestTime)
            .slice(0, 3);
            
        this.io.emit('leaderboardUpdate', { topUsers, topPets, topWeekly, topFastest });
    }

    broadcastNotification(message) {
        this.io.emit('notification', {
            message,
            timestamp: Date.now()
        });
    }
    setGameMode(mode) {
        // Obsoleto: Ya no existe el modo ahorcado.
    }

    startHotRound() {
        if (this.isHotRound) return;
        this.isHotRound = true;
        this.hotRoundQuestionsLeft = 10;
        this.hotRoundCorrectCounts = {};
        
        console.log("🔥 [RONDA CALIENTE] Iniciando ronda caliente de geografía!");
        this.io.emit('hotRoundState', { active: true, questionsLeft: 10 });
        this.broadcastNotification("🔥 ¡INICIANDO RONDA CALIENTE DE GEOGRAFÍA! 🔥");
        this.playVoice("¡Atención a todos! Iniciando ronda caliente de geografía. Diez preguntas rápidas. Los que más acierten tendrán puntos dobles por cinco minutos.");
        
        // Cancel normal timeouts
        if (this.roundTimeout) {
            clearTimeout(this.roundTimeout);
            this.roundTimeout = null;
        }
        if (this.roundEndTimeout) {
            clearTimeout(this.roundEndTimeout);
            this.roundEndTimeout = null;
        }
        if (this.evalTimeout) {
            clearTimeout(this.evalTimeout);
            this.evalTimeout = null;
        }

        // Start first question after 4s
        setTimeout(() => {
            this.nextHotRoundQuestion();
        }, 4000);
    }

    nextHotRoundQuestion() {
        if (!this.isHotRound) return;
        if (this.hotRoundQuestionsLeft <= 0) {
            this.endHotRound();
            return;
        }

        if (!this.geographyQuestions || this.geographyQuestions.length === 0) {
            console.error("No geography questions available!");
            this.endHotRound();
            return;
        }

        let available = this.geographyQuestions.filter(q => !this.usedGeography.has(q.question));
        if (available.length === 0) {
            this.usedGeography.clear();
            available = this.geographyQuestions;
        }

        const selected = available[Math.floor(Math.random() * available.length)];
        this.usedGeography.add(selected.question);

        this.currentFlag = selected;
        this.currentFlags = [selected];
        
        this.roundFound = false;
        this.roundActive = true;
        this.roundCorrectUsers = [];
        this.roundIncorrectUsers = [];
        this.roundUserGuesses = {};

        if (this.roundEndTimeout) {
            clearTimeout(this.roundEndTimeout);
            this.roundEndTimeout = null;
        }

        this.roundTimeout = setTimeout(() => {
            console.log('⏰ [RONDA CALIENTE] Tiempo agotado sin aciertos. Siguiente pregunta...');
            this.finalizeRound();
        }, 18000);

        this.playVoice(`Pregunta de geografía. ${selected.question}`);
        this.broadcastState();
        this.io.emit('hotRoundState', { active: true, questionsLeft: this.hotRoundQuestionsLeft });
    }

    endHotRound() {
        this.isHotRound = false;
        this.hotRoundQuestionsLeft = 0;
        this.io.emit('hotRoundState', { active: false, questionsLeft: 0 });

        const entries = Object.entries(this.hotRoundCorrectCounts);
        if (entries.length === 0) {
            this.playVoice("¡Fin de la ronda caliente! Nadie logró responder preguntas de geografía. Reanudando juego normal.");
            this.broadcastNotification("Ronda Caliente terminada sin ganadores.");
            this.nextRound();
            return;
        }

        const maxCorrect = Math.max(...entries.map(e => e[1]));
        const winners = entries.filter(e => e[1] === maxCorrect).map(e => e[0]);

        const winnerNames = [];
        const now = Date.now();
        const duration = 5 * 60 * 1000; // 5 minutes

        winners.forEach(username => {
            if (!this.userStats[username]) {
                this.userStats[username] = { username, nickname: username, score: 0 };
            }
            this.userStats[username].multiplier = 2;
            this.userStats[username].multiplierUntil = now + duration;
            
            const nick = this.userStats[username].nickname || username;
            winnerNames.push(nick);
            
            this.broadcastNotification(`🔥 ¡${nick} gana multiplicador x2 por 5 minutos! 🔥`);
        });

        const winnersStr = winnerNames.join(', ');
        this.playVoice(`¡Ronda caliente terminada! Los ganadores con ${maxCorrect} aciertos son: ${winnersStr}. ¡Tienen puntos dobles por cinco minutos! Reanudando el juego normal.`);
        
        this.broadcastState();

        setTimeout(() => {
            this.nextRound();
        }, 5000);
    }

    startHardMode() {
        if (this.isHardMode || this.isHotRound) return;
        this.isHardMode = true;
        this.hardModeTimeLeft = 180; // 3 minutes
        this.hardModeCorrectCounts = {};
        
        console.log("🍩 [MODO DIFÍCIL] Iniciando modo difícil por 3 minutos!");
        this.broadcastNotification("🍩 ¡ALERTA! ¡MODO DIFÍCIL ACTIVADO POR 3 MINUTOS! 🍩");
        this.playVoice("¡Atención! Han activado el modo difícil con una rosquilla. Tienen tres minutos para responder las preguntas más complicadas. Los mejores tendrán multiplicador por cinco minutos.");
        
        // Cancel normal timeouts
        if (this.roundTimeout) {
            clearTimeout(this.roundTimeout);
            this.roundTimeout = null;
        }
        if (this.roundEndTimeout) {
            clearTimeout(this.roundEndTimeout);
            this.roundEndTimeout = null;
        }
        if (this.evalTimeout) {
            clearTimeout(this.evalTimeout);
            this.evalTimeout = null;
        }

        // Start timer interval
        if (this.hardModeInterval) clearInterval(this.hardModeInterval);
        this.hardModeInterval = setInterval(() => {
            this.hardModeTimeLeft--;
            if (this.hardModeTimeLeft % 10 === 0) {
                this.broadcastState();
            }
            if (this.hardModeTimeLeft <= 0) {
                this.endHardMode();
            }
        }, 1000);

        // Start first question after 4s
        setTimeout(() => {
            this.nextHardModeQuestion();
        }, 4000);
    }

    nextHardModeQuestion() {
        if (!this.isHardMode) return;
        
        let available = this.hardQuestions.filter(q => !this.usedHardQuestions.has(q.question));
        if (available.length === 0) {
            this.usedHardQuestions.clear();
            available = this.hardQuestions;
        }

        const selected = available[Math.floor(Math.random() * available.length)];
        this.usedHardQuestions.add(selected.question);

        this.currentFlag = selected;
        this.currentFlags = [selected];
        
        this.roundFound = false;
        this.roundActive = true;
        this.roundCorrectUsers = [];
        this.roundIncorrectUsers = [];
        this.roundUserGuesses = {};

        if (this.roundEndTimeout) {
            clearTimeout(this.roundEndTimeout);
            this.roundEndTimeout = null;
        }

        this.roundTimeout = setTimeout(() => {
            console.log('⏰ [MODO DIFÍCIL] Tiempo agotado sin aciertos. Siguiente pregunta...');
            this.finalizeRound();
        }, 18000);

        this.playVoice(`Pregunta modo difícil. ${selected.question}`);
        this.broadcastState();
    }

    endHardMode() {
        if (!this.isHardMode) return;
        this.isHardMode = false;
        this.hardModeTimeLeft = 0;
        if (this.hardModeInterval) {
            clearInterval(this.hardModeInterval);
            this.hardModeInterval = null;
        }
        
        const entries = Object.entries(this.hardModeCorrectCounts);
        if (entries.length === 0) {
            this.playVoice("¡Fin del modo difícil! Nadie logró responder las preguntas. Reanudando juego normal.");
            this.broadcastNotification("Modo difícil terminado sin ganadores.");
            this.nextRound();
            return;
        }

        const maxCorrect = Math.max(...entries.map(e => e[1]));
        const winners = entries.filter(e => e[1] === maxCorrect).map(e => e[0]);

        const winnerNames = [];
        const now = Date.now();
        const duration = 5 * 60 * 1000; // 5 minutes

        winners.forEach(username => {
            if (!this.userStats[username]) {
                this.userStats[username] = { username, nickname: username, score: 0 };
            }
            this.userStats[username].multiplier = 2;
            this.userStats[username].multiplierUntil = now + duration;
            
            const nick = this.userStats[username].nickname || username;
            winnerNames.push(nick);
            
            this.broadcastNotification(`🍩 ¡${nick} gana multiplicador x2 por 5 minutos! 🍩`);
        });

        const winnersStr = winnerNames.join(', ');
        this.playVoice(`¡Modo difícil terminado! Los ganadores con ${maxCorrect} aciertos son: ${winnersStr}. ¡Tienen puntos dobles por cinco minutos! Reanudando el juego normal.`);
        
        this.broadcastState();

        setTimeout(() => {
            this.nextRound();
        }, 5000);
    }

    startInteractiveNarrator() {
        const triggerNarrator = () => {
            if (!this.gameActive || this.macroPaused) {
                this.narratorTimeout = setTimeout(triggerNarrator, 30000);
                return;
            }
            
            const now = Date.now();
            const activeUsers = Object.keys(this.playerActivity).filter(username => {
                const lastActive = this.playerActivity[username];
                return (now - lastActive) < 300000 && username !== '🤖 Moderador' && !username.startsWith('TestUser_');
            });
            
            if (activeUsers.length > 0) {
                const randomUser = activeUsers[Math.floor(Math.random() * activeUsers.length)];
                const userObj = this.userStats[randomUser];
                const nick = (userObj && userObj.nickname) || randomUser;
                
                const narratorPhrases = [
                    `¡${nick}! ¿Estás disfrutando verdad? No olvides de apoyar con los regalos para seguir manteniendo este live activo.`,
                    `Oye ${nick}, ¿la estás pasando bien? Recuerda apoyar con regalitos para mantener vivo este gran directo.`,
                    `¡Saludos ${nick}! ¿Te gusta el juego? No olvides de apoyar con tus regalos para que sigamos activos con el live.`
                ];
                const phrase = narratorPhrases[Math.floor(Math.random() * narratorPhrases.length)];
                
                console.log(`🔊 [LOCUTOR] Interactuando con @${randomUser}`);
                this.playVoice(phrase);
                this.broadcastNotification(`💬 Locutor: ¡Gracias por jugar ${nick}! ❤️`);
            }
            
            const nextDelay = (Math.floor(Math.random() * 60) + 120) * 1000;
            this.narratorTimeout = setTimeout(triggerNarrator, nextDelay);
        };
        
        this.narratorTimeout = setTimeout(triggerNarrator, 90000);
    }

    startRandomHotRound() {
        // Fires randomly every 15-25 minutes during an active game
        const scheduleNext = () => {
            // Between 15 and 25 minutes in ms
            const delay = (Math.floor(Math.random() * 10) + 15) * 60 * 1000;
            console.log(`🔥 [RONDA CALIENTE] Próxima ronda automática en ${Math.round(delay/60000)} minutos`);
            this.hotRoundScheduleTimeout = setTimeout(() => {
                if (this.gameActive && !this.macroPaused && !this.isHotRound) {
                    this.startHotRound();
                }
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }
    startAnimalMinigame() {
        if (this.isAnimalMinigameActive) return;
        try {
            this.animals = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'animals.json'), 'utf8'));
        } catch (e) {
            console.error('Error reloading animals.json', e);
        }
        
        this.isAnimalMinigameActive = true;
        this.animalMinigamePhase = 'betting';
        this.animalBets = {};
        this.animalMinigameTimer = 90;
        
        // Pausar juego de trivia principal
        this.macroPaused = true;
        this.broadcastState();
        
        this.playVoice("¡Minijuego de animales! Tienen noventa segundos para escribir hasta 5 animales en el chat.");
        
        this.io.emit('animalMinigameState', {
            active: true,
            phase: 'betting',
            timeLeft: this.animalMinigameTimer,
            bets: this.animalBets
        });
        
        if (this.animalMinigameInterval) clearInterval(this.animalMinigameInterval);
        this.animalMinigameInterval = setInterval(() => {
            this.animalMinigameTimer--;
            if (this.animalMinigameTimer <= 0) {
                clearInterval(this.animalMinigameInterval);
                this.startAnimalRoulettePhase();
            } else {
                this.io.emit('animalMinigameState', {
                    active: true,
                    phase: 'betting',
                    timeLeft: this.animalMinigameTimer,
                    bets: this.animalBets
                });
            }
        }, 1000);
    }

    startAnimalRoulettePhase() {
        this.animalMinigamePhase = 'roulette';
        this.animalRouletteSpinsLeft = 30;
        this.playVoice("¡Tiempo agotado! Girando la ruleta de animales 30 veces.");
        
        this.io.emit('animalMinigameState', {
            active: true,
            phase: 'roulette',
            spinsLeft: this.animalRouletteSpinsLeft,
            bets: this.animalBets
        });
        
        if (this.animalRouletteInterval) clearInterval(this.animalRouletteInterval);
        this.animalRouletteInterval = setInterval(() => {
            this.animalRouletteSpinsLeft--;
            
            const winningAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];
            
            let winners = [];
            for (const username in this.animalBets) {
                if (this.animalBets[username].includes(winningAnimal.country.toLowerCase())) {
                    winners.push(username);
                    try {
                        this.db.prepare('UPDATE pets SET hunger = MIN(100, hunger + 20) WHERE username = ?').run(username);
                    } catch (e) {}
                }
            }
            
            this.io.emit('animalRouletteSpin', {
                animal: winningAnimal,
                winners: winners,
                spinsLeft: this.animalRouletteSpinsLeft
            });
            
            if (this.animalRouletteSpinsLeft <= 0) {
                clearInterval(this.animalRouletteInterval);
                setTimeout(() => {
                    this.isAnimalMinigameActive = false;
                    this.animalMinigamePhase = null;
                    this.io.emit('animalMinigameState', { active: false });
                    
                    // Reanudar juego de trivia principal
                    this.macroPaused = false;
                    this.broadcastState();
                }, 5000);
            }
        }, 2000);
    }
}

module.exports = GameManager;