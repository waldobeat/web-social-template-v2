/**
 * Global Error Boundary Component
 * Catches React errors and prevents app from crashing completely
 */
import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Global Error Boundary to catch unhandled errors
 * Prevents the entire app from crashing on errors
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log error to console for debugging
        console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);

        // Store error info for potential reporting
        this.setState({
            errorInfo,
        });

        // Here you could send to error reporting service like Sentry
        // sendToErrorReportingService(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    fontFamily: 'system-ui',
                    textAlign: 'center',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '30px',
                        borderRadius: '16px',
                        maxWidth: '500px',
                    }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>
                            😅 Ups! Algo salió mal
                        </h1>
                        <p style={{ opacity: 0.8, marginBottom: '20px' }}>
                            No te preocupes, no fue tu culpa. Nuestro equipo técnico ha sido notificado.
                        </p>

                        {/* Error details for debugging (only in development) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                textAlign: 'left',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                fontSize: '12px',
                                maxHeight: '200px',
                                overflow: 'auto',
                            }}>
                                <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                                    🔍 Detalles del error (solo tú puedes ver esto)
                                </summary>
                                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            style={{
                                background: '#fff',
                                color: '#667eea',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🔄 Reintentar
                        </button>

                        <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.6 }}>
                            Si el problema persiste, por favor contacta soporte.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;