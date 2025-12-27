import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card, Select } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { api } from '../../utils/api'; // <--- Changed to import 'api'

type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

// 👇 FIXED: Database ID is a number, not a string
interface University {
    id: number; 
    name: string;
}

interface FormData {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    universityId: string;
    usn: string;
    branch: string;
    graduationYear: string;
    companyName: string;
    designation: string;
}

const ROLE_OPTIONS = [
    { label: 'Student', value: 'student' },
    { label: 'Corporate Recruiter', value: 'corporate' },
    { label: 'University Admin', value: 'admin' },
];

const BRANCH_OPTIONS = [
    { label: 'Computer Science', value: 'CSE' },
    { label: 'Information Science', value: 'ISE' },
    { label: 'Electronics', value: 'ECE' },
    { label: 'Mechanical', value: 'ME' },
    { label: 'Civil', value: 'CE' },
    { label: 'Other', value: 'Other' },
];

export function RegisterScreen({ navigation }: RegisterScreenProps): JSX.Element {
    const [formData, setFormData] = useState<FormData>({
        email: '', password: '', role: 'student', firstName: '', lastName: '',
        universityId: '', usn: '', branch: '', graduationYear: String(new Date().getFullYear() + 1),
        companyName: '', designation: '',
    });
    const [universities, setUniversities] = useState<University[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    // 👇 FIXED: Better logging and using the 'api' helper
    useEffect(() => {
        const loadUniversities = async () => {
            try {
                console.log("Fetching universities...");
                const res = await api.get('/universities');
                console.log("Uni Response:", res);
                
                if (res.success && res.data) {
                    setUniversities(res.data);
                } else {
                    console.error("Failed to load unis:", res.message);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            }
        };
        loadUniversities();
    }, []);

    const handleChange = (name: keyof FormData, value: string): void => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (): Promise<void> => {
        setError('');
        setLoading(true);
        const result = await register(formData);
        setLoading(false);
        if (!result.success) setError(result.message || 'Registration failed');
    };

    // 👇 FIXED: Convert Number ID to String for the Dropdown
    const universityOptions = universities.map(u => ({ 
        label: u.name, 
        value: String(u.id) 
    }));

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <Card style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create account</Text>
                            <Text style={styles.subtitle}>Join the placement platform</Text>
                        </View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <Select label="I am a" value={formData.role} onValueChange={v => handleChange('role', v)} options={ROLE_OPTIONS} />

                        <View style={styles.row}>
                            <Input label="First Name" value={formData.firstName} onChangeText={v => handleChange('firstName', v)} style={styles.halfInput} />
                            <Input label="Last Name" value={formData.lastName} onChangeText={v => handleChange('lastName', v)} style={styles.halfInput} />
                        </View>

                        <Input label="Email" value={formData.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" autoCapitalize="none" />
                        <Input label="Password" value={formData.password} onChangeText={v => handleChange('password', v)} secureTextEntry />

                        {(formData.role === 'student' || formData.role === 'admin') && (
                            <Select 
                                label="University" 
                                value={formData.universityId} 
                                onValueChange={v => handleChange('universityId', v)} 
                                options={universityOptions} 
                                placeholder="Select university" 
                            />
                        )}

                        {formData.role === 'student' && (
                            <>
                                <Input label="USN" value={formData.usn} onChangeText={v => handleChange('usn', v)} autoCapitalize="characters" />
                                <View style={styles.row}>
                                    <View style={styles.halfInput}>
                                        <Select label="Branch" value={formData.branch} onValueChange={v => handleChange('branch', v)} options={BRANCH_OPTIONS} />
                                    </View>
                                    <Input label="Grad Year" value={formData.graduationYear} onChangeText={v => handleChange('graduationYear', v)} keyboardType="number-pad" style={styles.halfInput} />
                                </View>
                            </>
                        )}

                        {formData.role === 'corporate' && (
                            <>
                                <Input label="Company Name" value={formData.companyName} onChangeText={v => handleChange('companyName', v)} />
                                <Input label="Designation" value={formData.designation} onChangeText={v => handleChange('designation', v)} />
                            </>
                        )}

                        <Button title={loading ? 'Creating...' : 'Create account'} onPress={handleSubmit}
                            loading={loading} disabled={loading} size="lg" fullWidth style={styles.submitButton} />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Sign in</Text>
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
    card: { maxWidth: 500, alignSelf: 'center', width: '100%' },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    title: { fontSize: typography.fontSize.xxl, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
    subtitle: { fontSize: typography.fontSize.sm, color: colors.textLight },
    error: {
        fontSize: typography.fontSize.sm, color: colors.error, backgroundColor: colors.badge.rejected.bg,
        padding: spacing.md, borderRadius: 4, marginBottom: spacing.md, textAlign: 'center'
    },
    row: { flexDirection: 'row', gap: spacing.md },
    halfInput: { flex: 1 },
    submitButton: { marginTop: spacing.md },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
    footerText: { fontSize: typography.fontSize.sm, color: colors.textLight },
    link: { fontSize: typography.fontSize.sm, color: colors.primary },
});