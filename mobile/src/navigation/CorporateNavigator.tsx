import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { CorporateDashboardScreen, MyJobsScreen, PostJobScreen, ApplicationsScreen } from '../screens/corporate';

export type CorporateTabParamList = {
    Dashboard: undefined;
    MyJobs: undefined;
    PostJob: undefined;
    Applications: undefined;
};

const Tab = createBottomTabNavigator<CorporateTabParamList>();

export function CorporateNavigator(): JSX.Element {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        }}>
            <Tab.Screen name="Dashboard" component={CorporateDashboardScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="MyJobs" component={MyJobsScreen} options={{ tabBarLabel: 'My Jobs' }} />
            <Tab.Screen name="PostJob" component={PostJobScreen} options={{ tabBarLabel: 'Post Job' }} />
            <Tab.Screen name="Applications" component={ApplicationsScreen} options={{ tabBarLabel: 'Applications' }} />
        </Tab.Navigator>
    );
}
