import api from './api';

export interface Category {
    id: number;
    name: string;
}

// Defines what we send when creating a category
export interface CreateCategoryRequest {
    name: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/Categories');
    return response.data;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<{ id: number; message: string }> => {
    const response = await api.post('/Categories', data);
    return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
    await api.delete(`/Categories/${id}`);
};