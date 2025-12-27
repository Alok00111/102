import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightContent?: ReactNode;
    style?: ViewStyle;
}

export function PageHeader({ title, subtitle, rightContent, style }: PageHeaderProps): JSX.Element {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.left}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {rightContent && <View style={styles.right}>{rightContent}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    left: { flex: 1 },
    title: { fontSize: typography.fontSize.xxl, fontWeight: '600', color: colors.text },
    subtitle: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
    right: { marginLeft: spacing.md },
});
