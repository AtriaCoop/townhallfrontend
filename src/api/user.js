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

export const searchTagsByPrefix = async (prefix) => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/tags/given-prefix/?prefix=${encodeURIComponent(prefix)}`)
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Error searching tags")
        }
        return data.tags || data || []
    } catch (err) {
        console.error("Error searching tags", err)
        return []
    }
}

export const createTag = async (name) => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/tags/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Error creating tag")
        }
        return data.tag || data
    } catch (err) {
        console.error("Error creating tag", err)
        throw err
    }
}

export const updateUserTags = async (userId, tags) => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/user/${userId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tags }),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Error updating user tags")
        }
        return data
    } catch (err) {
        console.error("Error updating user tags", err)
        throw err
    }
}

export async function createReport({content}) {
    const formData = new FormData();
    formData.append("content", content)

    const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/user`)
}