import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { CorporateNavigator } from './CorporateNavigator';
import { AdminNavigator } from './AdminNavigator';

export function RootNavigator(): JSX.Element {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    const getNavigator = (): JSX.Element => {
        if (!user) return <AuthNavigator />;
        switch (user.role) {
            case 'student': return <StudentNavigator />;
            case 'corporate': return <CorporateNavigator />;
            case 'admin': return <AdminNavigator />;
            default: return <AuthNavigator />;
        }
    };

    return <NavigationContainer>{getNavigator()}</NavigationContainer>;
}
