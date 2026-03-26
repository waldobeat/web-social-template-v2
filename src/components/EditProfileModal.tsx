import { useState } from 'react';
import { X, BadgeCheck, Sparkles, Wand2 } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import './EditProfileModal.css';

interface Props {
    onClose: () => void;
}

// Categorías de avatares
const AVATAR_OPTIONS = {
    cats: [
        'https://robohash.org/cat1?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat2?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat3?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat4?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat5?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat6?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat7?set=set4&bgset=bg1&size=200x200',
        'https://robohash.org/cat8?set=set4&bgset=bg1&size=200x200',
    ],
    puppies: [
        'https://robohash.org/pup1?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup2?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup3?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup4?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup5?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup6?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup7?set=set1&bgset=bg1&size=200x200',
        'https://robohash.org/pup8?set=set1&bgset=bg1&size=200x200',
    ],
    doves: [
        'https://robohash.org/dove1?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove2?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove3?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove4?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove5?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove6?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove7?set=set2&bgset=bg1&size=200x200',
        'https://robohash.org/dove8?set=set2&bgset=bg1&size=200x200',
    ],
    capybaras: [
        'https://robohash.org/capy1?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy2?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy3?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy4?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy5?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy6?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy7?set=set5&bgset=bg1&size=200x200',
        'https://robohash.org/capy8?set=set5&bgset=bg1&size=200x200',
    ],
};

// Sistema de sugerencias de IA local
const BIO_SUGGESTIONS = {
    default: [
        "✨ Nueva en la comunidad y emocionada de conectar con otras girls! 💖",
        "📚 Amante de la lectura y los buenos días con café ☕",
        "💪 Mamá emprendedora creando mi propio camino 🚀",
        "🌸 Compartiendo positividad y buen vibes por aquí ✨",
        "🎨 Artista digital explorando el mundo creativo 🎭",
        "🐱 Mamá de gatitos y amante de los animales 🐾",
        "💻 Tech girl explorando el mundo de la programación 💕",
        "🌺 Viajera incansable soñando con el siguiente destino ✈️",
    ],
    entrepreneur: [
        "💼 Emprendedora 💪 Creando mi propio legado 🚀",
        "👑CEO de mi propia empresa | Pasión por innovate 🌟",
        "💡 Fundadora | Visionaria | Creadora ✨",
        "🏢 Mi propio jefe | Emprendiendo con garra 💪",
    ],
    fashion: [
        "👗 Fashion lover | Siempre trends 💅",
        "✨ Estilista profesional | Amante de la moda 🎀",
        "💖 Creeando looks que inspiran | Moda con alma 👠",
        "👠 Queen del estilo | Fashion is my life 💄",
    ],
    travel: [
        "✈️ Viajera empedernida | El mundo me espera 🌍",
        "🌎 Explorando esquinas del mundo | Viajera feliz 🗺️",
        "📸 Cazadora de momentos | Viajera y fotógrafa 📷",
        "🌅 Buscando atardeceres en cada rincón del mundo 🌄",
    ],
    foodie: [
        "🍕 Foodie | Mi pasión es la gastronomía 💕",
        "🍰 Repostera | Hornando felicidad diaria 🧁",
        "🥘 Chef casera | Cocinando con amor ❤️",
        "☕ Coffee addict | No hay mañana sin mi café ☕",
    ],
    tech: [
        "💻 Tech girl | Codificando sueños 👩‍💻",
        "🔧 Desarrolladora | El código es mi arte 💡",
        "🚀 Explorando el mundo tech | Code & Coffee ☕",
        "🤖 Tech enthusiast | Aprendiendo cada día 💪",
    ],
    fitness: [
        "💪 Fitness girl | Strong is beautiful 💕",
        "🏋️‍♀️ Gym life | Transformando cuerpo y mente 🧘‍♀️",
        "🏃‍♀️ Runner | Corriendo hacia mis metas ✨",
        "🥗 Healthy lifestyle | Fitness es vida 💚",
    ],
    beauty: [
        "💄 Beauty guru | Maquillando sonrisas ✨",
        "💅 Nail artist | Embelleciendo manos 🖤",
        "💆‍♀️ Skincare lover | La belleza viene de dentro 🌸",
        "👸 Belleza con propósito | Empowering women 💖",
    ],
    music: [
        "🎵 Melómana | Mi banda sonora favorita 🎶",
        "🎸 Music lover | La música es vida 💕",
        "🎤 Cantante en progreso | Soñando en grande 🎤",
        "🎹 Pianista | Creando melodías que tocan el alma 🎹",
    ],
    art: [
        "🎨 Artista | Creando con el corazón ❤️",
        "🖌️ Ilustradora | Dando vida a mis sueños ✨",
        "🎭 Creativa sin límites | Arte es vida 💫",
        "🖼️ Arte en cada detalle | Expresándome libremente 🎨",
    ],
};

