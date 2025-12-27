import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, StatCard, Card, Button } from '../../components';
import { colors, spacing } from '../../theme';

interface Stats {
    jobs?: { pendingReview?: number; byStatus?: { live?: number } };
    students?: { total?: number; verified?: number };
}

type AdminTabParamList = {
    Dashboard: undefined;
    AllJobs: undefined;
    PendingJobs: undefined;
    Students: undefined;
};

type Props = {
    navigation: BottomTabNavigationProp<AdminTabParamList, 'Dashboard'>;
};

export function AdminDashboardScreen({ navigation }: Props): JSX.Element {
    const { token, logout } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Stats>('/admin/dashboard/stats', token).then(data => {
            if (data.success) setStats(data.data);
            setLoading(false);
        });
    }, [token]);

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <PageHeader title="Admin Dashboard" subtitle="University overview" />
                <View style={styles.statsGrid}>
                    <StatCard value={stats?.jobs?.pendingReview || 0} label="Pending" />
                    <StatCard value={stats?.jobs?.byStatus?.live || 0} label="Live Jobs" />
                </View>
                <View style={styles.statsGrid}>
                    <StatCard value={stats?.students?.total || 0} label="Students" />
                    <StatCard value={stats?.students?.verified || 0} label="Verified" />
                </View>
                <Card style={styles.actionsCard}>
                    <Button title={`Review Pending (${stats?.jobs?.pendingReview || 0})`}
                        onPress={() => navigation.navigate('PendingJobs')} fullWidth style={{ marginBottom: spacing.md }} />
                    <Button title="Manage Students" onPress={() => navigation.navigate('Students')} variant="secondary" fullWidth />
                </Card>
                <Button title="Logout" onPress={logout} variant="danger" style={styles.logoutBtn} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    actionsCard: { marginTop: spacing.md },
    logoutBtn: { marginTop: spacing.xl },
});
