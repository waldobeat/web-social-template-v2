require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
const SOUNDS_DIR = path.join(__dirname, 'sounds');

// Voces famosas de TikTok en español
const TIKTOK_VOICES = [
    'es_mx_002',    // Narrador masculino mexicano (muy dinámico)
    'es_female_f6', // Voz femenina clásica de TikTok (muy natural)
    'es_es_001'     // Locutor masculino de España
];
let voiceTurn = 0; // Alternador local de locutores

// ─────────────────────────────────────────────────────────────────────────────
// GESTIÓN DE CACHÉ Y DIRECTORIO DE AUDIOS
// ─────────────────────────────────────────────────────────────────────────────
function ensureSoundsDir() {
    if (!fs.existsSync(SOUNDS_DIR)) {
        fs.mkdirSync(SOUNDS_DIR, { recursive: true });
        console.log('📁 [TTS] Carpeta sounds/ creada.');
    }
}

function cleanTTSCache() {
    ensureSoundsDir();
    const files = fs.readdirSync(SOUNDS_DIR);
    let count = 0;
    for (const file of files) {
        if (file.match(/^[a-z0-9_]+_[a-f0-9]{10}\.mp3$/)) {
            fs.unlinkSync(path.join(SOUNDS_DIR, file));
            count++;
        }
    }
    if (count > 0) console.log(`🧹 [TTS] Caché limpiado: ${count} archivos temporales eliminados.`);
}

cleanTTSCache();
setInterval(cleanTTSCache, 3600000);

function getFilenameFromText(text) {
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 10);
    return `${cleanText.substring(0, 20)}_${hash}.mp3`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESCARGA DEL AUDIO DESDE TIKTOK API
// ─────────────────────────────────────────────────────────────────────────────
function downloadTikTokTTS(text, destPath) {
    return new Promise(async (resolve, reject) => {
        const voiceId = TIKTOK_VOICES[voiceTurn % TIKTOK_VOICES.length];
        voiceTurn++;
        
        let safeText = text.replace(/[:]/g, ',');
        
        try {
            const response = await fetch('https://tiktok-tts.weilnet.workers.dev/api/generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: safeText,
                    voice: voiceId
                })
            });

            if (!response.ok) {
                return reject(new Error(`TikTok TTS API returned status code ${response.status}`));
            }

            const json = await response.json();
            if (json.success && json.data) {
                const buffer = Buffer.from(json.data, 'base64');
                fs.writeFileSync(destPath, buffer);
                resolve();
            } else {
                reject(new Error(json.error || 'Unknown API error'));
            }
        } catch (e) {
            reject(e);
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
async function generateTTS(text) {
    ensureSoundsDir();
    const filename = getFilenameFromText(text);
    const filepath = path.join(SOUNDS_DIR, filename);

    if (fs.existsSync(filepath)) {
        console.log(`🔊 [TTS] Cargando desde caché: "${text.substring(0, 40)}..."`);
        return fs.readFileSync(filepath).toString('base64');
    }

    console.log(`🔊 [TTS] Generando audio natural (TikTok): "${text.substring(0, 60)}..."`);

    try {
        await downloadTikTokTTS(text, filepath);

        const audioBuffer = fs.readFileSync(filepath);
        console.log(`✅ [TTS] Audio guardado: ${filename} (${Math.round(audioBuffer.length / 1024)} KB)`);
        return audioBuffer.toString('base64');
    } catch (error) {
        console.error('❌ [TTS] Error generando audio de TikTok:', error.message);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return null;
    }
}

module.exports = { generateTTS };
