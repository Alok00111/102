import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, JobCard, EmptyState, Button } from '../../components';
import { colors, spacing } from '../../theme';

interface Job {
    id: string;
    title: string;
    university_name: string;
    job_type: string;
    location: string;
    status: string;
    rejection_reason?: string;
}

type CorporateTabParamList = {
    Dashboard: undefined;
    MyJobs: undefined;
    PostJob: undefined;
    Applications: undefined;
};

type Props = {
    navigation: BottomTabNavigationProp<CorporateTabParamList, 'MyJobs'>;
};

export function MyJobsScreen({ navigation }: Props): JSX.Element {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Job[]>('/corporate/jobs', token).then(data => {
            if (data.success) setJobs(data.data || []);
            setLoading(false);
        });
    }, [token]);

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <PageHeader title="My Jobs" subtitle={`${jobs.length} postings`}
                    rightContent={<Button title="Post New" onPress={() => navigation.navigate('PostJob')} size="sm" />}
                />
                {jobs.length === 0 ? (
                    <EmptyState message="No jobs posted yet" actionLabel="Post Your First Job" onAction={() => navigation.navigate('PostJob')} />
                ) : (
                    <FlatList
                        data={jobs}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <JobCard title={item.title} companyName={item.university_name} jobType={item.job_type}
                                location={item.location} status={item.status} rejectionReason={item.rejection_reason} />
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
});
