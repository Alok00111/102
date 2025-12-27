import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Badge } from './Badge';
import { Button } from './Button';

interface JobCardProps {
    title: string;
    companyName: string;
    jobType?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    stipend?: number;
    minCgpa?: number;
    deadline?: string;
    status?: string;
    hasApplied?: boolean;
    applicationStatus?: string;
    rejectionReason?: string;
    onApply?: () => void;
    applying?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

export function JobCard({
    title, companyName, jobType, location, salaryMin, salaryMax, stipend,
    minCgpa, deadline, status, hasApplied, applicationStatus, rejectionReason,
    onApply, applying = false, onPress, style,
}: JobCardProps): JSX.Element {
    const getStatusVariant = (s: string) => {
        if (s === 'pending') return 'pending';
        if (s === 'approved' || s === 'live') return 'live';
        if (s === 'rejected' || s === 'closed') return 'rejected';
        return 'default';
    };

    return (
        <TouchableOpacity
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.company}>{companyName}</Text>
                </View>
                {status ? (
                    <Badge text={status} variant={getStatusVariant(status)} />
                ) : (
                    <Badge text={jobType?.replace('_', ' ') || ''} variant="live" />
                )}
            </View>

            <View style={styles.meta}>
                <Text style={styles.metaText}>{location || 'Remote'}</Text>
                {salaryMin && salaryMax && (
                    <Text style={styles.metaText}>₹{(salaryMin / 100000).toFixed(1)}L - ₹{(salaryMax / 100000).toFixed(1)}L</Text>
                )}
                {stipend && <Text style={styles.metaText}>₹{stipend}/month</Text>}
                {minCgpa && <Text style={styles.metaText}>Min CGPA: {minCgpa}</Text>}
            </View>

            {deadline && (
                <Text style={styles.deadline}>Deadline: {new Date(deadline).toLocaleDateString()}</Text>
            )}
            {rejectionReason && <Text style={styles.rejection}>Rejection: {rejectionReason}</Text>}

            {(onApply || hasApplied) && (
                <View style={styles.actions}>
                    {hasApplied ? (
                        <Badge text={applicationStatus || 'Applied'} variant="applied" />
                    ) : (
                        onApply && <Button title={applying ? 'Applying...' : 'Apply Now'} onPress={onApply} loading={applying} />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    headerLeft: { flex: 1, marginRight: spacing.md },
    title: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
    company: { fontSize: typography.fontSize.sm, color: colors.textLight },
    meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
    metaText: { fontSize: typography.fontSize.xs, color: colors.textMuted },
    deadline: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
    rejection: { fontSize: typography.fontSize.sm, color: colors.error, marginTop: spacing.sm },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
