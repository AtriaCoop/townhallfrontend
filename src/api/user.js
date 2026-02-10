import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';

export const fetchMentions = async (query) => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/user/mention?query=${query}`)
        const results = await response.json()
        if (!response.ok){
            throw new Error(results.message || "Error fetching mentions")
        }
        return results.search_results || []

    } catch (err){
        console.error("Error fetching mentions", err)
        return []
    }
}