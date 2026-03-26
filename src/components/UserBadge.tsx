import './UserBadge.css';

export type BadgeType =
    | 'premium'
    | 'verified'
    | 'popular'
    | 'new'
    | 'rising'
    | 'writer'
    | 'journalist'
    | 'celebrity'
    | 'influencer'
    | 'fashion'
    | 'foodie'
    | 'travel'
    | 'tech'
    | 'art'
    | 'music'
    | 'fitness'
    | 'beauty'
    | 'mom'
    | 'entrepreneur'
    | 'moderator';

interface BadgeConfig {
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    description: string;
}

export const BADGE_CONFIG: Record<BadgeType, BadgeConfig> = {
    premium: {
        label: 'Premium',
        emoji: '👑',
        color: '#FFD700',
        bgColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
        description: 'Usuario con pase premium'
    },
    verified: {
        label: 'Verificado',
        emoji: '✓',
        color: '#1DA1F2',
        bgColor: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)',
        description: 'Cuenta verificada oficialmente'
    },
    popular: {
        label: 'Popular',
        emoji: '🔥',
        color: '#FF4500',
        bgColor: 'linear-gradient(135deg, #FF4500, #FF6B35)',
        description: 'Más de 1000 seguidores'
    },
    new: {
        label: 'Nuevo',
        emoji: '🌟',
        color: '#9B59B6',
        bgColor: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
        description: 'Usuario reciente'
    },
    rising: {
        label: 'En Ascenso',
        emoji: '🚀',
        color: '#E74C3C',
        bgColor: 'linear-gradient(135deg, #E74C3C, #C0392B)',
        description: 'Crecimiento acelerado'
    },
    writer: {
        label: 'Redactora',
        emoji: '✍️',
        color: '#2ECC71',
        bgColor: 'linear-gradient(135deg, #2ECC71, #27AE60)',
        description: 'Creadora de contenido destacado'
    },
    journalist: {
        label: 'Periodista',
        emoji: '📰',
        color: '#3498DB',
        bgColor: 'linear-gradient(135deg, #3498DB, #2980B9)',
        description: 'Reportera verificada'
    },
    celebrity: {
        label: 'Farándula',
        emoji: '💃',
        color: '#E91E63',
        bgColor: 'linear-gradient(135deg, #E91E63, #C2185B)',
        description: 'Celebridad famosa'
    },
    influencer: {
        label: 'Influencer',
        emoji: '💫',
        color: '#FF69B4',
        bgColor: 'linear-gradient(135deg, #FF69B4, #FF1493)',
        description: 'Gran influencia social'
    },
    fashion: {
        label: 'Moda',
        emoji: '👗',
        color: '#FF69B4',
        bgColor: 'linear-gradient(135deg, #FF69B4, #FF1493)',
        description: 'Experta en moda'
    },
    foodie: {
        label: 'Foodie',
        emoji: '🍕',
        color: '#FF5722',
        bgColor: 'linear-gradient(135deg, #FF5722, #E64A19)',
        description: 'Amante de la gastronomía'
    },
    travel: {
        label: 'Viajera',
        emoji: '✈️',
        color: '#00BCD4',
        bgColor: 'linear-gradient(135deg, #00BCD4, #0097A7)',
        description: 'Aventurera frecuente'
    },
    tech: {
        label: 'Tech',
        emoji: '💻',
        color: '#607D8B',
        bgColor: 'linear-gradient(135deg, #607D8B, #455A64)',
        description: 'Entusiasta de tecnología'
    },
    art: {
        label: 'Arte',
        emoji: '🎨',
        color: '#9C27B0',
        bgColor: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
        description: 'Artista creativa'
    },
    music: {
        label: 'Música',
        emoji: '🎵',
        color: '#673AB7',
        bgColor: 'linear-gradient(135deg, #673AB7, #512DA8)',
        description: 'Amante de la música'
    },
    fitness: {
        label: 'Fitness',
        emoji: '💪',
        color: '#F44336',
        bgColor: 'linear-gradient(135deg, #F44336, #D32F2F)',
        description: 'Deportista dedicada'
    },
    beauty: {
        label: 'Belleza',
        emoji: '💄',
        color: '#F06292',
        bgColor: 'linear-gradient(135deg, #F06292, #EC407A)',
        description: 'Experta en belleza'
    },
    mom: {
        label: 'Mamá',
        emoji: '👶',
        color: '#FF9800',
        bgColor: 'linear-gradient(135deg, #FF9800, #F57C00)',
        description: 'Mamá orgullosa'
    },
    entrepreneur: {
        label: 'Emprendedora',
        emoji: '💼',
        color: '#795548',
        bgColor: 'linear-gradient(135deg, #795548, #5D4037)',
        description: 'Empresaria exitosa'
    },
    moderator: {
        label: 'Moderadora',
        emoji: '🛡️',
        color: '#27AE60',
        bgColor: 'linear-gradient(135deg, #27AE60, #2ECC71)',
        description: 'Moderadora de la comunidad'
    }
};

interface UserBadgeProps {
    type: BadgeType;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

export const UserBadge = ({ type, size = 'medium', showLabel = false }: UserBadgeProps) => {
    const config = BADGE_CONFIG[type];

    return (
        <span
            className={`user-badge badge-${size}`}
            style={{
                background: config.bgColor,
                color: 'white'
            }}
            title={config.description}
        >
            {config.emoji}
            {showLabel && <span className="badge-label">{config.label}</span>}
        </span>
    );
};

interface BadgeListProps {
    badges: BadgeType[];
    maxVisible?: number;
    size?: 'small' | 'medium' | 'large';
}

export const BadgeList = ({ badges, maxVisible = 3, size = 'small' }: BadgeListProps) => {
    const visibleBadges = badges.slice(0, maxVisible);
    const hiddenCount = badges.length - maxVisible;

    return (
        <div className="badge-list">
            {visibleBadges.map((badge, index) => (
                <UserBadge key={index} type={badge} size={size} />
            ))}
            {hiddenCount > 0 && (
                <span className="badge-more" title={badges.slice(maxVisible).map(b => BADGE_CONFIG[b].label).join(', ')}>
                    +{hiddenCount}
                </span>
            )}
        </div>
    );
};
