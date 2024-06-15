// src/App.js
import React, {useEffect, useState} from 'react';
import VideoFeed from './FormStream';
import axios from 'axios';

const Test = () => {
    const [data, setData] = useState({
        sets: 0,
        reps: 0,
        elapsed_time: 0,
        mistakes: 0,
        status: "incomplete"
    });

    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await axios.get('http://localhost:5000/api/video_stream_test2');
                setData(response.data);
            } catch (error) {
                console.log(error);
            }
        }
    })
    return (
        <div className="App">
            <h1>Video Exercises Tracker</h1>
            <VideoFeed />
            <h1>{data.sets}</h1>
        </div>
    );
}

export default Test;
