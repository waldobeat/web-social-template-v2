import React from 'react';
import './SecurityBadge.css';

export type SecurityBadgeVariant = 'verified' | 'pending' | 'flagged' | 'human' | 'trusted';
export type SecurityBadgeSize = 'small' | 'medium' | 'large';

export interface SecurityBadgeProps {
    variant: SecurityBadgeVariant;
    size?: SecurityBadgeSize;
    showIcon?: boolean;
    className?: string;
    children?: React.ReactNode;
}

// Badge content mapping
const BADGE_CONTENT: Record<SecurityBadgeVariant, { icon: string; label: string }> = {
    verified: {
        icon: '✓',
        label: 'Verificado',
    },
    pending: {
        icon: '⏳',
        label: 'Pendiente',
    },
    flagged: {
        icon: '⚠️',
        label: 'Marcado',
    },
    human: {
        icon: '🧑',
        label: 'Humano',
    },
    trusted: {
        icon: '⭐',
        label: 'De Confianza',
    },
};

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
    variant,
    size = 'medium',
    showIcon = true,
    className = '',
    children,
}) => {
    const content = BADGE_CONTENT[variant];
    const sizeClass = size !== 'medium' ? `security-badge--${size}` : '';

    return (
        <span className={`security-badge security-badge--${variant} ${sizeClass} ${className}`.trim()}>
            {showIcon && <span className="security-badge__icon">{content.icon}</span>}
            {children || content.label}
        </span>
    );
};

// ============================================
// Security Badges Container Component
// ============================================

export interface SecurityBadgesProps {
    isHuman?: boolean;
    livenessVerified?: boolean;
    accountStatus?: 'active' | 'flagged' | 'suspended' | 'temp_blocked';
    isVerified?: boolean;
    isNewUser?: boolean;
    className?: string;
}

export const SecurityBadges: React.FC<SecurityBadgesProps> = ({
    isHuman,
    livenessVerified,
    accountStatus = 'active',
    isVerified,
    isNewUser,
    className = '',
}) => {
    const badges: React.ReactNode[] = [];

    // Human verification badge (passed liveness)
    if (isHuman || livenessVerified) {
        badges.push(
            <SecurityBadge key="human" variant="human">
                Humano
            </SecurityBadge>
        );
    }

    // Verified user badge
    if (isVerified) {
        badges.push(
            <SecurityBadge key="verified" variant="verified">
                Verificado
            </SecurityBadge>
        );
    }

    // Trusted user badge (older account with good standing)
    if (!isNewUser && accountStatus === 'active' && !isHuman) {
        badges.push(
            <SecurityBadge key="trusted" variant="trusted">
                De Confianza
            </SecurityBadge>
        );
    }

    // New user badge
    if (isNewUser) {
        badges.push(
            <SecurityBadge key="new" variant="pending">
                Nuevo
            </SecurityBadge>
        );
    }

    // Flagged/suspended account
    if (accountStatus === 'flagged' || accountStatus === 'suspended' || accountStatus === 'temp_blocked') {
        badges.push(
            <SecurityBadge key="flagged" variant="flagged">
                {accountStatus === 'temp_blocked' ? 'Temporal' : 'Bloqueado'}
            </SecurityBadge>
        );
    }

    if (badges.length === 0) {
        return null;
    }

    return (
        <div className={`security-badges ${className}`.trim()}>
            {badges}
        </div>
    );
};

export default SecurityBadge;
