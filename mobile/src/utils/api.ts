import { Platform } from 'react-native';

// ==========================================
// 🚀 CONFIGURATION: CLOUD MODE (Render.com)
// ==========================================

// 👇 This is your PERMANENT Cloud Backend
const CLOUD_URL = 'https://campus-placement-api-5so5.onrender.com';

export const API_URL = `${CLOUD_URL}/api`;

// ------------------------------------------
// (Old Local Config - Kept for reference)
// const SERVER_IP = '10.4.192.3';
// const SERVER_PORT = '5000';
// const getBaseUrl = () => `http://${SERVER_IP}:${SERVER_PORT}/api`;
// ------------------------------------------

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

export const api = {
    get: async <T = any>(endpoint: string, token?: string | null): Promise<ApiResponse<T>> => {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) headers.Authorization = `Bearer ${token}`;

            console.log(`GET Request: ${API_URL}${endpoint}`);
            const res = await fetch(`${API_URL}${endpoint}`, { headers });
            return res.json();
        } catch (error) {
            console.error('API GET Error:', error);
            return { success: false, message: 'Network error - Check Internet Connection' };
        }
    },

    post: async <T = any>(endpoint: string, data: any, token?: string | null): Promise<ApiResponse<T>> => {
        try {
            const headers: Record<string, string> = { 
                'Content-Type': 'application/json',
            };
            if (token) headers.Authorization = `Bearer ${token}`;

            console.log(`POST Request: ${API_URL}${endpoint}`);
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            return res.json();
        } catch (error) {
            console.error('API POST Error:', error);
            return { success: false, message: 'Network error - Check Internet Connection' };
        }
    },

    put: async <T = any>(endpoint: string, data: any, token?: string | null): Promise<ApiResponse<T>> => {
        try {
            const headers: Record<string, string> = { 
                'Content-Type': 'application/json',
            };
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data),
            });
            return res.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    delete: async <T = any>(endpoint: string, token?: string | null): Promise<ApiResponse<T>> => {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers });
            return res.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            return { success: false, message: 'Network error' };
        }
    },
};