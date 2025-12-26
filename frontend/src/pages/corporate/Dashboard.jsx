import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function CorporateDashboard() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/corporate/dashboard/stats', token)
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
                <h1 className="page-title">Welcome, {user?.firstName}</h1>
                <p className="page-subtitle">{user?.company_name || 'Corporate Dashboard'}</p>
            </div>

            <div className="stats-grid mb-lg">
                <div className="stat-card">
                    <div className="stat-value">{stats?.jobs?.total || 0}</div>
                    <div className="stat-label">Total Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.jobs?.byStatus?.pending || 0}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.jobs?.byStatus?.live || 0}</div>
                    <div className="stat-label">Live</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.applications?.total || 0}</div>
                    <div className="stat-label">Applications</div>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-md">Quick Actions</h3>
                <div className="flex gap-md">
                    <a href="/dashboard/post-job" className="btn btn-primary">Post New Job</a>
                    <a href="/dashboard/applications" className="btn btn-secondary">View Applications</a>
                </div>
            </div>
        </div>
    );
}
