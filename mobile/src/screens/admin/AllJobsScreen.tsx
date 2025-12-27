import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, Card, Badge, Select, EmptyState } from '../../components';
import { colors, spacing, typography, BadgeVariant } from '../../theme';

interface Job {
    id: string;
    title: string;
    company_name: string;
    job_type: string;
    status: string;
    created_at: string;
}

const STATUS_OPTIONS = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Live', value: 'live' },
    { label: 'Rejected', value: 'rejected' },
];

export function AllJobsScreen(): JSX.Element {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        setLoading(true);
        const endpoint = filter ? `/admin/jobs?status=${filter}` : '/admin/jobs';
        api.get<Job[]>(endpoint, token).then(data => {
            if (data.success) setJobs(data.data || []);
            setLoading(false);
        });
    }, [filter, token]);

    const getVariant = (s: string): BadgeVariant => {
        const m: Record<string, BadgeVariant> = { pending: 'pending', live: 'live', rejected: 'rejected' };
        return m[s] || 'default';
    };

    if (loading && jobs.length === 0) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="All Jobs" subtitle={`${jobs.length} jobs`} />
                <Card style={styles.filterCard}>
                    <Select value={filter} onValueChange={setFilter} options={STATUS_OPTIONS} placeholder="All Status" />
                </Card>
                {jobs.length === 0 ? <EmptyState message="No jobs found" /> :
                    <FlatList
                        data={jobs}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Card style={styles.jobCard}>
                                <View style={styles.header}>
                                    <View style={styles.info}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.company}>{item.company_name}</Text>
                                    </View>
                                    <Badge text={item.status} variant={getVariant(item.status)} />
                                </View>
                                <Text style={styles.meta}>{item.job_type?.replace('_', ' ')} • {new Date(item.created_at).toLocaleDateString()}</Text>
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
    filterCard: { marginBottom: spacing.lg },
    jobCard: { marginBottom: spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    info: { flex: 1, marginRight: spacing.md },
    title: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
    company: { fontSize: typography.fontSize.sm, color: colors.textLight, marginTop: 2 },
    meta: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginTop: spacing.md, textTransform: 'capitalize' },
});
