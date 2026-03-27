import { useEffect, useState } from 'react'
import './ThankYou.css'

function ThankYou() {
    const [timeLeft, setTimeLeft] = useState({
        days: 15,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        // Target date: Today + 15 days
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 15);

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="thankyou-container">
            <div className="thankyou-card">
                <div className="thankyou-logo">
                    <img src="/imagen beta.png" alt="Sheddit Logo" className="promo-image" />
                </div>
                
                <h1 className="thankyou-title">¡Gracias por unirte a la red!</h1>
                <p className="thankyou-message">
                    Tu Nodo ha sido creado con éxito. Estamos preparando la infraestructura para el lanzamiento global.
                </p>

                <div className="countdown-container">
                    <p className="countdown-label">Lanzamiento en:</p>
                    <div className="timer">
                        <div className="timer-segment">
                            <span className="timer-value">{timeLeft.days}</span>
                            <span className="timer-unit">Días</span>
                        </div>
                        <div className="timer-segment">
                            <span className="timer-value">{timeLeft.hours}</span>
                            <span className="timer-unit">Horas</span>
                        </div>
                        <div className="timer-segment">
                            <span className="timer-value">{timeLeft.minutes}</span>
                            <span className="timer-unit">Min</span>
                        </div>
                        <div className="timer-segment">
                            <span className="timer-value">{timeLeft.seconds}</span>
                            <span className="timer-unit">Seg</span>
                        </div>
                    </div>
                </div>

                <div className="thankyou-info">
                    <p>Mantente atento a las actualizaciones. Tus beneficios EXCLUSIVOS están asegurados.</p>
                </div>

                <a href="/" className="thankyou-button">Volver al Inicio</a>
            </div>
        </div>
    )
}

export default ThankYou
