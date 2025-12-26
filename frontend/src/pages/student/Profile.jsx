import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function StudentProfile() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/student/profile', token)
            .then(data => {
                if (data.success) {
                    setProfile(data.data);
                    setFormData(data.data);
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async () => {
        setSaving(true);
        const result = await api.put('/student/profile', {
            firstName: formData.first_name,
            lastName: formData.last_name,
            phone: formData.phone,
            branch: formData.branch,
            graduationYear: formData.graduation_year,
            cgpa: formData.cgpa
        }, token);

        if (result.success) {
            setProfile({ ...profile, ...result.data });
            setEditing(false);
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">{profile?.university_name}</p>
                </div>
                {!editing && (
                    <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
                )}
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                {editing ? (
                    <>
                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.first_name || ''}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.last_name || ''}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Branch</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.branch || ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">CGPA</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={formData.cgpa || ''}
                                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-md mt-lg">
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="flex gap-lg mb-lg">
                            <div className="stat-card" style={{ flex: 1 }}>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{profile?.cgpa || 'N/A'}</div>
                                <div className="stat-label">CGPA</div>
                            </div>
                            <div className="stat-card" style={{ flex: 1 }}>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{profile?.graduation_year}</div>
                                <div className="stat-label">Batch</div>
                            </div>
                        </div>

                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr><td className="text-muted">Name</td><td><strong>{profile?.first_name} {profile?.last_name}</strong></td></tr>
                                <tr><td className="text-muted">Email</td><td>{profile?.email}</td></tr>
                                <tr><td className="text-muted">USN</td><td>{profile?.usn}</td></tr>
                                <tr><td className="text-muted">Branch</td><td>{profile?.branch}</td></tr>
                                <tr><td className="text-muted">Phone</td><td>{profile?.phone || 'Not provided'}</td></tr>
                                <tr>
                                    <td className="text-muted">Verification</td>
                                    <td>
                                        <span className={`badge ${profile?.is_verified ? 'badge-approved' : 'badge-pending'}`}>
                                            {profile?.is_verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
