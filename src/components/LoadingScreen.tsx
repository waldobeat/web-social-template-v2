import './LoadingScreen.css';

export const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="lipstick-loader">
        <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="lipstick-svg">
          <defs>
            <linearGradient id="gold-grad" x1="20" y1="32" x2="44" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="0.5" stopColor="#FDE68A" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="pink-grad" x1="24" y1="2" x2="40" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF477E" />
              <stop offset="1" stopColor="#9D0208" />
            </linearGradient>
          </defs>
          
          <g className="lipstick-inner">
            {/* Inner silver tube */}
            <rect x="24" y="22" width="16" height="15" fill="#CBD5E1"/>
            {/* Lipstick color (Vibrant Pink/Ruby) */}
            <path d="M24 22V10C24 6 29 2 32 2C35 2 40 10 40 12V22H24Z" fill="url(#pink-grad)"/>
          </g>

          {/* Base/Case - Lower in code so it draws ON TOP of the inner part */}
          <g className="lipstick-case">
            <rect x="22" y="38" width="20" height="22" rx="3" fill="#333333"/>
            <rect x="24" y="40" width="16" height="20" fill="#1f1f1f"/>
            {/* Middle Ring (Gold) */}
            <rect x="20" y="32" width="24" height="6" rx="1" fill="url(#gold-grad)"/>
            <rect x="20" y="33" width="24" height="2" fill="#FFE58F"/>
          </g>
        </svg>
        <div className="loading-text">Sheddit<span className="dot-anim">...</span></div>
      </div>
    </div>
  );
};
