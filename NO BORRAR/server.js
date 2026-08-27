require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TikTokLiveConnection } = require('tiktok-live-connector');
const path = require('path');
const GameManager = require('./gameLogic');

const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname)));
// Servir videos desde la carpeta video
app.use('/video', express.static(path.join(__dirname, 'video')));
// Intentar servir imágenes desde varias ubicaciones posibles
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/img', express.static(path.join(__dirname, '../img')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const gameManager = new GameManager(io);

app.get('/api/pets', (req, res) => {
    try {
        const pets = gameManager.getAllPets();
        res.json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
gameManager.startGame(); // Auto-arrancar el juego al iniciar el servidor

const tiktokUsername = 'xdinamica';
let tiktokLiveConnection = null;

function connectTikTok(username) {
    if (tiktokLiveConnection) {
        tiktokLiveConnection.disconnect();
    }
    
    console.log(`Conectando a TikTok Live para @${username}...`);
    // Pasar un objeto vacío para evitar el error de opciones undefined
    tiktokLiveConnection = new TikTokLiveConnection(username, { processInitialData: false });

    tiktokLiveConnection.connect().then(state => {
        console.info(`Conectado exitosamente al Live de @${username}`);
        io.emit('notification', { message: `✅ Conectado al Live de @${username}` });
    }).catch(err => {
        console.error('Error conectando a TikTok Live:', err.message);
        io.emit('notification', { message: `❌ Error al conectar con @${username}` });
    });

    tiktokLiveConnection.on('chat', (data) => {
        const username = data.uniqueId || (data.user && data.user.displayId) || (data.user && data.user.uniqueId) || 'unknown';
        const nickname = data.nickname || (data.user && data.user.nickname) || username;
        const profilePic = data.profilePictureUrl || (data.user && data.user.profilePictureUrl) || '';
        const comment = data.comment || data.text || data.message || data.content || '';
        
        console.log(`💬 [CHAT] ${nickname} (@${username}): ${comment}`);
        if (comment) {
            gameManager.handleChat(username, nickname, profilePic, comment);
        }
    });

    tiktokLiveConnection.on('like', (data) => {
        const username = data.uniqueId || (data.user && data.user.displayId) || (data.user && data.user.uniqueId) || 'unknown';
        const nickname = data.nickname || (data.user && data.user.nickname) || username;
        const profilePic = data.profilePictureUrl || (data.user && data.user.profilePictureUrl) || '';
        const count = data.likeCount || data.count || 1;
        
        console.log(`❤️ [LIKE] ${nickname} (@${username}) envió ${count} taps.`);
        gameManager.handleLike(username, nickname, profilePic, count);
    });

    tiktokLiveConnection.on('gift', (data) => {
        const username = data.uniqueId || (data.user && data.user.displayId) || (data.user && data.user.uniqueId) || 'unknown';
        const nickname = data.nickname || (data.user && data.user.nickname) || username;
        const profilePic = data.profilePictureUrl || (data.user && data.user.profilePictureUrl) || '';
        const giftName = data.giftName || (data.gift && data.gift.name) || 'un regalo';
        const count = data.repeatCount || data.count || 1;
        
        console.log(`🎁 [REGALO] ${nickname} (@${username}) envió ${giftName} x${count}`);
        
        // Pass gift to game manager to boost the team
        if (username) {
            gameManager.handleGift(username, nickname, profilePic, giftName, count);
        }
    });

    tiktokLiveConnection.on('share', (data) => {
        const username = data.uniqueId || (data.user && data.user.displayId) || (data.user && data.user.uniqueId) || 'unknown';
        console.log(`🚀 [SHARE] @${username} ha compartido el Live!`);
        if (username) {
            gameManager.handleShare(username);
        }
    });

    tiktokLiveConnection.on('follow', (data) => {
        const username = data.uniqueId || (data.user && data.user.displayId) || (data.user && data.user.uniqueId) || 'unknown';
        const nickname = data.nickname || (data.user && data.user.nickname) || username;
        console.log(`👤 [FOLLOW] ${nickname} (@${username}) ha comenzado a seguirte!`);
        if (username) {
            gameManager.handleFollow(username, nickname);
        }
    });

    tiktokLiveConnection.on('error', (err) => {
        console.error('⚠️ [ERROR TIKTOK]:', err);
    });

    tiktokLiveConnection.on('disconnect', () => {
        console.log('🔴 [DESCONECTADO] Conexión TikTok Live perdida.');
    });
}

connectTikTok(tiktokUsername);

io.on('connection', (socket) => {
    console.log('Cliente frontend conectado:', socket.id);

    gameManager.broadcastState();
    socket.emit('initialPets', gameManager.getAllPets());

    socket.on('setTiktokUsername', (data) => {
        if (data.username) {
            connectTikTok(data.username);
        }
    });

    socket.on('simulateChat', (data) => {
        if (data.message) {
            gameManager.handleChat(data.username, data.username, '', data.message);
        }
    });

    socket.on('simulateLike', (data) => {
        gameManager.handleLike(data.username, data.username, '', data.likeCount);
    });

    socket.on('setMacroPause', (data) => {
        if (gameManager) {
            gameManager.macroPaused = data.paused;
            console.log(`⏸️ [PAUSA] Juego ${data.paused ? 'pausado' : 'reanudado'} por frontend.`);
        }
    });

    socket.on('simulateGift', (data) => {
        gameManager.handleGift(data.username, data.username, '', data.giftName, data.count);
    });

    socket.on('toggleGameMode', (data) => {
        if (data.mode) {
            gameManager.setGameMode(data.mode);
        }
    });



    socket.on('resetGame', () => {
        try {
            const db = gameManager.db;
            db.prepare('DELETE FROM users').run();
            gameManager.userStats = {};
            console.log('🔄 [RESET] Base de datos limpiada. Nueva temporada iniciada.');
            io.emit('notification', { message: '🔄 ¡Nueva Temporada iniciada! Puntajes en cero.' });
            // Actualizar la UI de ranking en tiempo real
            gameManager.broadcastState();
            io.emit('leaderboardUpdate', { topWeekly: [], topSession: [] });
        } catch (e) {
            console.error('❌ [RESET] Error al limpiar la base de datos:', e.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente frontend desconectado:', socket.id);
        gameManager.handleDisconnect(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor de Trivia Live corriendo en http://localhost:${PORT}`);
    if (process.env.SIMULATE_TIKTOK === 'true') {
        console.log('Modo Simulación de TikTok activado.');
    }
});