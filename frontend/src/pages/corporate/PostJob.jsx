import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';

export default function PostJob() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        universityId: '',
        title: '',
        description: '',
        jobType: 'full_time',
        location: '',
        isRemote: false,
        salaryMin: '',
        salaryMax: '',
        stipend: '',
        minCgpa: '',
        applicationDeadline: '',
        vacancies: 1
    });

    useEffect(() => {
        api.get('/corporate/universities', token)
            .then(data => {
                if (data.success) setUniversities(data.data);
            });
    }, [token]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await api.post('/corporate/jobs', formData, token);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard/jobs');
        } else {
            setError(result.message || 'Failed to create job');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Post New Job</h1>
                <p className="page-subtitle">Create a job posting for university students</p>
            </div>

            <div className="card" style={{ maxWidth: '700px' }}>
                {error && <div className="form-error mb-md">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Target University *</label>
                        <select
                            name="universityId"
                            className="form-select"
                            value={formData.universityId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select university</option>
                            {universities.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.short_code})</option>
                            ))}
                        </select>
                        <p className="form-hint">Job will be visible to students of this university only</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Job Title *</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Software Engineer Intern"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Job responsibilities, requirements, benefits..."
                            style={{ minHeight: '150px' }}
                            required
                        />
                    </div>

                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Job Type *</label>
                            <select
                                name="jobType"
                                className="form-select"
                                value={formData.jobType}
                                onChange={handleChange}
                            >
                                <option value="full_time">Full Time</option>
                                <option value="internship">Internship</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Bangalore"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="flex items-center gap-sm">
                            <input
                                type="checkbox"
                                name="isRemote"
                                checked={formData.isRemote}
                                onChange={handleChange}
                            />
                            <span className="text-sm">Remote work available</span>
                        </label>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">
                                {formData.jobType === 'internship' ? 'Stipend (₹/month)' : 'Salary Min (₹/year)'}
                            </label>
                            <input
                                type="number"
                                name={formData.jobType === 'internship' ? 'stipend' : 'salaryMin'}
                                className="form-input"
                                value={formData.jobType === 'internship' ? formData.stipend : formData.salaryMin}
                                onChange={handleChange}
                                placeholder="e.g., 500000"
                            />
                        </div>

                        {formData.jobType !== 'internship' && (
                            <div className="form-group">
                                <label className="form-label">Salary Max (₹/year)</label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    className="form-input"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    placeholder="e.g., 800000"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Minimum CGPA</label>
                            <input
                                type="number"
                                name="minCgpa"
                                className="form-input"
                                value={formData.minCgpa}
                                onChange={handleChange}
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="e.g., 7.0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Vacancies</label>
                            <input
                                type="number"
                                name="vacancies"
                                className="form-input"
                                value={formData.vacancies}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Application Deadline *</label>
                        <input
                            type="date"
                            name="applicationDeadline"
                            className="form-input"
                            value={formData.applicationDeadline}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="flex gap-md mt-lg">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-lg"
                            onClick={() => navigate('/dashboard/jobs')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
