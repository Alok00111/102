import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, api } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, StatCard, Card, Button } from '../../components';
import { colors, spacing } from '../../theme';

interface Stats {
    jobs?: { total?: number; byStatus?: { pending?: number; live?: number } };
    applications?: { total?: number };
}

type CorporateTabParamList = {
    Dashboard: undefined;
    MyJobs: undefined;
    PostJob: undefined;
    Applications: undefined;
};

type Props = {
    navigation: BottomTabNavigationProp<CorporateTabParamList, 'Dashboard'>;
};

export function CorporateDashboardScreen({ navigation }: Props): JSX.Element {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Stats>('/corporate/dashboard/stats', token).then(data => {
            if (data.success) setStats(data.data);
            setLoading(false);
        });
    }, [token]);

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <PageHeader title={`Welcome, ${user?.firstName}`} subtitle={user?.company_name || 'Dashboard'} />
                <View style={styles.statsGrid}>
                    <StatCard value={stats?.jobs?.total || 0} label="Total Jobs" />
                    <StatCard value={stats?.jobs?.byStatus?.pending || 0} label="Pending" />
                </View>
                <View style={styles.statsGrid}>
                    <StatCard value={stats?.jobs?.byStatus?.live || 0} label="Live" />
                    <StatCard value={stats?.applications?.total || 0} label="Applications" />
                </View>
                <Card style={styles.actionsCard}>
                    <View style={styles.actions}>
                        <Button title="Post New Job" onPress={() => navigation.navigate('PostJob')} style={styles.actionButton} />
                        <Button title="Applications" onPress={() => navigation.navigate('Applications')} variant="secondary" style={styles.actionButton} />
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
