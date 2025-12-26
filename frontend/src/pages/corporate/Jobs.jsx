import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function CorporateJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/corporate/jobs', token)
            .then(data => {
                if (data.success) setJobs(data.data);
            })
            .finally(() => setLoading(false));
    }, [token]);

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
                    <h1 className="page-title">My Jobs</h1>
                    <p className="page-subtitle">{jobs.length} job postings</p>
                </div>
                <a href="/dashboard/post-job" className="btn btn-primary">Post New Job</a>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't posted any jobs yet</p>
                    <a href="/dashboard/post-job" className="btn btn-primary mt-md">Post Your First Job</a>
                </div>
            ) : (
                <div className="grid" style={{ gap: '1rem' }}>
                    {jobs.map(job => (
                        <div key={job.id} className="job-card">
                            <div className="job-card-header">
                                <div>
                                    <h3 className="job-title">{job.title}</h3>
                                    <p className="job-company">{job.university_name} ({job.short_code})</p>
                                </div>
                                <span className={`badge badge-${getStatusColor(job.status)}`}>{job.status}</span>
                            </div>
                            <div className="job-meta">
                                <span>{job.job_type?.replace('_', ' ')}</span>
                                <span>{job.location || 'Remote'}</span>
                                <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                            {job.status === 'rejected' && job.rejection_reason && (
                                <p className="text-sm text-error mt-sm">Rejection: {job.rejection_reason}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
