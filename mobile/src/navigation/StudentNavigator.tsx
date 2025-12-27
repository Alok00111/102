import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { StudentDashboardScreen, BrowseJobsScreen, MyApplicationsScreen, ProfileScreen } from '../screens/student';

export type StudentTabParamList = {
    Dashboard: undefined;
    BrowseJobs: undefined;
    MyApplications: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

export function StudentNavigator(): JSX.Element {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        }}>
            <Tab.Screen name="Dashboard" component={StudentDashboardScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="BrowseJobs" component={BrowseJobsScreen} options={{ tabBarLabel: 'Jobs' }} />
            <Tab.Screen name="MyApplications" component={MyApplicationsScreen} options={{ tabBarLabel: 'Applications' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
}
