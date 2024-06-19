import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function MistakesGraph({ exerciseLog, exerciseName }) {
    const filteredLog = exerciseLog.filter(entry => entry.exercise_name === exerciseName);

    const [exvisible, setExvisible] = useState(false);
    const toggleVisibility = () => {
        setExvisible(!exvisible);
    };

    const data = {
        labels: filteredLog.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: `Mistakes Over Time for ${exerciseName}`,
                data: filteredLog.map(entry => entry.mistakes),
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: false,
            }
        ]
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Mistakes',
                },
                beginAtZero: true,
            }
        }
    };
    console.log(data);

    return (
        <div className="bg-blue-50 rounded-lg shadow-md mt-5 p-5">
            <h2 className="text-2xl font-bold mb-4 cursor-pointer" onClick={toggleVisibility}>Mistakes Over Time for {exerciseName} {exvisible ? '▲' : '▼'}</h2>
            { exvisible && <Line data={data} options={options} /> }
        </div>
    );
}

export default MistakesGraph;
