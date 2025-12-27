import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, Card, Badge, Button, Input, StatCard } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface Profile {
    first_name: string;
    last_name: string;
    email: string;
    usn: string;
    branch: string;
    cgpa: number;
    graduation_year: number;
    phone?: string;
    is_verified: boolean;
    university_name: string;
}

export function ProfileScreen(): JSX.Element {
    const { user, token, logout } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get<Profile>('/student/profile', token).then(data => {
            if (data.success && data.data) {
                setProfile(data.data);
                setFormData(data.data);
            }
            setLoading(false);
        });
    }, [token]);

    const handleSave = async (): Promise<void> => {
        setSaving(true);
        const result = await api.put<Profile>('/student/profile', {
            firstName: formData.first_name, lastName: formData.last_name,
            phone: formData.phone, branch: formData.branch, cgpa: formData.cgpa,
        }, token);
        if (result.success && result.data) {
            setProfile({ ...profile!, ...result.data });
            setEditing(false);
        }
        setSaving(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <PageHeader title="My Profile" subtitle={profile?.university_name}
                    rightContent={!editing && <Button title="Edit" onPress={() => setEditing(true)} variant="secondary" size="sm" />}
                />
                <Card>
                    {editing ? (
                        <>
                            <View style={styles.row}>
                                <Input label="First Name" value={formData.first_name || ''} onChangeText={v => setFormData({ ...formData, first_name: v })} style={styles.half} />
                                <Input label="Last Name" value={formData.last_name || ''} onChangeText={v => setFormData({ ...formData, last_name: v })} style={styles.half} />
                            </View>
                            <Input label="Phone" value={formData.phone || ''} onChangeText={v => setFormData({ ...formData, phone: v })} keyboardType="phone-pad" />
                            <View style={styles.row}>
                                <Input label="Branch" value={formData.branch || ''} onChangeText={v => setFormData({ ...formData, branch: v })} style={styles.half} />
                                <Input label="CGPA" value={String(formData.cgpa || '')} onChangeText={v => setFormData({ ...formData, cgpa: parseFloat(v) || 0 })} keyboardType="decimal-pad" style={styles.half} />
                            </View>
                            <View style={styles.actions}>
                                <Button title={saving ? 'Saving...' : 'Save'} onPress={handleSave} loading={saving} />
                                <Button title="Cancel" onPress={() => { setFormData(profile || {}); setEditing(false); }} variant="secondary" />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.statsRow}>
                                <StatCard value={profile?.cgpa || 'N/A'} label="CGPA" style={styles.stat} />
                                <StatCard value={profile?.graduation_year || 'N/A'} label="Batch" style={styles.stat} />
                            </View>
                            <View style={styles.infoList}>
                                <InfoRow label="Name" value={`${profile?.first_name} ${profile?.last_name}`} />
                                <InfoRow label="Email" value={profile?.email || ''} />
                                <InfoRow label="USN" value={profile?.usn || ''} />
                                <InfoRow label="Branch" value={profile?.branch || ''} />
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Verified</Text>
                                    <Badge text={profile?.is_verified ? 'Yes' : 'Pending'} variant={profile?.is_verified ? 'approved' : 'pending'} />
                                </View>
                            </View>
                            <Button title="Logout" onPress={logout} variant="danger" style={styles.logoutBtn} />
                        </>
                    )}
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.md },
    half: { flex: 1 },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    stat: { flex: 1 },
    infoList: { gap: spacing.sm },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    infoLabel: { fontSize: typography.fontSize.sm, color: colors.textMuted },
    infoValue: { fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.text },
    logoutBtn: { marginTop: spacing.xl },
});
