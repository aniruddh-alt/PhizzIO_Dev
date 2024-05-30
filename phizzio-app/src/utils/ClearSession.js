import axios from 'axios'
export const clearSessionData = async () => {
    try {
        const response = await axios.get('http://localhost:5000/clear-session', { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error clearing session data:', error);
        throw error;
    }
}


export default clearSessionData;