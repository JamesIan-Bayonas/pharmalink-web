import api from './api';

export interface Medicine {
    id: number;
    name: string;
    description?: string;
    categoryId: number;
    stockQuantity: number;
    price: number;
    expiryDate: string; // type ISO Date String
}

export interface CreateMedicineRequest {
    name: string;
    categoryId: number;
    price: number;
    stockQuantity: number;
    expiryDate: string;
    description?: string;
}

// The "Meta" data for pagination
export interface PaginationMeta {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
}

// GetAllMedicines data response
export interface MedicineApiResponse {
    meta: PaginationMeta;
    data: Medicine[];
}

export interface MedicineParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    orderBy?: string;
    categoryId?: number;
    filter?: string; // e.g., "expired", "lowstock" 
}

export interface UpdateStockRequest {
    quantity: number;
}

export const getMedicines = async (params: MedicineParams): Promise<MedicineApiResponse> => {
    const response = await api.get<MedicineApiResponse>('/Medicines', { params });
    return response.data;
};

export const createMedicine = async (data: CreateMedicineRequest): Promise<void> => {
    await api.post('/Medicines', data);
};

export const updateMedicine = async (id: number, data: CreateMedicineRequest): Promise<void> => {
    await api.put(`/Medicines/${id}`, data);
};

export const deleteMedicine = async (id: number): Promise<void> => {
    await api.delete(`/Medicines/${id}`);
};

export const updateMedicineStock = async (id: number, quantity: number): Promise<void> => {
    // Backend Logic: "Stock - Quantity". 
    // To ADD stock, we must send a NEGATIVE number. (e.g., -50 adds 50)
    await api.patch(`/Medicines/${id}/stock`, { quantity: -quantity });
};