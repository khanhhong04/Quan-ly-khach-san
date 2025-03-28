import axios from "axios";
import { API_URL } from '../constants/apiConfig';

export const getUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
};
