import config from "../../config.js";
import { apiRequest } from '../../utils/api.utils.js';

const API_URL = `${config.API_BASE_URL}/dashboard`;

export const getDashboard = async (period = 'MONTH') => {
    const url = `${API_URL}?period=${encodeURIComponent(period)}`;
    return await apiRequest(url, { method: 'GET', credentials: 'include' }, 'Error al cargar el dashboard');
};
