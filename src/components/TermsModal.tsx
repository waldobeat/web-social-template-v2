import './TermsModal.css'

interface TermsModalProps {
    isOpen: boolean
    onClose: () => void
}

function TermsModal({ isOpen, onClose }: TermsModalProps) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Términos de Servicio</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <h3>I. FILOSOFÍA DE PRIVACIDAD</h3>
                    <p>Sheddit opera bajo el principio de Minimización de Datos. No solicitamos, almacenamos ni procesamos nombres legales ni datos sensibles.</p>
                    
                    <h3>II. CÓDIGO DE CONDUCTA</h3>
                    <p>Sheddit es un espacio de libertad de expresión radical. Se prohíbe la violencia, el odio sistémico y el acoso.</p>
                    
                    <h3>III. SUSCRIPCIONES PREMIUM</h3>
                    <p>Los servicios de valor agregado se gestionan mediante procesadores externos seguros. No se realizan reembolsos una vez activado el servicio.</p>

                    <h3>IV. CLÁUSULA DE NO RESPONSABILIDAD</h3>
                    <p>Los usuarios son los únicos responsables por el contenido que publiquen.</p>

                    <p className="modal-full-text">
                        Puedes leer el documento completo en la sección de <a href="/terms" target="_blank">Términos Globales</a>.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="modal-accept-button" onClick={onClose}>Cerrar y Regresar</button>
                </div>
            </div>
        </div>
    )
}

export default TermsModal
