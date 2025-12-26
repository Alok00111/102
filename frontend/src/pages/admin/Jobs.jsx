import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function AdminJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        let endpoint = '/admin/jobs';
        if (filter) endpoint += `?status=${filter}`;

        api.get(endpoint, token)
            .then(data => {
                if (data.success) setJobs(data.data);
            })
            .finally(() => setLoading(false));
    }, [token, filter]);

    const getStatusColor = (status) => {
        return { pending: 'pending', approved: 'approved', live: 'live', rejected: 'rejected', closed: 'rejected' }[status] || '';
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">All Jobs</h1>
                    <p className="page-subtitle">{jobs.length} jobs in your university</p>
                </div>
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="live">Live</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">No jobs found</div>
            ) : (
                <div className="table-wrapper card">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Type</th>
                                <th>Posted</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id}>
                                    <td><strong>{job.title}</strong></td>
                                    <td>{job.company_name}</td>
                                    <td>{job.job_type?.replace('_', ' ')}</td>
                                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                                    <td><span className={`badge badge-${getStatusColor(job.status)}`}>{job.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
