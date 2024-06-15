import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoFeed from './FormStream';




const ExerciseModal = ({ closeModal, id, name, patient_id }) => {
    const [countdown, setCountdown] = useState(3); // Countdown starting from 3 seconds

    useEffect(() => {
        const timer = setInterval(() => {
            if (countdown > 0) {
                setCountdown(prevCountdown => prevCountdown - 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg w-3/4 text-center">
                <h2 className="text-2xl font-bold mb-4">Perform Exercise</h2>
                
                {countdown > 0 && (
                    <div className="text-4xl font-bold mb-4">{countdown}</div>
                )}

                {countdown === 0 && (
                    <div className="flex items-center justify-center mb-4">
                        <VideoFeed closeModal={closeModal} id={id} name={name} patient_id={patient_id}/>
                    </div>
                )}

                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                    onClick={closeModal}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ExerciseModal;

