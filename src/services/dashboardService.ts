import api from './api';

export interface DashboardStats {
    totalRevenueToday: number;
    totalSalesToday: number;
    lowStockItems: number;
    expiringSoonItems: number;
    totalMedicines: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/Dashboard/stats'); 
    return response.data;
};