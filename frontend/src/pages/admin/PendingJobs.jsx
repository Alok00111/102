import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function PendingJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchJobs = () => {
        api.get('/admin/jobs/pending', token)
            .then(data => {
                if (data.success) setJobs(data.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchJobs();
    }, [token]);

    const handleApprove = async (id) => {
        setActionLoading(id);
        const result = await api.put(`/admin/jobs/${id}/approve`, {}, token);
        if (result.success) {
            setJobs(jobs.filter(j => j.id !== id));
        }
        setActionLoading(null);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;

        setActionLoading(rejectModal);
        const result = await api.put(`/admin/jobs/${rejectModal}/reject`, { reason: rejectReason }, token);
        if (result.success) {
            setJobs(jobs.filter(j => j.id !== rejectModal));
        }
        setActionLoading(null);
        setRejectModal(null);
        setRejectReason('');
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pending Approval</h1>
                <p className="page-subtitle">{jobs.length} jobs waiting for your review</p>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <p>No pending jobs to review</p>
                </div>
            ) : (
                <div className="grid" style={{ gap: '1rem' }}>
                    {jobs.map(job => (
                        <div key={job.id} className="job-card">
                            <div className="job-card-header">
                                <div>
                                    <h3 className="job-title">{job.title}</h3>
                                    <p className="job-company">{job.company_name}</p>
                                </div>
                                <span className="badge badge-pending">Pending</span>
                            </div>

                            <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                                {job.description?.substring(0, 150)}...
                            </p>

                            <div className="job-meta">
                                <span>{job.job_type}</span>
                                <span>{job.location || 'Remote'}</span>
                                {job.salary_min && <span>₹{job.salary_min.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}</span>}
                            </div>

                            <div className="job-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleApprove(job.id)}
                                    disabled={actionLoading === job.id}
                                >
                                    {actionLoading === job.id ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setRejectModal(job.id)}
                                    disabled={actionLoading === job.id}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reject Job</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setRejectModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Reason for rejection</label>
                                <textarea
                                    className="form-textarea"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                            >
                                Reject Job
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
