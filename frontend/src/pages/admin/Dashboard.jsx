import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/dashboard/stats', token)
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
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">University placement overview</p>
            </div>

            <div className="stats-grid mb-lg">
                <div className="stat-card">
                    <div className="stat-value">{stats?.jobs?.pendingReview || 0}</div>
                    <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.jobs?.byStatus?.live || 0}</div>
                    <div className="stat-label">Live Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.students?.total || 0}</div>
                    <div className="stat-label">Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.students?.verified || 0}</div>
                    <div className="stat-label">Verified</div>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-md">Quick Actions</h3>
                <div className="flex gap-md">
                    <a href="/dashboard/pending" className="btn btn-primary">
                        Review Pending Jobs ({stats?.jobs?.pendingReview || 0})
                    </a>
                    <a href="/dashboard/students" className="btn btn-secondary">
                        Manage Students
                    </a>
                </div>
            </div>
        </div>
    );
}
