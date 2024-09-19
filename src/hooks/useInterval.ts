import { useEffect, useRef } from 'react';

export const useInterval = (callback: any, delay: any) => {

    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            if (savedCallback.current) { 
                savedCallback.current();
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => {
                clearInterval(id)
            };
        }
    }, [delay]);
}