import { useState, useEffect } from 'react';
import './CookieBanner.css';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner">
        <div className="cookie-content">
          <h3>🍪 Política de Cookies</h3>
          <p>
            En <strong>Sheddit</strong> utilizamos cookies propias y de terceros para mejorar tu experiencia, personalizar el contenido y analizar nuestro tráfico. Al continuar navegando, consideramos que aceptas su uso. ¡Tu experiencia es nuestra prioridad! 🌐
          </p>
        </div>
        <div className="cookie-actions">
          <button className="cookie-btn-outline" onClick={handleDecline}>Solo necesarias</button>
          <button className="cookie-btn-primary" onClick={handleAccept}>Aceptar y Continuar</button>
        </div>
      </div>
    </div>
  );
};
