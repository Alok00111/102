import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface StatCardProps {
    value: string | number;
    label: string;
    valueColor?: string;
    style?: ViewStyle;
}

export function StatCard({ value, label, valueColor = colors.primary, style }: StatCardProps): JSX.Element {
    return (
        <View style={[styles.card, style]}>
            <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
        flex: 1,
        minWidth: 140,
        ...shadows.sm,
    },
    value: { fontSize: typography.fontSize.xxxl, fontWeight: '700' },
    label: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
        marginTop: spacing.xs,
    },
});
