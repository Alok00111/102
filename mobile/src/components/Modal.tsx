import React, { ReactNode } from 'react';
import {
    Modal as RNModal, View, Text, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ visible, onClose, title, children, footer }: ModalProps): JSX.Element {
    return (
        <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>×</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.body}>{children}</ScrollView>
                    {footer && <View style={styles.footer}>{footer}</View>}
                </View>
            </KeyboardAvoidingView>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    modal: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: { fontSize: typography.fontSize.lg, fontWeight: '600', color: colors.text },
    closeButton: { padding: spacing.xs },
    closeText: { fontSize: 24, color: colors.textMuted },
    body: { padding: spacing.lg },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
