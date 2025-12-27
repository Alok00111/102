import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, StatCard, Card, Button } from '../../components';
import { colors, spacing } from '../../theme';

interface Stats {
    availableJobs?: number;
    applications?: { total?: number; byStatus?: { shortlisted?: number } };
    offers?: number;
}

type StudentTabParamList = {
    Dashboard: undefined;
    BrowseJobs: undefined;
    MyApplications: undefined;
    Profile: undefined;
};

type Props = {
    navigation: BottomTabNavigationProp<StudentTabParamList, 'Dashboard'>;
};

export function StudentDashboardScreen({ navigation }: Props): JSX.Element {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/dashboard/stats', token).then(data => {
            if (data.success) setStats(data.data);
            setLoading(false);
        });
    }, [token]);

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <PageHeader title={`Hi, ${user?.firstName}!`} subtitle="Your placement overview" />
                <View style={styles.statsGrid}>
                    <StatCard value={stats?.availableJobs || 0} label="Jobs" />
                    <StatCard value={stats?.applications?.total || 0} label="Applied" />
                </View>
                <View style={styles.statsGrid}>
                    <StatCard value={stats?.applications?.byStatus?.shortlisted || 0} label="Shortlisted" />
                    <StatCard value={stats?.offers || 0} label="Offers" valueColor={colors.success} />
                </View>
                <Card style={styles.actionsCard}>
                    <View style={styles.actions}>
                        <Button title="Browse Jobs" onPress={() => navigation.navigate('BrowseJobs')} style={styles.actionButton} />
                        <Button title="My Applications" onPress={() => navigation.navigate('MyApplications')} variant="secondary" style={styles.actionButton} />
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    actionsCard: { marginTop: spacing.md },
    actions: { flexDirection: 'row', gap: spacing.md },
    actionButton: { flex: 1 },
});
