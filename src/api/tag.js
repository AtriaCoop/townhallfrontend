import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';

export const fetchAllTags = async () => {
    try {
        const response = await authenticatedFetch(
            `${BASE_URL}/tags/get_all_tags/`
        );
        const results = await response.json()
        if (!response.ok){
            throw new Error(results.message || "Error fetching mentions")
        }        

        return results;
    } catch (error) {
        console.error('Error fetching all tags:', error);
        throw error;
    }
};