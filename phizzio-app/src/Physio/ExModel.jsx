import React from 'react';
import { useState } from 'react';
import axios from 'axios';

const Modal = ({ isOpen, setIsOpen,closeModal,id}) => {

    const [exerciseName, setExerciseName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [angle, setAngle] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/assign_exercise/${id}`, {
                exerciseName,
                sets,
                reps,
                angle,
                notes
            });
    
            console.log(response.data); // Log response data for debugging
            closeModal(); // Close modal after successful submission
        } catch (error) {
            console.error('Error occurred while submitting:', error);
            // Handle error, e.g., show error message to the user
        }
    };
    return(
        <div>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg w-3/4">
                    <h2 className="text-2xl font-bold mb-4">Assign Exercise</h2>
                    <div>
                        <div className="mb-4">
                            <label className="block mb-2  text-sm font-medium text-gray-700" htmlFor="exerciseName">Exercise Name</label>
                            <select className='mt-1 p-2 border rounded-md w-full' id='exerciseName' value={exerciseName} onChange={(e)=>setExerciseName(e.target.value)}>
                                <option value=''>Select an exercise</option>
                                <option value='1'>Squats</option>
                                <option value='2'>Heel Slides</option>
                                <option value='3'>Knee Extensions</option>
                                <option value='4'>Arm Raises</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className='block mb-2 text-sm font-medium text-gray-700' htmlFor="reps">Reps</label>
                            <input className='mt-1 p-2 border rounded-md w-full' type='number' id='reps' name='reps' value={reps} onChange={(e)=>setReps(e.target.value)}></input>
                        </div>
                        <div className="mb-4">
                            <label className='block mb-2 text-sm font-medium text-gray-700' htmlFor="sets">Sets</label>
                            <input className='mt-1 p-2 border rounded-md w-full' type='number' id='sets' name='sets' value={sets} onChange={(e)=>setSets(e.target.value)}></input>
                        </div>
                        <div className="mb-4">
                            <label className='block mb-2 text-sm font-medium text-gray-700' htmlFor="sets">Threshold Angle</label>
                            <input className='mt-1 p-2 border rounded-md w-full' type='number' id='angle' name='angle' value={angle} onChange={(e)=>setAngle(e.target.value)}></input>
                        </div>
                        <div className="mb-4">
                            <label className='block mb-2 text-sm font-medium text-gray-700' htmlFor="notes">Notes</label>
                            <input className='mt-1 p-2  border rounded-md w-full' type='text' id='notes' name='notes' value={notes} onChange={(e)=>setNotes(e.target.value)}></input>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button type="button" className="mr-2 bg-gray-200 px-4 py-2 rounded-md" onClick={closeModal}>Cancel</button>
                            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md">Assign Exercise</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )

    
}


export default Modal;
