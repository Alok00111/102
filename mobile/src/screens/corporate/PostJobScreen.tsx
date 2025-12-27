import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, api } from '../../context/AuthContext';
import { PageHeader, Card, Input, Select, Button } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface University {
    id: string;
    name: string;
    short_code: string;
}

interface FormData {
    universityId: string;
    title: string;
    description: string;
    jobType: string;
    location: string;
    isRemote: boolean;
    salaryMin: string;
    salaryMax: string;
    stipend: string;
    minCgpa: string;
    applicationDeadline: string;
    vacancies: string;
}

type CorporateTabParamList = {
    Dashboard: undefined;
    MyJobs: undefined;
    PostJob: undefined;
    Applications: undefined;
};

type Props = {
    navigation: BottomTabNavigationProp<CorporateTabParamList, 'PostJob'>;
};

const JOB_TYPE_OPTIONS = [
    { label: 'Full Time', value: 'full_time' },
    { label: 'Internship', value: 'internship' },
    { label: 'Part Time', value: 'part_time' },
];

export function PostJobScreen({ navigation }: Props): JSX.Element {
    const { token } = useAuth();
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<FormData>({
        universityId: '', title: '', description: '', jobType: 'full_time',
        location: '', isRemote: false, salaryMin: '', salaryMax: '', stipend: '',
        minCgpa: '', applicationDeadline: '', vacancies: '1',
    });

    useEffect(() => {
        api.get<University[]>('/corporate/universities', token).then(data => {
            if (data.success) setUniversities(data.data || []);
        });
    }, [token]);

    const handleChange = (name: keyof FormData, value: string | boolean): void => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (): Promise<void> => {
        setError('');
        setLoading(true);
        const result = await api.post('/corporate/jobs', formData, token);
        setLoading(false);
        if (result.success) navigation.navigate('MyJobs');
        else setError(result.message || 'Failed to create job');
    };

    const universityOptions = universities.map(u => ({ label: `${u.name} (${u.short_code})`, value: u.id }));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <PageHeader title="Post New Job" subtitle="Create a job posting" />
                <Card>
                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <Select label="Target University *" value={formData.universityId} onValueChange={v => handleChange('universityId', v)}
                        options={universityOptions} placeholder="Select university" />

                    <Input label="Job Title *" value={formData.title} onChangeText={v => handleChange('title', v)} />
                    <Input label="Description *" value={formData.description} onChangeText={v => handleChange('description', v)}
                        multiline numberOfLines={4} />

                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Select label="Job Type *" value={formData.jobType} onValueChange={v => handleChange('jobType', v)} options={JOB_TYPE_OPTIONS} />
                        </View>
                        <Input label="Location" value={formData.location} onChangeText={v => handleChange('location', v)} style={styles.half} />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Remote available</Text>
                        <Switch value={formData.isRemote} onValueChange={v => handleChange('isRemote', v)} trackColor={{ true: colors.primary, false: colors.border }} />
                    </View>

                    <View style={styles.row}>
                        <Input label={formData.jobType === 'internship' ? 'Stipend (₹/mo)' : 'Salary Min (₹/yr)'}
                            value={formData.jobType === 'internship' ? formData.stipend : formData.salaryMin}
                            onChangeText={v => handleChange(formData.jobType === 'internship' ? 'stipend' : 'salaryMin', v)}
                            keyboardType="number-pad" style={styles.half} />
                        {formData.jobType !== 'internship' && (
                            <Input label="Salary Max (₹/yr)" value={formData.salaryMax}
                                onChangeText={v => handleChange('salaryMax', v)} keyboardType="number-pad" style={styles.half} />
                        )}
                    </View>

                    <View style={styles.row}>
                        <Input label="Min CGPA" value={formData.minCgpa} onChangeText={v => handleChange('minCgpa', v)}
                            keyboardType="decimal-pad" style={styles.half} />
                        <Input label="Vacancies" value={formData.vacancies} onChangeText={v => handleChange('vacancies', v)}
                            keyboardType="number-pad" style={styles.half} />
                    </View>

                    <Input label="Deadline (YYYY-MM-DD) *" value={formData.applicationDeadline}
                        onChangeText={v => handleChange('applicationDeadline', v)} />

                    <View style={styles.actions}>
                        <Button title={loading ? 'Posting...' : 'Post Job'} onPress={handleSubmit} loading={loading} size="lg" />
                        <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" size="lg" />
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    error: { color: colors.error, backgroundColor: colors.badge.rejected.bg, padding: spacing.md, borderRadius: 4, marginBottom: spacing.md, textAlign: 'center' },
    row: { flexDirection: 'row', gap: spacing.md },
    half: { flex: 1 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    switchLabel: { fontSize: typography.fontSize.sm, color: colors.text },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
