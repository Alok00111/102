import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function MyApplications() {
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/applications', token)
            .then(data => {
                if (data.success) setApplications(data.data);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const getStatusColor = (status) => {
        const colors = {
            applied: 'applied',
            under_review: 'pending',
            shortlisted: 'approved',
            interview_scheduled: 'live',
            interviewed: 'live',
            offered: 'approved',
            accepted: 'approved',
            rejected: 'rejected',
            withdrawn: 'rejected'
        };
        return colors[status] || 'applied';
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Applications</h1>
                <p className="page-subtitle">{applications.length} total applications</p>
            </div>

            {applications.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't applied to any jobs yet</p>
                    <a href="/dashboard/jobs" className="btn btn-primary mt-md">Browse Jobs</a>
                </div>
            ) : (
                <div className="table-wrapper card">
                    <table>
                        <thead>
                            <tr>
                                <th>Job</th>
                                <th>Company</th>
                                <th>Type</th>
                                <th>Applied</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id}>
                                    <td>
                                        <strong>{app.job_title}</strong>
                                    </td>
                                    <td>{app.company_name}</td>
                                    <td>{app.job_type?.replace('_', ' ')}</td>
                                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${getStatusColor(app.status)}`}>
                                            {app.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
