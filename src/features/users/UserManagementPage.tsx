import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, type UserResponse } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import UserModal from './UserModal'; // Import the new component

const UserManagementPage = () => {
    const { user: currentUser } = useAuth();
    
    // State
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    const fetchUsers = async () => {
        try {
            const data  = await getAllUsers();
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

    // Open Modal in Edit Mode
    const handleEdit = (user: UserResponse) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Open Modal in Create Mode
    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500">Manage staff access and roles</p>
                </div>
                <button 
                    onClick={handleCreate}
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
                            <th className="py-3 px-6">Id</th>
                            <th className="py-3 px-6">Username</th>
                            <th className="py-3 px-6">Role</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-6">{u.id}</td>
                                <td className="py-3 px-6  text-gray-900">
                                    {u.userName}
                                    {u.userName === currentUser?.username && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                                </td>
                                <td className="py-3 px-6">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex justify-center space-x-4">
                                        <button 
                                            onClick={() => handleEdit(u)}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold"
                                        >
                                            Edit
                                        </button>
                                        
                                        {/* Prevent deleting yourself */}
                                        {u.userName !== currentUser?.username && (
                                            <button 
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-500 hover:text-red-700 font-bold"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reusable Modal for Add & Edit */}
            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchUsers();
                }}
                userToEdit={selectedUser}
            />
        </div>
    );
};

export default UserManagementPage;