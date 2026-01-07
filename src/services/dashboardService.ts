import api from './api';

export interface SalesTrend {
    dateLabel: string; // e.g., "Mon", "Tue"
    totalAmount: number;
}

export interface DashboardStats {
    totalRevenueToday: number;
    totalSalesToday: number;
    lowStockItems: number;
    expiringSoonItems: number;
    totalMedicines: number;
    weeklySales: SalesTrend[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/Dashboard/stats'); 
    return response.data;
};