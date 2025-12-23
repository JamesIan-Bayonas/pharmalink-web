import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from "jwt-decode"; 
import api from '../services/api';

// Define the Shape of your User Object
interface User {
    id: number;
    username: string;
    role: "Admin" | "Pharmacist"; // Strict Union Type
}

// Define the Shape of the JWT Payload
interface CustomJwtPayload {
    uid: string;       // Your custom claim
    role: "Admin" | "Pharmacist"; 
    sub: string;       // Standard username claim
    exp: number;
}

// Define the Context State
interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Load User on Refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<CustomJwtPayload>(token);
                setUser({
                    id: parseInt(decoded.uid), // Convert string claim to number
                    username: decoded.sub,
                    role: decoded.role
                });
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post('/Auth/login', { username, password });
            const { token } = response.data;

            localStorage.setItem('token', token);

            const decoded = jwtDecode<CustomJwtPayload>(token);
            setUser({
                id: parseInt(decoded.uid),
                username: decoded.sub,
                role: decoded.role
            });

            return { success: true };
        } catch (error: any) {
            console.error("Login failed", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed" 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};