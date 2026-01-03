import api from './api';

// Matches PharmaLink.API/DTOs/Users/UserResponseDto.cs
export interface UserResponse {
    id: number;
    email: string;
    userName: string;
    role: string;
}

// Matches PharmaLink.API/DTOs/Auth/UserRegisterDto.cs
export interface CreateUserRequest {
    userName: string;
    password: string;
    role: string; // 'Admin' or 'Pharmacist'
}

export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/Auth/Users'); 
    return response.data;
};
    
export const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/Users/${id}`);
};

// We use the Auth registration endpoint, but call it from inside the app
export const registerUser = async (data: CreateUserRequest): Promise<void> => {
    await api.post('/Auth/register', data);
};