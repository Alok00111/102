import { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';

export default function AdminStudents() {
    const { token } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/students', token)
            .then(data => {
                if (data.success) setStudents(data.data);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleVerify = async (id) => {
        const result = await api.put(`/admin/students/${id}/verify`, {}, token);
        if (result.success) {
            setStudents(students.map(s => s.id === id ? { ...s, is_verified: true } : s));
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Students</h1>
                <p className="page-subtitle">{students.length} registered students</p>
            </div>

            {students.length === 0 ? (
                <div className="empty-state">No students registered yet</div>
            ) : (
                <div className="table-wrapper card">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>USN</th>
                                <th>Branch</th>
                                <th>Year</th>
                                <th>CGPA</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.first_name} {s.last_name}</strong><br /><span className="text-xs text-muted">{s.email}</span></td>
                                    <td>{s.usn}</td>
                                    <td>{s.branch}</td>
                                    <td>{s.graduation_year}</td>
                                    <td>{s.cgpa}</td>
                                    <td>
                                        <span className={`badge ${s.is_verified ? 'badge-approved' : 'badge-pending'}`}>
                                            {s.is_verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {!s.is_verified && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleVerify(s.id)}>
                                                Verify
                                            </button>
                                        )}
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
