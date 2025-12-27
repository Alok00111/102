import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export function EmptyState({ message, actionLabel, onAction, style }: EmptyStateProps): JSX.Element {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <Button title={actionLabel} onPress={onAction} style={styles.button} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
    message: { fontSize: typography.fontSize.md, color: colors.textMuted, textAlign: 'center' },
    button: { marginTop: spacing.lg },
});
