import './TermsOfService.css'
import { useNavigate } from 'react-router-dom'

function TermsOfService() {
    const navigate = useNavigate()

    return (
        <div className="tos-container">
            <div className="tos-card">
                <div className="tos-header">
                    <h1 className="tos-title">TÉRMINOS DE SERVICIO Y POLÍTICAS DE PRIVACIDAD GLOBAL DE SHEDDIT</h1>
                    <p className="tos-date">Última actualización: 27 de marzo de 2026</p>
                </div>

                <div className="tos-content">
                    <p className="tos-intro">
                        Bienvenido a Sheddit. Al acceder, registrarse o utilizar nuestra plataforma, usted acepta de manera vinculante los siguientes términos. Si no está de acuerdo con alguna de estas cláusulas, le instamos a desconectar su Nodo de nuestra red inmediatamente.
                    </p>

                    <section>
                        <h2>I. FILOSOFÍA DE PRIVACIDAD Y RECOPILACIÓN DE DATOS (DATA MINIMIZATION)</h2>
                        <p>Sheddit opera bajo el principio de Minimización de Datos. A diferencia de las redes sociales convencionales, nuestra arquitectura técnica está diseñada para proteger la identidad del usuario:</p>
                        <ul>
                            <li><strong>Identidad No Vinculada:</strong> No solicitamos, almacenamos ni procesamos nombres legales, números de cédula de identidad, pasaportes, direcciones físicas ni números de teléfono.</li>
                            <li><strong>Protocolo de Comunicación:</strong> Sheddit NUNCA enviará correos electrónicos, SMS o mensajes directos solicitando credenciales de acceso, claves privadas o datos financieros. Cualquier intento de comunicación externa bajo nuestro nombre debe considerarse un ataque de phishing.</li>
                            <li><strong>Logs y Metadatos:</strong> Almacenamos únicamente los registros técnicos necesarios para mantener la estabilidad del servidor y la sesión activa del usuario. Estos datos son cifrados y no se comparten con anunciantes ni terceros.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>II. CÓDIGO DE CONDUCTA Y MODERACIÓN (PROTOCOLOS DE CONVIVENCIA)</h2>
                        <p>Sheddit es un espacio de libertad de expresión radical, pero no es una zona de anarquía absoluta. Para garantizar la persistencia de la red, se prohíbe estrictamente:</p>
                        <ul>
                            <li><strong>Violencia e Incitación:</strong> Cualquier contenido que promueva el daño físico real, terrorismo, autolesión o explotación infantil resultará en la expulsión inmediata y eliminación del Nodo.</li>
                            <li><strong>Odio Sistémico:</strong> No se permitirá el racismo, la xenofobia o la discriminación por orientación sexual o religiosa.</li>
                            <li><strong>Acoso y Difamación:</strong> El uso de la plataforma para el hostigamiento sistemático, insultos personales degradantes o la publicación de información privada de terceros (doxing) está prohibido.</li>
                            <li><strong>Censura vs. Moderación:</strong> Sheddit no censura opiniones por su carga política, ideológica o social. La moderación actúa únicamente ante infracciones directas a este código de conducta.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>III. SISTEMA DE SUSCRIPCIÓN PREMIUM Y TRANSACCIONES FINANCIERAS</h2>
                        <p>Sheddit ofrece servicios de valor agregado mediante suscripciones. La gestión de fondos se rige bajo los siguientes parámetros de seguridad:</p>
                        <ul>
                            <li><strong>Pasarelas de Terceros:</strong> Todas las transacciones se realizan mediante procesadores externos de alta seguridad (PayPal, Binance, Stripe). Sheddit actúa como receptor de la confirmación de pago, pero jamás tiene acceso a sus números de tarjeta, cuentas bancarias o llaves privadas de billeteras (wallets).</li>
                            <li><strong>Confidencialidad del Pago:</strong> La relación financiera es estrictamente entre el usuario y la pasarela de pago seleccionada.</li>
                            <li><strong>Política de Reembolsos:</strong> Debido a la naturaleza digital de los servicios Premium, no se realizarán reembolsos una vez que el servicio haya sido activado en la cuenta del usuario.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>IV. CLÁUSULA DE NO RESPONSABILIDAD (SAFE HARBOR)</h2>
                        <p>Como proveedor de infraestructura tecnológica, Sheddit se acoge a las siguientes limitaciones de responsabilidad:</p>
                        <ul>
                            <li><strong>Contenido de Terceros:</strong> Los usuarios son los únicos responsables legales por el contenido (texto, imágenes, videos) que publiquen, aniden o compartan. Sheddit no pre-visualiza ni edita el contenido antes de su publicación.</li>
                            <li><strong>Conflictos entre Nodos:</strong> Sheddit no actúa como mediador ni se hace responsable por daños morales, financieros o legales derivados de interacciones entre usuarios, a menos que exista un reporte formal que viole el Código de Conducta (Sección II).</li>
                            <li><strong>Fallas Técnicas:</strong> No garantizamos la disponibilidad del 100% del servicio ante ataques DDoS, fallas de infraestructura de terceros (Appwrite/Firebase) o mantenimientos programados.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>V. PROPIEDAD INTELECTUAL Y ALMACENAMIENTO (STORAGE)</h2>
                        <ul>
                            <li><strong>Derechos de Autor:</strong> Al subir contenido a Sheddit, usted conserva todos los derechos de propiedad intelectual, pero otorga a la plataforma una licencia técnica, gratuita y mundial para mostrar, almacenar y distribuir dicho contenido dentro de la red.</li>
                            <li><strong>Uso de Marca:</strong> Los nombres "Sheddit", "Nodar", "Anidados" y sus logotipos asociados son propiedad intelectual del desarrollador. Su uso comercial sin autorización está prohibido.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>VI. DENUNCIAS Y REPORTES</h2>
                        <p>La salud de la red depende de sus Nodos. Sheddit cuenta con herramientas de reporte integradas. La administración solo intervendrá en disputas o eliminará contenido tras la recepción de un reporte válido que demuestre el incumplimiento de estos términos. El silencio ante un conflicto implica que los usuarios involucrados aceptan la interacción bajo su propio riesgo.</p>
                    </section>

                    <section>
                        <h2>VII. ACEPTACIÓN DE TÉRMINOS</h2>
                        <p>El uso continuado de la aplicación constituye la aceptación tácita de este documento. Sheddit se reserva el derecho de modificar estos términos en cualquier momento para adaptarse a nuevas regulaciones o necesidades técnicas, notificando a los usuarios mediante un anuncio global dentro de la plataforma.</p>
                    </section>
                </div>

                <div className="tos-footer">
                    <button className="tos-back-button" onClick={() => navigate(-1)}>
                        Cerrar y Volver
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TermsOfService
