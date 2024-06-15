// src/VideoFeed.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';

const VideoFeed = ({closeModal, id, name, patient_id}) => {
    
    const [videoEnded, setVideoEnded] = useState(false);

    useEffect(() => {
        const interval = setInterval( async () => {
            const response = await axios.post(`http://localhost:5000/api/video_status`);
            setVideoEnded(response.data.ended);
            console.log(videoEnded)
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (videoEnded) {
            timeout = setTimeout(() => {
                closeModal();
            }, 3000);
        }
    });

    if (videoEnded) {
        return (
            <div>
                <h1>Video Ended</h1>
            </div>
        );
    }else{
        return (
            <div>
                <img src={`http://localhost:5000/api/exercise/${patient_id}/${id}`} alt="Live Video Feed" />
                <h1>{videoEnded}</h1>
            </div>
        );
    }
}

export default VideoFeed;