// Función para obtener sugerencias basadas en palabras clave
const getBioSuggestions = (username: string): string[] => {
    const lowerUsername = username.toLowerCase();
    const suggestions: string[] = [];

    // Detectar palabras clave en el nombre de usuario
    if (lowerUsername.includes('coach') || lowerUsername.includes('mentor')) {
        suggestions.push(...BIO_SUGGESTIONS.default.slice(0, 3));
    } else if (lowerUsername.includes('artist') || lowerUsername.includes('arte')) {
        suggestions.push(...BIO_SUGGESTIONS.art);
    } else if (lowerUsername.includes('food') || lowerUsername.includes('cocina') || lowerUsername.includes('chef')) {
        suggestions.push(...BIO_SUGGESTIONS.foodie);
    } else if (lowerUsername.includes('travel') || lowerUsername.includes('viaje') || lowerUsername.includes('viajera')) {
        suggestions.push(...BIO_SUGGESTIONS.travel);
    } else if (lowerUsername.includes('tech') || lowerUsername.includes('code') || lowerUsername.includes('dev')) {
        suggestions.push(...BIO_SUGGESTIONS.tech);
    } else if (lowerUsername.includes('fit') || lowerUsername.includes('gym') || lowerUsername.includes('deporte')) {
        suggestions.push(...BIO_SUGGESTIONS.fitness);
    } else if (lowerUsername.includes('beauty') || lowerUsername.includes('moda') || lowerUsername.includes('style')) {
        suggestions.push(...BIO_SUGGESTIONS.fashion);
    } else if (lowerUsername.includes('music') || lowerUsername.includes('musica') || lowerUsername.includes('canto')) {
        suggestions.push(...BIO_SUGGESTIONS.music);
    } else {
        suggestions.push(...BIO_SUGGESTIONS.default);
    }

    // Mezclar y devolver 3 sugerencias aleatorias
    return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
};

