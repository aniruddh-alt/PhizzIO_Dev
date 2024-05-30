import React, { useState, useEffect } from "react";
import PhysioHeader from "./PhysioHeader";
import axios from "axios"; // Import axios for making API requests
import { Link } from "react-router-dom";

function Physio() {
    // State variables for session and patient data
    const [data, setData] = useState(null); // State to hold the fetched data

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/physio'); // Fetch data from the API
                console.log(response.data); // Log the response data
                setData(response.data); // Update the state with fetched data
            } catch (error) {
                console.error('Error fetching data:', error); // Log any errors
            }
        };
        fetchData();
    }, []);

    

    // If data is not yet fetched, display loading message
    if (!data) {
        return <div>Loading...</div>;
    }

    // Destructure the data object
    const { physios } = data;

    return (
        <>
            <PhysioHeader />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Welcome, {physios[0]?.name}</h1> {/* Use actual name here */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-100 rounded-lg p-6 shadow-md hover:bg-blue-100 ">
                        <h2 className="text-lg font-bold mb-4 text-center">Sessions this week</h2>
                        {/* Use actual session count from data */}
                        <p className="text-3xl font-bold text-center">{5}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-6 shadow-md hover:bg-blue-100">
                        <h2 className="text-lg font-bold mb-4 text-center">Missed sessions</h2>
                        {/* Use actual missed sessions count from data */}
                        <p className="text-3xl font-bold text-center">{2}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Active Patients</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {physios[0]?.patients.length === 0 ? (
                            <p>No active patients</p>
                        ) : (
                            physios[0]?.patients.map(patient => (
                                <Link key={patient.id} to={`patient/${patient.id}`} className="bg-white rounded-lg p-4 shadow-md hover:bg-gray-100">
                                    <div>
                                        <h3 className="text-lg font-bold mb-2">{patient.name}</h3>
                                        <p className="text-gray-600">Patient details</p>
                                        <p className="text-gray-600">Injury - {patient.injury}</p>
                                        <p className="text-gray-600">Age - {patient.age}</p>
                                        <p className="text-gray-600">Height - {patient.height}</p>
                                        <p className="text-gray-600">Weight - {patient.weight}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Physio;
