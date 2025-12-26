import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function StudentDashboard() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/dashboard/stats', token)
            .then(data => {
                if (data.success) setStats(data.data);
            })
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Hi, {user?.firstName}!</h1>
                <p className="page-subtitle">Your placement journey overview</p>
            </div>

            <div className="stats-grid mb-lg">
                <div className="stat-card">
                    <div className="stat-value">{stats?.availableJobs || 0}</div>
                    <div className="stat-label">Available Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.applications?.total || 0}</div>
                    <div className="stat-label">Applied</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.applications?.byStatus?.shortlisted || 0}</div>
                    <div className="stat-label">Shortlisted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats?.offers || 0}</div>
                    <div className="stat-label">Offers</div>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-md">Quick Actions</h3>
                <div className="flex gap-md">
                    <a href="/dashboard/jobs" className="btn btn-primary">Browse Jobs</a>
                    <a href="/dashboard/applications" className="btn btn-secondary">My Applications</a>
                </div>
            </div>
        </div>
    );
}
