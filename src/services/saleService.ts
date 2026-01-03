import api from './api';

export interface PaginationMeta {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
}

// send to the API (Matches CreateSaleRequestDto.cs)
export interface SaleItemDto {
    medicineId: number;
    quantity: number;
}

export interface SaleItemResponse {
    id: number;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface CreateSaleRequest {    
    items: SaleItemDto[];
}

// What the API returns (Matches SaleResponseDto.cs)
export interface SaleResponse {
    id: number;
    userId: number;
    totalAmount: number;
    transactionDate: string;
    items: SaleItemResponse[];
}

export interface SaleParams {
    pageNumber?: number;
    pageSize?: number;
}

export interface SaleApiResponse {
    meta: PaginationMeta;
    data: SaleResponse[];
}

export const createSale = async (data: CreateSaleRequest): Promise<SaleResponse> => {
    const response = await api.post<SaleResponse>('/Sales', data);
    return response.data;
};

export const getSales = async (params: SaleParams): Promise<SaleApiResponse> => {
    const response = await api.get<SaleApiResponse>('/Sales', { params });
    return response.data;
};