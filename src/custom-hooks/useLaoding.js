import { useContext } from 'react';
import { AppContext } from '../state/app.context';


export default function useLoading() {
    const { loading, setLoading } = useContext(AppContext);

    const startLoading = () => setLoading(true);
    const stopLoading = () => setLoading(false);

    return {
        loading,
        startLoading,
        stopLoading,
    };
}