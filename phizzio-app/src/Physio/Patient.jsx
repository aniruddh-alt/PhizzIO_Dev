import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useParams } from 'react-router-dom';
import PhysioHeader from './PhysioHeader';
import Modal from './ExModel';
import WeeklySummary from '../Patient/WeeklySummary';




function Patient() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [exvisible, setExvisible] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const toggleVisibility = () => {
        setExvisible(!exvisible);
    };

    const closeModal = () => {
        setIsOpen(false);
        location.reload();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        closeModal();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/physio/patient/${id}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id]);
    const uniqueExerciseNames = data && data.exercise_log ? [...new Set(data.exercise_log.map(entry => entry.exercise_name))] : [];
    
    if (!data){
        return (
            <div className="flex justify-center items-center h-screen">
                <button type="button" className="bg-blue-500 text-white font-bold py-2 px-4 rounded inline-flex items-center" disabled>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zM2 14h-.09a10 10 0 0017.17 0H18c0 5.523-4.477 10-10 10S2 19.523 2 14z"></path>
                    </svg>
                    Loading...
                </button>
            </div>
        );
    }
    
    return (
        <>
            <PhysioHeader />
            <div className="container mx-auto px-4 py-8">
                {data && (
                    <div className="bg-gray-100 rounded-lg shadow-md p-5 hover:bg-gray-200">
                        <h1 className="text-3xl font-bold mb-4">Patient Information</h1>
                        <div className="grid grid-cols-2 gap-4">
                            <div className=''>
                                <p className="text-lg font-semibold mb-2">Name</p>
                                <p className="text-lg mb-4">{data.name}</p>

                                <p className="text-lg font-semibold mb-2">Age</p>
                                <p className="text-lg mb-4">{data.age}</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold mb-2">Date of Birth</p>
                                <p className="text-lg mb-4">{data.DOB}</p>

                                <p className="text-lg font-semibold mb-2">Gender</p>
                                <p className="text-lg mb-4">{data.Gender}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-semibold mb-2">Injury</p>
                            <p className="text-lg mb-4">{data.injury}</p>
                        </div>
                    </div>
                )}
                {data && (
                    <div className="bg-gray-100 rounded-lg shadow-md mt-5 p-5 hover:bg-gray-200">
                        <h1 className="text-3xl font-bold mb-4">Exercises Assigned</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {data.exercises.map(exercise => (
                                <div key={exercise.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                                    <h2 className="text-xl font-bold mb-2">{exercise.exercise_name}</h2>
                                    <p className="text-lg mb-2 text-gray-500">Sets: {exercise.exercise_sets}</p>
                                    <p className="text-lg mb-2 text-gray-500">Reps: {exercise.exercise_reps}</p>
                                    <p className="text-lg mb-2 text-gray-500">Threshold Angle: {exercise.angle}</p>
                                    <p className="text-lg mb-2 text-gray-500">Notes: {exercise.notes}</p>
                                </div>
                            ))}
                            <button className="bg-blue-500 rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1" onClick={openModal}>
                                <div className="flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-2 text-white flex items-center justify-center">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <p className="text-xl text-center text-white font-bold mb-2 mt-1">Assign Exercise</p>
                                </div>
                            </button>
                            {isOpen && <Modal closeModal={closeModal} isOpen={isOpen} setIsOpen={setIsOpen} id={id}/>}
                        </div>
                    </div>
                )}
                <WeeklySummary patient={data.exercise_log} uniqueExerciseNames={uniqueExerciseNames} />
                <div className="bg-gray-100 rounded-lg shadow-md mt-5 p-5 ">
                    <h1 className="text-3xl font-bold mb-4 cursor-pointer" onClick={toggleVisibility}>
                    Exercise Log {exvisible ? '▲' : '▼'}
                    </h1>
                    {exvisible && 
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
                                {data.exercise_log.map(exercise => (
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
                    }
                </div>
            </div>
        </>
    );
}

export default Patient;
