import {useState, useEffect} from "react"

export function useDarkMode() {
	
	const [darkMode, setDarkMode] = useState(false)

	// Try to get preference from localstorage
	useEffect(() => {
		const stored = localStorage.getItem("darkMode")
		setDarkMode(stored ? JSON.parse(stored) : false)
	}, [])

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add("dark")
		} else {
			document.body.classList.remove("dark")
		}
		// Save to localstorage
		if (typeof window !== "undefined") {
			localStorage.setItem("darkMode", JSON.stringify(darkMode))
		}
	}, [darkMode])

	return [darkMode, setDarkMode]
}