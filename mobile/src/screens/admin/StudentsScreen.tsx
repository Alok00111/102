import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, Card, Badge, Button, EmptyState } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    usn: string;
    branch: string;
    cgpa: number;
    graduation_year: number;
    is_verified: boolean;
}

export function StudentsScreen(): JSX.Element {
    const { token } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState<string | null>(null);

    useEffect(() => {
        api.get<Student[]>('/admin/students', token).then(data => {
            if (data.success) setStudents(data.data || []);
            setLoading(false);
        });
    }, [token]);

    const handleVerify = async (id: string): Promise<void> => {
        setVerifying(id);
        const result = await api.put(`/admin/students/${id}/verify`, {}, token);
        if (result.success) setStudents(students.map(s => s.id === id ? { ...s, is_verified: true } : s));
        setVerifying(null);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="Students" subtitle={`${students.length} registered`} />
                {students.length === 0 ? <EmptyState message="No students registered" /> :
                    <FlatList
                        data={students}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Card style={styles.studentCard}>
                                <View style={styles.header}>
                                    <View style={styles.info}>
                                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                                        <Text style={styles.email}>{item.email}</Text>
                                    </View>
                                    <Badge text={item.is_verified ? 'Verified' : 'Pending'} variant={item.is_verified ? 'approved' : 'pending'} />
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.detail}>USN: {item.usn}</Text>
                                    <Text style={styles.detail}>Branch: {item.branch}</Text>
                                    <Text style={styles.detail}>CGPA: {item.cgpa}</Text>
                                    <Text style={styles.detail}>Year: {item.graduation_year}</Text>
                                </View>
                                {!item.is_verified && (
                                    <Button title={verifying === item.id ? 'Verifying...' : 'Verify'}
                                        onPress={() => handleVerify(item.id)} loading={verifying === item.id} size="sm" />
                                )}
                            </Card>
                        )}
                    />
                }
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: spacing.lg },
    studentCard: { marginBottom: spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    info: { flex: 1, marginRight: spacing.md },
    name: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
    email: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: 2 },
    details: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
    detail: { fontSize: typography.fontSize.xs, color: colors.textMuted },
});
