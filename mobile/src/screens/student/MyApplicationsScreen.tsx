import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, Card, Badge, EmptyState } from '../../components';
import { colors, spacing, typography, BadgeVariant } from '../../theme';

interface Application {
    id: string;
    job_title: string;
    company_name: string;
    status: string;
    applied_at: string;
}

type StudentTabParamList = {
    Dashboard: undefined;
    BrowseJobs: undefined;
    MyApplications: undefined;
    Profile: undefined;
};

type Props = {
    navigation: BottomTabNavigationProp<StudentTabParamList, 'MyApplications'>;
};

export function MyApplicationsScreen({ navigation }: Props): JSX.Element {
    const { token } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Application[]>('/student/applications', token).then(data => {
            if (data.success) setApplications(data.data || []);
            setLoading(false);
        });
    }, [token]);

    const getStatusVariant = (status: string): BadgeVariant => {
        const m: Record<string, BadgeVariant> = { applied: 'applied', shortlisted: 'approved', offered: 'approved', rejected: 'rejected' };
        return m[status] || 'pending';
    };

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="My Applications" subtitle={`${applications.length} applications`} />
                {applications.length === 0 ? (
                    <EmptyState message="No applications yet" actionLabel="Browse Jobs" onAction={() => navigation.navigate('BrowseJobs')} />
                ) : (
                    <FlatList
                        data={applications}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Card style={styles.appCard}>
                                <View style={styles.appHeader}>
                                    <View style={styles.appInfo}>
                                        <Text style={styles.jobTitle}>{item.job_title}</Text>
                                        <Text style={styles.company}>{item.company_name}</Text>
                                    </View>
                                    <Badge text={item.status?.replace('_', ' ')} variant={getStatusVariant(item.status)} />
                                </View>
                                <Text style={styles.meta}>Applied: {new Date(item.applied_at).toLocaleDateString()}</Text>
                            </Card>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: spacing.lg },
    appCard: { marginBottom: spacing.md },
    appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    appInfo: { flex: 1, marginRight: spacing.md },
    jobTitle: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
    company: { fontSize: typography.fontSize.sm, color: colors.textLight, marginTop: 2 },
    meta: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: spacing.md },
});
