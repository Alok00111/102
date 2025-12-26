import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function BrowseJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [filter, setFilter] = useState({ jobType: '' });

    const fetchJobs = () => {
        let endpoint = '/student/jobs';
        if (filter.jobType) endpoint += `?jobType=${filter.jobType}`;

        api.get(endpoint, token)
            .then(data => {
                if (data.success) setJobs(data.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchJobs();
    }, [token, filter]);

    const handleApply = async (jobId) => {
        setApplying(jobId);
        const result = await api.post(`/student/jobs/${jobId}/apply`, {}, token);
        if (result.success) {
            fetchJobs();
        }
        setApplying(null);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Browse Jobs</h1>
                <p className="page-subtitle">{jobs.length} jobs available at your university</p>
            </div>

            {/* Filters */}
            <div className="card mb-lg">
                <div className="flex gap-md items-center">
                    <span className="text-sm">Filter by:</span>
                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={filter.jobType}
                        onChange={(e) => setFilter({ ...filter, jobType: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="internship">Internship</option>
                        <option value="part_time">Part Time</option>
                    </select>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <p>No jobs available at the moment</p>
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
                                <span className={`badge badge-${job.job_type === 'internship' ? 'pending' : 'live'}`}>
                                    {job.job_type.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="job-meta">
                                <span>{job.location || 'Remote'}</span>
                                {job.is_remote && <span>🏠 Remote</span>}
                                {job.salary_min && <span>₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L</span>}
                                {job.stipend && <span>₹{job.stipend.toLocaleString()}/month</span>}
                                {job.min_cgpa && <span>Min CGPA: {job.min_cgpa}</span>}
                            </div>

                            <p className="text-sm text-muted mt-md">
                                Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                            </p>

                            <div className="job-actions">
                                {job.hasApplied ? (
                                    <span className={`badge badge-${job.applicationStatus || 'applied'}`}>
                                        {job.applicationStatus || 'Applied'}
                                    </span>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleApply(job.id)}
                                        disabled={applying === job.id}
                                    >
                                        {applying === job.id ? 'Applying...' : 'Apply Now'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
