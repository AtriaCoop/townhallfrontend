import { useEffect, useState } from "react"

//  Custom hook to fetch activities
export const useGetActivities = (userId) => {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    
    const getActivities = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/activities/?user_id=${userId}`)
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
