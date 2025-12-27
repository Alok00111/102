import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components';
import { colors, spacing, typography } from '../../theme';

type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: LoginScreenProps): JSX.Element {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (): Promise<void> => {
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (!result.success) setError(result.message || 'Login failed');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <Card style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Welcome back</Text>
                            <Text style={styles.subtitle}>Sign in to your account</Text>
                        </View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com"
                            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                        <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

                        <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={handleSubmit}
                            loading={loading} disabled={loading || !email || !password} size="lg" fullWidth />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.link}>Create one</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
    card: { maxWidth: 400, alignSelf: 'center', width: '100%' },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    title: { fontSize: typography.fontSize.xxl, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
    subtitle: { fontSize: typography.fontSize.sm, color: colors.textLight },
    error: {
        fontSize: typography.fontSize.sm, color: colors.error, backgroundColor: colors.badge.rejected.bg,
        padding: spacing.md, borderRadius: 4, marginBottom: spacing.md, textAlign: 'center'
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
    footerText: { fontSize: typography.fontSize.sm, color: colors.textLight },
    link: { fontSize: typography.fontSize.sm, color: colors.primary },
});
