import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius, typography } from '../theme';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    style?: ViewStyle;
}

export function Select({ label, value, onValueChange, options, placeholder = 'Select...', style }: SelectProps): JSX.Element {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.pickerContainer}>
                <Picker selectedValue={value} onValueChange={onValueChange} style={styles.picker}>
                    <Picker.Item label={placeholder} value="" color={colors.textMuted} />
                    {options.map((opt) => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={colors.text} />
                    ))}
                </Picker>
            </View>
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
    pickerContainer: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    picker: { height: 50 },
});
