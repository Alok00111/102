export const colors = {
    background: '#fafafa',
    surface: '#ffffff',
    border: '#e5e5e5',
    text: '#1a1a1a',
    textLight: '#6b6b6b',
    textMuted: '#999999',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    badge: {
        pending: { bg: '#fef3c7', text: '#92400e' },
        approved: { bg: '#d1fae5', text: '#065f46' },
        live: { bg: '#dbeafe', text: '#1e40af' },
        rejected: { bg: '#fee2e2', text: '#991b1b' },
        applied: { bg: '#e0e7ff', text: '#3730a3' },
        offered: { bg: '#d1fae5', text: '#065f46' },
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const typography = {
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
} as const;

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
} as const;

export type BadgeVariant = keyof typeof colors.badge | 'default';
