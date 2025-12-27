import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    style?: ViewStyle;
}

export function Input({ label, error, hint, style, ...props }: InputProps): JSX.Element {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={colors.textMuted}
                {...props}
            />
            {hint && !error && <Text style={styles.hint}>{hint}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: spacing.md },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSize.sm,
        color: colors.text,
    },
    inputError: { borderColor: colors.error },
    hint: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
    error: { fontSize: typography.fontSize.xs, color: colors.error, marginTop: spacing.xs },
});
