import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, type UserResponse } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import UserModal from './UserModal';

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

    const handleEdit = (user: UserResponse) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    // Construct Image URL
    const getImageUrl = (path?: string) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:5297/${path}`; // Adjust base URL as needed
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
                            <th className="py-3 px-6">User</th> {/* Changed header from "Username" to "User" */}
                            <th className="py-3 px-6">Role</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                                <td className="py-3 px-6 font-mono text-gray-400">#{u.id}</td>
                                
                                {/* Combined Avatar + Username Column */}
                                <td className="py-3 px-6">
                                    <div className="flex items-center space-x-3">
                                        {/* Avatar Logic */}
                                        <div className="h-10 w-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                            {u.profileImagePath ? (
                                                <img 
                                                    src={getImageUrl(u.profileImagePath)!} 
                                                    alt={u.userName} 
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-bold text-gray-500 text-xs">
                                                    {u.userName.substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Username Text */}
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {u.userName}
                                                {u.userName === currentUser?.username && (
                                                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">YOU</span>
                                                )}
                                            </span>
                                            <span className="text-xs text-gray-400">{u.email}</span>
                                        </div>
                                    </div>
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
                                            className="text-indigo-600 hover:text-indigo-900 font-bold hover:underline"
                                        >
                                            Edit
                                        </button>
                                        
                                        {u.userName !== currentUser?.username && (
                                            <button 
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-500 hover:text-red-700 font-bold hover:underline"
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