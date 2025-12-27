import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, JobCard, Card, Select, EmptyState } from '../../components';
import { colors, spacing } from '../../theme';

interface Job {
    id: string;
    title: string;
    company_name: string;
    job_type: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    stipend?: number;
    min_cgpa?: number;
    application_deadline?: string;
    hasApplied?: boolean;
    applicationStatus?: string;
}

const JOB_TYPE_OPTIONS = [
    { label: 'All Types', value: '' },
    { label: 'Full Time', value: 'full_time' },
    { label: 'Internship', value: 'internship' },
];

export function BrowseJobsScreen(): JSX.Element {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [filter, setFilter] = useState('');

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        const endpoint = filter ? `/student/jobs?jobType=${filter}` : '/student/jobs';
        const data = await api.get<Job[]>(endpoint, token);
        if (data.success) setJobs(data.data || []);
        setLoading(false);
    }, [token, filter]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleApply = async (jobId: string): Promise<void> => {
        setApplying(jobId);
        await api.post(`/student/jobs/${jobId}/apply`, {}, token);
        fetchJobs();
        setApplying(null);
    };

    if (loading && jobs.length === 0) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="Browse Jobs" subtitle={`${jobs.length} jobs available`} />
                <Card style={styles.filterCard}>
                    <Select label="Filter by" value={filter} onValueChange={setFilter} options={JOB_TYPE_OPTIONS} />
                </Card>
                {jobs.length === 0 ? (
                    <EmptyState message="No jobs available" />
                ) : (
                    <FlatList
                        data={jobs}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <JobCard
                                title={item.title}
                                companyName={item.company_name}
                                jobType={item.job_type}
                                location={item.location}
                                salaryMin={item.salary_min}
                                salaryMax={item.salary_max}
                                stipend={item.stipend}
                                minCgpa={item.min_cgpa}
                                deadline={item.application_deadline}
                                hasApplied={item.hasApplied}
                                applicationStatus={item.applicationStatus}
                                onApply={() => handleApply(item.id)}
                                applying={applying === item.id}
                            />
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
});
