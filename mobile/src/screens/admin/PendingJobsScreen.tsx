import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, Card, Badge, Button, Modal, Input, EmptyState } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface Job {
    id: string;
    title: string;
    company_name: string;
    description: string;
    job_type: string;
    location: string;
}

export function PendingJobsScreen(): JSX.Element {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        api.get<Job[]>('/admin/jobs/pending', token).then(data => {
            if (data.success) setJobs(data.data || []);
            setLoading(false);
        });
    }, [token]);

    const handleApprove = async (id: string): Promise<void> => {
        setActionLoading(id);
        const result = await api.put(`/admin/jobs/${id}/approve`, {}, token);
        if (result.success) setJobs(jobs.filter(j => j.id !== id));
        setActionLoading(null);
    };

    const handleReject = async (): Promise<void> => {
        if (!rejectReason.trim() || !rejectModal) return;
        setActionLoading(rejectModal);
        const result = await api.put(`/admin/jobs/${rejectModal}/reject`, { reason: rejectReason }, token);
        if (result.success) setJobs(jobs.filter(j => j.id !== rejectModal));
        setActionLoading(null);
        setRejectModal(null);
        setRejectReason('');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="Pending Approval" subtitle={`${jobs.length} jobs`} />
                {jobs.length === 0 ? <EmptyState message="No pending jobs" /> :
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
                                    <Badge text="Pending" variant="pending" />
                                </View>
                                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                                <View style={styles.meta}>
                                    <Text style={styles.metaText}>{item.job_type}</Text>
                                    <Text style={styles.metaText}>{item.location || 'Remote'}</Text>
                                </View>
                                <View style={styles.actions}>
                                    <Button title={actionLoading === item.id ? '...' : 'Approve'} onPress={() => handleApprove(item.id)}
                                        loading={actionLoading === item.id} disabled={actionLoading === item.id} />
                                    <Button title="Reject" onPress={() => setRejectModal(item.id)} variant="danger" disabled={actionLoading === item.id} />
                                </View>
                            </Card>
                        )}
                    />
                }

                <Modal visible={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason(''); }} title="Reject Job"
                    footer={<>
                        <Button title="Cancel" onPress={() => { setRejectModal(null); setRejectReason(''); }} variant="secondary" />
                        <Button title="Reject" onPress={handleReject} variant="danger" disabled={!rejectReason.trim()} />
                    </>}>
                    <Input label="Reason" value={rejectReason} onChangeText={setRejectReason} placeholder="Reason..." multiline numberOfLines={3} />
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: spacing.lg },
    jobCard: { marginBottom: spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    info: { flex: 1, marginRight: spacing.md },
    title: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
    company: { fontSize: typography.fontSize.sm, color: colors.textLight, marginTop: 2 },
    desc: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm },
    meta: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    metaText: { fontSize: typography.fontSize.xs, color: colors.textMuted },
    actions: { flexDirection: 'row', gap: spacing.sm },
});
