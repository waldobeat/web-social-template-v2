import './Footer.css';
import { Shield, Code, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/privacidad" className="footer-link">
            <Shield size={14} />
            <span>Privacidad y Condiciones</span>
          </a>
          <span className="footer-dot">•</span>
          <a href="https://github.com/cafesitoxpressve" target="_blank" rel="noopener noreferrer" className="footer-link">
            <Code size={14} />
            <span>Open Source (cafesitoxpressve)</span>
          </a>
        </div>
        <div className="footer-copyright">
          <span>&copy; {new Date().getFullYear()} Sheddit - Tu red social sin tabú</span>
          <Heart size={12} className="heart-icon" />
        </div>
      </div>
    </footer>
  );
};
