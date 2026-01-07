import { useState, useEffect } from 'react';
import { registerUser, updateUser, type UserResponse } from '../../services/userService';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: UserResponse | null;
}

const UserModal = ({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '', // <--- Add State for Email
        password: '',
        role: 'Pharmacist'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (userToEdit) {
                // EDIT MODE: Populate fields
                setFormData({
                    userName: userToEdit.userName,
                    email: userToEdit.email, 
                    password: '', 
                    role: userToEdit.role
                });
            } else {
                // CREATE MODE: Reset
                setFormData({
                    userName: '',
                    email: '',
                    password: '',
                    role: 'Pharmacist'
                });
            }
        }
    }, [isOpen, userToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (userToEdit) {
                // UPDATE LOGIC
                const payload: any = {
                    userName: formData.userName,
                    email: formData.email, // <--- Send it back
                    role: formData.role
                };
                
                // Only add password if typed
                if (formData.password.trim()) {
                    payload.password = formData.password;
                }

                await updateUser(userToEdit.id, payload);
            } else {
                // CREATE LOGIC
                await registerUser({
                    userName: formData.userName,
                    password: formData.password,
                    role: formData.role
                });
            }
            
            onSuccess(); 
            onClose();
        } catch (err: any) {
             console.error("Full Error Object:", err);
             const msg = err.response?.data?.message || err.response?.data?.title || "Operation failed. Check console.";
             setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                    {userToEdit ? 'Edit User' : 'Register New Employee'}
                </h2>
                
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input 
                            required type="text" className="w-full border p-2 rounded"
                            value={formData.userName}
                            onChange={e => setFormData({...formData, userName: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Password {userToEdit && <span className="text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>}
                        </label>
                        <input 
                            required={!userToEdit}
                            type="password" 
                            className="w-full border p-2 rounded"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder={userToEdit ? "********" : "Enter temporary password"}
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
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                            {loading ? 'Saving...' : (userToEdit ? 'Update User' : 'Create Account')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
