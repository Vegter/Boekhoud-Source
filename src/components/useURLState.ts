import { useHistory, useLocation } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { URLState } from "../services/URLState"

export function useURLState(): [URLState, (state: Record<string, any>) => void] {
    const location = useLocation()
    const history = useHistory()
    const unregisterListener = useRef<() => void>(() => null)

    const [urlState, setURLState] = useState<URLState>(() => new URLState(location))

    const setState = (state: Record<string, any>) => {
        urlState.save(history, location, state)
    }

    useEffect(() => {
        unregisterListener.current = history.listen((location) => {
            setURLState(new URLState(location))
        })

        return () => {
            unregisterListener.current()
        }
    },[history])

    return [urlState, setState];
}
