import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    fullWidth?: boolean;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    style,
    fullWidth = false,
}: ButtonProps): JSX.Element {
    const buttonStyles: ViewStyle[] = [
        styles.base,
        styles[variant],
        styles[`size_${size}` as keyof typeof styles] as ViewStyle,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textColor = variant === 'secondary' ? colors.text : '#ffffff';

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator size="small" color={textColor} />
            ) : (
                <Text style={[styles.text, { color: textColor }, styles[`textSize_${size}` as keyof typeof styles] as TextStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: 'transparent', borderColor: colors.border },
    danger: { backgroundColor: colors.error },
    size_sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
    size_md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    size_lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    fullWidth: { width: '100%' },
    disabled: { opacity: 0.5 },
    text: { fontWeight: '500' },
    textSize_sm: { fontSize: typography.fontSize.xs },
    textSize_md: { fontSize: typography.fontSize.sm },
    textSize_lg: { fontSize: typography.fontSize.md },
});
