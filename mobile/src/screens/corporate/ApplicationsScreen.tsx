import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, Card, Select, EmptyState } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface Job {
    id: string;
    title: string;
    university_name: string;
    status: string;
}

interface Application {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    usn: string;
    cgpa: number;
    branch: string;
    status: string;
}

const STATUS_OPTIONS = [
    { label: 'Applied', value: 'applied' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Offered', value: 'offered' },
    { label: 'Rejected', value: 'rejected' },
];

export function ApplicationsScreen(): JSX.Element {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingApps, setLoadingApps] = useState(false);

    useEffect(() => {
        api.get<Job[]>('/corporate/jobs', token).then(data => {
            if (data.success) setJobs((data.data || []).filter(j => j.status === 'live'));
            setLoading(false);
        });
    }, [token]);

    useEffect(() => {
        if (selectedJob) {
            setLoadingApps(true);
            api.get<Application[]>(`/corporate/applications/${selectedJob}`, token).then(data => {
                if (data.success) setApplications(data.data || []);
                setLoadingApps(false);
            });
        }
    }, [selectedJob, token]);

    const handleStatusChange = async (appId: string, status: string): Promise<void> => {
        await api.put(`/corporate/applications/${appId}/status`, { status }, token);
        setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
    };

    const jobOptions = jobs.map(j => ({ label: `${j.title} - ${j.university_name}`, value: j.id }));

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="Applications" subtitle="Review candidates" />
                <Card style={styles.filterCard}>
                    <Select label="Select Job" value={selectedJob} onValueChange={setSelectedJob} options={jobOptions} placeholder="Choose a job..." />
                </Card>

                {selectedJob && (
                    loadingApps ? <LoadingSpinner fullScreen={false} /> :
                        applications.length === 0 ? <EmptyState message="No applications for this job" /> :
                            <FlatList
                                data={applications}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Card style={styles.appCard}>
                                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                                        <Text style={styles.email}>{item.email}</Text>
                                        <View style={styles.details}>
                                            <Text style={styles.detail}>USN: {item.usn}</Text>
                                            <Text style={styles.detail}>CGPA: {item.cgpa}</Text>
                                            <Text style={styles.detail}>Branch: {item.branch}</Text>
                                        </View>
                                        <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v)} options={STATUS_OPTIONS} />
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
    filterCard: { marginBottom: spacing.lg },
    appCard: { marginBottom: spacing.md },
    name: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
    email: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginBottom: spacing.sm },
    details: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
    detail: { fontSize: typography.fontSize.xs, color: colors.textMuted },
});