export const EditProfileModal = ({ onClose }: Props) => {
    const { currentUser, updateProfile, users, sendMessage } = useAppContext();

    const [username, setUsername] = useState(currentUser?.username?.replace(/^u\//, '') || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [requestVerified, setRequestVerified] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState<'cats' | 'puppies' | 'doves' | 'capybaras'>('cats');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleGetSuggestions = () => {
        const newSuggestions = getBioSuggestions(username);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
    };

    const applySuggestion = (suggestion: string) => {
        setBio(suggestion);
        setShowSuggestions(false);
    };

    const handleSave = async () => {
        setError('');

        if (newPassword || confirmPassword) {
            if (newPassword.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
        }

        setSaving(true);

        try {
            await updateProfile({
                username: `u/${username.replace(/^u\//, '')}`,
                bio,
                avatar: selectedAvatar || currentUser?.avatar,
                isVerified: currentUser?.isVerified || false
            });

            if (requestVerified && !currentUser?.isVerified) {
                const adminUser = Object.values(users).find((u: any) => u.username === 'u/Sheddit' || u.username === 'Sheddit' || u.email === 'waldobeatmaker@gmail.com');
                if (adminUser && currentUser) {
                    try {
                        await sendMessage(adminUser.id, `¡Hola! Quisiera solicitar la verificación de mi cuenta (palomita azul) para el usuario ${currentUser.username}. Quedo atenta a los requisitos. ✨`);
                        alert('Los requisitos para tu verificación serán enviados por mensaje privado. 💖');
                    } catch (err) {
                        console.error('Error enviando solicitud de verificación:', err);
                        alert('Los requisitos para tu verificación serán enviados por mensaje privado.');
                    }
                } else {
                    alert('Los requisitos para tu verificación serán enviados por mensaje privado. 💖');
                }
            } else if (newPassword) {
                alert('Perfil actualizado. 💖');
            }

            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="edit-profile-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Perfil ✨</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {/* Avatar Section */}
                    <div className="avatar-section">
                        <div className="avatar-preview">
                            <img
                                src={selectedAvatar || currentUser?.avatar || 'https://robohash.org/default?set=set4&bgset=bg1&size=200x200'}
                                alt="Tu avatar"
                                className="profile-avatar-img"
                            />
                        </div>

                        {/* Avatar Categories */}
                        <div className="avatar-categories">
                            <button
                                className={`category-btn ${activeCategory === 'cats' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('cats')}
                            >
                                🐱 Gatitas
                            </button>
                            <button
                                className={`category-btn ${activeCategory === 'puppies' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('puppies')}
                            >
                                🐶 Cachorritas
                            </button>
                            <button
                                className={`category-btn ${activeCategory === 'doves' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('doves')}
                            >
                                🕊️ Palomitas
                            </button>
                            <button
                                className={`category-btn ${activeCategory === 'capybaras' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('capybaras')}
                            >
                                🥔 Capibaritas
                            </button>
                        </div>

                        {/* Avatar Grid */}
                        <div className="avatar-grid">
                            {AVATAR_OPTIONS[activeCategory].map((avatarUrl, index) => (
                                <button
                                    key={`${activeCategory}-${index}`}
                                    className={`avatar-option ${selectedAvatar === avatarUrl ? 'selected' : ''}`}
                                    onClick={() => setSelectedAvatar(avatarUrl)}
                                >
                                    <img src={avatarUrl} alt={`Avatar ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Username */}
                    <div className="input-group">
                        <label>Nombre de usuario</label>
                        <div className="username-input-wrapper">
                            <span className="username-prefix">u/</span>
                            <input
                                type="text"
                                value={username.replace(/^u\//, '')}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Tu nombre de usuario"
                                maxLength={30}
                            />
                        </div>
                    </div>

                    {/* Bio with AI Suggestions */}
                    <div className="input-group">
                        <div className="bio-label-row">
                            <label>Biografía</label>
                            <button
                                type="button"
                                className="ai-suggestion-btn"
                                onClick={handleGetSuggestions}
                                title="Obtener sugerencias de IA"
                            >
                                <Wand2 size={14} /> IA Suggestions
                            </button>
                        </div>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Cuéntanos sobre ti... ✨"
                            maxLength={160}
                            rows={3}
                        />
                        <span className="char-count">{bio.length}/160</span>

                        {/* AI Suggestions Panel */}
                        {showSuggestions && (
                            <div className="ai-suggestions-panel">
                                <div className="ai-suggestions-header">
                                    <Sparkles size={16} className="sparkle-icon" />
                                    <span>Sugerencias para tu bio</span>
                                </div>
                                <div className="suggestions-list">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="suggestion-item"
                                            onClick={() => applySuggestion(suggestion)}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="close-suggestions-btn"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Password Change */}
                    <div className="password-section">
                        <h4>Cambiar Contraseña 🔐</h4>
                        <p className="password-hint">Deja vacío si no deseas cambiar tu contraseña</p>

                        <div className="input-group">
                            <label>Nueva contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirmar contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
                            />
                        </div>
                    </div>

                    {/* Verification Request */}
                    <div className="verification-section">
                        <h4><BadgeCheck size={18} /> Solicitar Verificación</h4>
                        <p className="verification-hint">Obtén la palomita azul de cuenta verificada</p>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={requestVerified}
                                onChange={e => setRequestVerified(e.target.checked)}
                                disabled={currentUser?.isVerified}
                            />
                            <span>Quiero solicitar verificación</span>
                        </label>
                        {currentUser?.isVerified && (
                            <p className="verified-status">✓ Ya tienes verificación aprobada</p>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancelar</button>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios 💾'}
                    </button>
                </div>
            </div>
        </div>
    );
};
