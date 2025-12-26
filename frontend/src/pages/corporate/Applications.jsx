import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function CorporateApplications() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/corporate/jobs', token)
            .then(data => {
                if (data.success) {
                    setJobs(data.data.filter(j => j.status === 'live'));
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (selectedJob) {
            setLoading(true);
            api.get(`/corporate/applications/${selectedJob}`, token)
                .then(data => {
                    if (data.success) setApplications(data.data);
                })
                .finally(() => setLoading(false));
        }
    }, [selectedJob, token]);

    const handleStatusChange = async (appId, status) => {
        const result = await api.put(`/corporate/applications/${appId}/status`, { status }, token);
        if (result.success) {
            setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
        }
    };

    if (loading && jobs.length === 0) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Applications</h1>
                <p className="page-subtitle">Review candidates who applied to your jobs</p>
            </div>

            <div className="card mb-lg">
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Job</label>
                    <select
                        className="form-select"
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                    >
                        <option value="">Choose a job...</option>
                        {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title} - {j.university_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedJob && (
                loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : applications.length === 0 ? (
                    <div className="empty-state">No applications yet for this job</div>
                ) : (
                    <div className="table-wrapper card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>USN</th>
                                    <th>Branch</th>
                                    <th>CGPA</th>
                                    <th>Applied</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td>
                                            <strong>{app.first_name} {app.last_name}</strong>
                                            <br /><span className="text-xs text-muted">{app.email}</span>
                                        </td>
                                        <td>{app.usn}</td>
                                        <td>{app.branch}</td>
                                        <td>{app.cgpa}</td>
                                        <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                className="form-select"
                                                style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                            >
                                                <option value="applied">Applied</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="shortlisted">Shortlisted</option>
                                                <option value="interview_scheduled">Interview Scheduled</option>
                                                <option value="offered">Offered</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td>
                                            {app.resume_url && (
                                                <a href={app.resume_url} target="_blank" rel="noopener" className="btn btn-sm btn-secondary">
                                                    Resume
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
