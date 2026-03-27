function ThankYou() {
    return (
        <div className="thankyou-container">
            <div className="thankyou-card">
                <div className="thankyou-icon">🎉</div>
                <h1 className="thankyou-title">¡Gracias por registrarte!</h1>
                <p className="thankyou-message">
                    Tu cuenta ha sido creada exitosamente.
                    Bienvenido a la comunidad SHEDDIT.
                </p>
                <div className="thankyou-info">
                    <p>Pronto recibirás más información en tu correo.</p>
                </div>
                <a href="/" className="thankyou-button">
                    Volver al inicio
                </a>
            </div>
        </div>
    )
}

export default ThankYou
