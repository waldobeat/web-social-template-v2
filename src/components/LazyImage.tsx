import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}

/**
 * Image component with lazy loading
 */
export const LazyImage = ({
    src,
    alt,
    className,
    style,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbm50YW50LWJvcmRlcj0ibm9uZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIGR5PSIuM2VtIj5OdWV2YSBpbWFnZW4gTG9hZGluZy4uLjwvdGV4dD48L3N2Zz4='
}: LazyImageProps) => {
    const { ref, hasIntersected } = useIntersectionObserver({ triggerOnce: true });
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    return (
        <div ref={ref} style={{ position: 'relative', overflow: 'hidden', ...style }}>
            {/* Placeholder */}
            {!isLoaded && !hasError && (
                <img
                    src={placeholder}
                    alt=""
                    className={className}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(10px)',
                        transform: 'scale(1.1)'
                    }}
                />
            )}

            {/* Error state */}
            {hasError && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#888',
                        fontSize: '14px'
                    }}
                >
                    📷 Imagen no disponible
                </div>
            )}

            {/* Actual image */}
            {hasIntersected && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={className}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                />
            )}
        </div>
    );
};
