import { BASE_URL } from '@/constants/api';

export const fetchAllTags = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/tags/get_all_tags/`
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching all tags:', error);
        throw error;
    }
};