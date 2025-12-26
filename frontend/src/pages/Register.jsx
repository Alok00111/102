import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
        firstName: '',
        lastName: '',
        phone: '',
        universityId: '',
        // Student fields
        usn: '',
        branch: '',
        graduationYear: new Date().getFullYear() + 1,
        // Corporate fields
        companyName: '',
        designation: ''
    });
    const [universities, setUniversities] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/universities')
            .then(res => res.json())
            .then(data => {
                if (data.success) setUniversities(data.data);
            })
            .catch(() => { });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-title">
                    <h1>Create account</h1>
                    <p>Join the placement platform</p>
                </div>

                {error && <div className="form-error mb-md">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="form-group">
                        <label className="form-label">I am a</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student</option>
                            <option value="corporate">Corporate Recruiter</option>
                            <option value="admin">University Admin</option>
                        </select>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                className="form-input"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-input"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </div>

                    {/* University Selection (for students and admins) */}
                    {(formData.role === 'student' || formData.role === 'admin') && (
                        <div className="form-group">
                            <label className="form-label">University</label>
                            <select
                                name="universityId"
                                className="form-select"
                                value={formData.universityId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select university</option>
                                {universities.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Student-specific fields */}
                    {formData.role === 'student' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">USN (University Seat Number)</label>
                                <input
                                    type="text"
                                    name="usn"
                                    className="form-input"
                                    value={formData.usn}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Branch</label>
                                    <select
                                        name="branch"
                                        className="form-select"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select branch</option>
                                        <option value="CSE">Computer Science</option>
                                        <option value="ISE">Information Science</option>
                                        <option value="ECE">Electronics & Communication</option>
                                        <option value="EEE">Electrical & Electronics</option>
                                        <option value="ME">Mechanical Engineering</option>
                                        <option value="CE">Civil Engineering</option>
                                        <option value="MBA">MBA</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Graduation Year</label>
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        className="form-input"
                                        value={formData.graduationYear}
                                        onChange={handleChange}
                                        min={new Date().getFullYear()}
                                        max={new Date().getFullYear() + 5}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Corporate-specific fields */}
                    {formData.role === 'corporate' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="form-input"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    className="form-input"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g., HR Manager"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg mt-md"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-center mt-lg text-sm">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
