import axios from 'axios';

export const getSessionData = async () => {
    try{
        const response = await axios.get('http://localhost:5000/get-session', {withCredentials: true});
        return response.data;
    } catch(error){
        console.error('Error getting session data:', error);
        throw error;
    }
};

export default getSessionData;