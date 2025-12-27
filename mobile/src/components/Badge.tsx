import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, BadgeVariant } from '../theme';

interface BadgeProps {
    text: string;
    variant?: BadgeVariant;
    style?: ViewStyle;
}

export function Badge({ text, variant = 'default', style }: BadgeProps): JSX.Element {
    const badgeColors = {
        pending: colors.badge.pending,
        approved: colors.badge.approved,
        live: colors.badge.live,
        rejected: colors.badge.rejected,
        applied: colors.badge.applied,
        offered: colors.badge.offered,
        default: { bg: colors.background, text: colors.textLight },
    };
    const c = badgeColors[variant] || badgeColors.default;

    return (
        <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
            <Text style={[styles.text, { color: c.text }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: typography.fontSize.xs,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
});
