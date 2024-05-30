import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import PhysioHeader from "../Physio/PhysioHeader";

function PatientVW() {
    const [patient, setPatient] = useState(null);
    const [exerciseID, setExerciseID] = useState(null);
    const { id } = useParams();

    const PerformExercise = async (exercise_id) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/exercise/1/${exercise_id}`);
            console.log(response.data);
            location.reload();
        } catch (error) {
            console.error('Error performing exercise:', error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/patient`);
                console.log(response.data);
                setPatient(response.data);
            } catch (error) {
                console.error('Error fetching patient data:', error);
            }
        };
        fetchData();
    }, [id]);

    if (!patient) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <PhysioHeader />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Welcome, {patient.name}</h1>
                <div className="grid grid-cols gap-6">
                    <div className="bg-gray-100 rounded-lg p-6 shadow-md hover:bg-blue-100">
                        <h2 className="text-lg font-bold mb-4 text-center">Your Details</h2>
                        <p className="text-xl font-bold text-center">Physio Name: Aniruddhan Ramesh</p>
                        <p className="text-xl font-bold text-center">Email: {patient.email}</p>
                        <p className="text-xl font-bold text-center">Your Injury: {patient.injury}</p>
                    </div>
                </div>
                <div className="bg-gray-100 rounded-lg shadow-md mt-5 p-5 hover:bg-gray-200">
                    <h1 className="text-3xl font-bold mb-4">Perform Exercises</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {patient.exercises.map(exercise => (
                            <button key={exercise.exercise_id} onClick={() => PerformExercise(exercise.exercise_id)} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                                <h2 className="text-xl font-bold mb-2">{exercise.exercise_name}</h2>
                                <p className="text-lg mb-2 text-gray-500">Sets: {exercise.exercise_sets}</p>
                                <p className="text-lg mb-2 text-gray-500">Reps: {exercise.exercise_reps}</p>
                                <p className="text-lg mb-2 text-gray-500">Threshold Angle: {exercise.angle}</p>
                                <p className="text-lg mb-2 text-gray-500">Notes: {exercise.notes}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-100 rounded-lg shadow-md mt-5 p-5 ">
                    <h1 className="text-3xl font-bold mb-4">Exercise Log</h1>
                    <table className="table-auto md:table-fixed w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Exercise</th>
                                <th className="px-4 py-2 text-left">Duration</th>
                                <th className="px-4 py-2 text-left">Sets</th>
                                <th className="px-4 py-2 text-left">Reps</th>
                                <th className="px-4 py-2 text-left">Mistake Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patient.exercise_log.map(exercise => (
                                <tr key={exercise.exercise_id}>
                                    <td className="border px-4 py-2">{exercise.date}</td>
                                    <td className="border px-4 py-2">{exercise.exercise_name}</td>
                                    <td className="border px-4 py-2">{exercise.duration}</td>
                                    <td className="border px-4 py-2">{exercise.sets_complete}</td>
                                    <td className="border px-4 py-2">{exercise.reps_complete}</td>
                                    <td className="border px-4 py-2">{exercise.mistakes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default PatientVW;
