import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, registerUser, type UserResponse } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const UserManagementPage = () => {
    const { user: currentUser } = useAuth();
    
    // State
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Pharmacist' // Default role
    });

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete user.");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser(formData);
            alert("User created successfully!");
            setIsModalOpen(false);
            setFormData({ username: '', email: '', password: '', role: 'Pharmacist' }); // Reset
            fetchUsers(); // Refresh list
        } catch (error: any) {
            alert("Failed to create user: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500">Manage staff access and roles</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700"
                >
                    + Add New User
                </button>
            </header>

            {/* Users Table */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                        <tr>
                            <th className="py-3 px-6">Username</th>
                            <th className="py-3 px-6">Email</th>
                            <th className="py-3 px-6">Role</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-6 font-medium text-gray-900">
                                    {u.username} 
                                    {u.username === currentUser?.username && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                                </td>
                                <td className="py-3 px-6">{u.email}</td>
                                <td className="py-3 px-6">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    {/* Prevent deleting yourself */}
                                    {u.username !== currentUser?.username && (
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD USER MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Register New Employee</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Username</label>
                                <input 
                                    required type="text" className="w-full border p-2 rounded"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input 
                                    required type="email" className="w-full border p-2 rounded"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Password</label>
                                <input 
                                    required type="password" className="w-full border p-2 rounded"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Role</label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;