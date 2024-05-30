import axios from 'axios';

const setSessionData = async (data) =>{
    try{
        const response = await axios.pose('http://localhost:5000/set-session', data, {withCredentials: true});
        return response.data;
    } catch (error){
        console.error('Error setting session data:', error);
        throw error;
    }
}

export default setSessionData;