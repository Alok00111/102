import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { AdminDashboardScreen, AllJobsScreen, PendingJobsScreen, StudentsScreen } from '../screens/admin';

export type AdminTabParamList = {
    Dashboard: undefined;
    AllJobs: undefined;
    PendingJobs: undefined;
    Students: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminNavigator(): JSX.Element {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        }}>
            <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="AllJobs" component={AllJobsScreen} options={{ tabBarLabel: 'Jobs' }} />
            <Tab.Screen name="PendingJobs" component={PendingJobsScreen} options={{ tabBarLabel: 'Pending' }} />
            <Tab.Screen name="Students" component={StudentsScreen} options={{ tabBarLabel: 'Students' }} />
        </Tab.Navigator>
    );
}
