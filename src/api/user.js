import { authenticatedFetch } from '@/utils/authHelpers';

export const fetchMentions = async (query) => {
    try {
        const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/user/mention?query=${query}`)
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

export async function createReport({content}) {
    const formData = new FormData();
    formData.append("content", content)

    const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/user`)
}