import { Crown, X, Star, Sparkles, Users } from 'lucide-react';
import './PremiumPassModal.css';
import { useAppContext } from '../context/useAppContext';

interface Props {
    onClose: () => void;
    followersCount: number;
}

export const PremiumPassModal = ({ onClose, followersCount }: Props) => {
    const followersNeeded = Math.max(0, 100 - followersCount);
    const { sendMessage, users, currentUser } = useAppContext();

    const handleRequestPremium = async () => {
        const adminUser = Object.values(users).find((u: any) => u.username === 'u/Sheddit' || u.username === 'Sheddit' || u.email === 'waldobeatmaker@gmail.com');
        if (adminUser && currentUser) {
            try {
                await sendMessage(adminUser.id, `¡Hola! Quisiera solicitar el Pase Premium. 🌟`);
                alert('Tu solicitud será procesada a la brevedad posible. 💖');
                onClose();
            } catch (err) {
                console.error(err);
                alert('Tu solicitud será procesada a la brevedad posible.');
                onClose();
            }
        } else {
            alert('Tu solicitud será procesada a la brevedad posible.');
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="premium-pass-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="premium-header">
                    <div className="crown-icon">
                        <Crown size={48} />
                    </div>
                    <h2>Pase Premium ✨</h2>
                    <p className="premium-subtitle">Desbloquea el poder de crear comunidades</p>
                </div>

                <div className="requirements-section">
                    <h3>¿Cómo obtenerlo?</h3>

                    <div className="requirement-card">
                        <div className="req-icon followers-icon">
                            <Users size={20} />
                        </div>
                        <div className="req-content">
                            <h4>100 Seguidores</h4>
                            <p>
                                {followersCount >= 100 ? (
                                    <span className="req-complete">✓ ¡Completado!</span>
                                ) : (
                                    <span className="req-progress">
                                        Necesitas {followersNeeded} más ({followersCount}/100)
                                    </span>
                                )}
                            </p>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(100, (followersCount / 100) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-benefits">
                    <h3>Beneficios del Pase Premium</h3>
                    <ul>
                        <li><Star size={16} /> Crear comunidades ilimitadas</li>
                        <li><Sparkles size={16} /> Diseño personalizado de perfil</li>
                        <li><Crown size={16} /> Insignia especial en tu avatar</li>
                        <li><Star size={16} /> Acceso a funciones exclusivas</li>
                    </ul>
                </div>

                <div className="premium-action">
                    <button className="btn-get-premium" onClick={handleRequestPremium}>
                        <Crown size={18} />
                        Obtener Pase Premium
                    </button>
                    <p className="premium-note">* Recibirás respuesta por la mensajería</p>
                </div>
            </div>
        </div>
    );
};
