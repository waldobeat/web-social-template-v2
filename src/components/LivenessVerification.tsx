import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    createLivenessChallenge,
    verifyLivenessChallenge,
    CHALLENGE_INSTRUCTIONS,
    type LivenessChallenge,
    type LivenessChallengeData
} from '../services/liveness';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import './LivenessVerification.css';

export type LivenessVerificationStep = 'intro' | 'camera' | 'processing' | 'result';

export interface LivenessVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified?: () => void;
}

export const LivenessVerification: React.FC<LivenessVerificationProps> = ({
    isOpen,
    onClose,
    onVerified,
}) => {
    const [step, setStep] = useState<LivenessVerificationStep>('intro');
    const [challenge, setChallenge] = useState<LivenessChallengeData | null>(null);
    const [challengeText, setChallengeText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Max retries before cooldown
    const MAX_RETRIES = 3;

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    }, [cameraStream]);

    // Start liveness challenge
    const startChallenge = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const newChallenge = await createLivenessChallenge();
            setChallenge(newChallenge);
            setChallengeText(CHALLENGE_INSTRUCTIONS[newChallenge.challenge]);
            setStep('camera');
            await startCamera();
        } catch (err) {
            console.error('Error creating challenge:', err);
            setError('Error al iniciar la verificación. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, [startCamera]);

    // Capture and verify
    const captureAndVerify = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !challenge) return;

        setIsLoading(true);
        setStep('processing');

        try {
            // Capture frame
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
            }

            // Get base64 image (simplified for demo)
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

            // Verify with backend
            const result = await verifyLivenessChallenge(challenge.id!, imageBase64);

            if (result.success) {
                setSuccess(true);
                setStep('result');

                // Update user profile in Firestore
                if (auth.currentUser) {
                    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                        is_human: true,
                        liveness_verified_at: new Date().toISOString(),
                        onboarding_step: 'complete',
                        account_status: 'active',
                    });
                }

                // Call callback
                if (onVerified) {
                    onVerified();
                }
            } else {
                setError(result.message);
                setStep('result');
            }
        } catch (err) {
            console.error('Error verifying:', err);
            setError('Error al verificar. Intenta de nuevo.');
            setStep('result');
        } finally {
            setIsLoading(false);
        }
    }, [challenge, onVerified]);

    // Retry
    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError('');
        setSuccess(false);
        if (retryCount >= MAX_RETRIES) {
            // Show cooldown message
            setError('Has intentado muchas veces. Por favor espera 15 minutos.');
            return;
        }
        startChallenge();
    };

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setStep('intro');
            setChallenge(null);
            setError('');
            setSuccess(false);
            setRetryCount(0);
        }
    }, [isOpen, stopCamera]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    if (!isOpen) return null;

    return (
        <div className="liveness-modal">
            <div className="liveness-modal__content">
                {/* Progress steps */}
                <div className="liveness-modal__progress">
                    <div className={`liveness-modal__progress-step ${step === 'intro' ? 'liveness-modal__progress-step--active' : 'liveness-modal__progress-step--completed'}`} />
                    <div className={`liveness-modal__progress-step ${step === 'camera' ? 'liveness-modal__progress-step--active' : (step === 'processing' || step === 'result') ? 'liveness-modal__progress-step--completed' : ''}`} />
                    <div className={`liveness-modal__progress-step ${step === 'result' ? 'liveness-modal__progress-step--active' : ''}`} />
                </div>

                {/* Intro step */}
                {step === 'intro' && (
                    <>
                        <div className="liveness-modal__icon">🛡️</div>
                        <h2 className="liveness-modal__title">Verificación de Seguridad</h2>
                        <p className="liveness-modal__description">
                            Para mantener Sheddit seguro, necesitamos verificar que eres una persona real.
                            Esto solo toma un momento y te protege de bots y cuentas falsas.
                        </p>
                        <button
                            className="liveness-modal__button liveness-modal__button--primary"
                            onClick={startChallenge}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Iniciando...' : 'Comenzar Verificación'}
                        </button>
                    </>
                )}

                {/* Camera step */}
                {step === 'camera' && (
                    <>
                        <div className="liveness-modal__challenge">
                            <div className="liveness-modal__challenge-label">Tu desafío</div>
                            <div className="liveness-modal__challenge-text">{challengeText}</div>
                        </div>

                        <div className="liveness-modal__camera-preview">
                            {cameraStream ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="liveness-modal__camera-video"
                                    />
                                    <canvas ref={canvasRef} className="liveness-modal__camera-canvas" />
                                </>
                            ) : (
                                <div className="liveness-modal__camera-placeholder">
                                    <div className="liveness-modal__camera-icon">📷</div>
                                    <div className="liveness-modal__camera-text">Iniciando cámara...</div>
                                </div>
                            )}
                        </div>

                        {error && <p style={{ color: '#E57373', marginBottom: '16px' }}>{error}</p>}

                        <div className="liveness-modal__buttons">
                            <button
                                className="liveness-modal__button liveness-modal__button--secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                className="liveness-modal__button liveness-modal__button--primary"
                                onClick={captureAndVerify}
                                disabled={!cameraStream || isLoading}
                            >
                                {isLoading ? 'Verificando...' : 'Capturar'}
                            </button>
                        </div>
                    </>
                )}

                {/* Processing step */}
                {step === 'processing' && (
                    <>
                        <div className="liveness-modal__icon">🤔</div>
                        <h2 className="liveness-modal__title">Verificando...</h2>
                        <p className="liveness-modal__description">
                            Analizando tu verificación. Por favor espera un momento.
                        </p>
                    </>
                )}

                {/* Result step */}
                {step === 'result' && (
                    <>
                        {success ? (
                            <div className="liveness-modal__result liveness-modal__result--success">
                                <div className="liveness-modal__result-icon">✅</div>
                                <div className="liveness-modal__result-text">
                                    ¡Verificación exitosa! Bienvenido a Sheddit 🐻
                                </div>
                            </div>
                        ) : (
                            <div className="liveness-modal__result liveness-modal__result--error">
                                <div className="liveness-modal__result-icon">❌</div>
                                <div className="liveness-modal__result-text">
                                    {error || 'No pudimos verificar tu identidad'}
                                </div>
                            </div>
                        )}

                        <div className="liveness-modal__buttons">
                            {success ? (
                                <button
                                    className="liveness-modal__button liveness-modal__button--primary"
                                    onClick={onClose}
                                >
                                    Continuar
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="liveness-modal__button liveness-modal__button--secondary"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="liveness-modal__button liveness-modal__button--primary"
                                        onClick={handleRetry}
                                        disabled={retryCount >= MAX_RETRIES}
                                    >
                                        {retryCount >= MAX_RETRIES ? 'Espera requerida' : 'Intentar de nuevo'}
                                    </button>
                                </>
                            )}
                        </div>

                        {!success && retryCount > 0 && (
                            <p className="liveness-modal__retry-info">
                                Intentos: {retryCount}/{MAX_RETRIES}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LivenessVerification;
