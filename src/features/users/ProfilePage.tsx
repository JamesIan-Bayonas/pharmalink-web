import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadProfilePhoto } from '../../services/userService';

const ProfilePage = () => {
    const { user } = useAuth();
    
    // Form State
    const [userName, setUserName] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Image State
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create local preview URL
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Upload Image (if selected)
            if (selectedFile) {
                await uploadProfilePhoto(selectedFile);
            }

            // 2. Update Text Details (Password/Username)
            if (password && password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }

            await updateProfile({
                userName: userName,
                email: "placeholder@email.com", // Your DTO requires email, ensuring it's not null
                password: password || undefined // Only send if typed
            });

            setMessage({ type: 'success', text: 'Profile updated successfully! Please re-login to see changes.' });
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || error.message || "Failed to update profile." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="bg-white p-6 rounded shadow-sm border-l-4 border-purple-600">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account settings and security</p>
            </header>

            <div className="bg-white rounded shadow p-8">
                {message.text && (
                    <div className={`mb-6 p-3 rounded text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* --- SECTION 1: AVATAR --- */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="cursor-pointer">
                            <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-bold transition">
                                Change Photo
                            </span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    <hr className="border-gray-100" />

                    {/* --- SECTION 2: DETAILS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input 
                                disabled 
                                type="text" 
                                value={user?.role} 
                                className="w-full border p-2 rounded bg-gray-50 text-gray-500 cursor-not-allowed" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input 
                                required
                                type="text" 
                                value={userName}
                                onChange={e => setUserName(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
                            />
                        </div>
                    </div>

                    {/* --- SECTION 3: SECURITY --- */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Security</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Leave blank to keep current"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded font-bold shadow-lg transform transition hover:-translate-y-0.5"
                        >
                            {loading ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;