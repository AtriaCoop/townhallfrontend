import { authenticatedFetch, getCookie } from "@/utils/authHelpers"
import { BASE_URL } from '@/constants/api'
import { useEffect, useState } from "react"

//  Custom hook to fetch activities
export const useGetActivities = (userId) => {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    
    const getActivities = async () => {
        try {
            const csrfToken = getCookie("csrftoken")

            setLoading(true)
            setError('')
            const response = await authenticatedFetch(`${BASE_URL}/activities`, {
                method : "GET",
                headers: {
                    "X-CSRFToken": csrfToken
                },
            })
            const res = await response.json()
            if (!response.ok){
                setError(res.error)
            }
            setActivities(res.data)
        } catch(err){
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getActivities()
    }, [userId])

    return { activities, loading, error, refetch: getActivities }

}
