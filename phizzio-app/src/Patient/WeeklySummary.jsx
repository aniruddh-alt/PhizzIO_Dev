import React from 'react';
import { format, startOfWeek, endOfWeek, differenceInCalendarWeeks, addWeeks, subWeeks } from 'date-fns';
import MistakesGraph from './LogMistakesGraph';

// Utility function to group logs by weeks
const groupWeeks = (logs) => {
    const logbyweeks = {};
    if (logs.length === 0) return logbyweeks;
    
    const currentdate = new Date();
    const earliestDate = new Date(logs[logs.length - 1].date);
    const weeks = differenceInCalendarWeeks(currentdate, earliestDate);

    for (let i = 0; i <= weeks; i++) {
        const start = startOfWeek(subWeeks(currentdate, i));
        const end = endOfWeek(start);
        const week = `${format(start, 'MM-dd-yyyy')} - ${format(end, 'MM-dd-yyyy')}`;
        if (!logbyweeks[week]) {
            logbyweeks[week] = [];
        }
    }

    logs.forEach(log => {
        const logDate = new Date(log.date);
        const start = startOfWeek(logDate);
        const end = endOfWeek(logDate);
        const week = `${format(start, 'MM-dd-yyyy')} - ${format(end, 'MM-dd-yyyy')}`;
        if (!logbyweeks[week]) {
            logbyweeks[week] = [];
        }
        logbyweeks[week].push(log);
    });
    
    return logbyweeks;
};

function WeeklySummary({ patient, uniqueExerciseNames }) {
    if (!patient || !patient.length) {
        return null;
    }
    const logweeks = groupWeeks(patient);

    return (
        <div className="bg-gray-100 rounded-lg shadow-md mt-5 p-5">
            <h2 className="text-3xl font-bold mb-4">Weekly Summary</h2>

            {Object.keys(logweeks).map(week => (
                <div key={week} className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h3 className="text-xl font-bold mb-2">{week} {}</h3>
                    {logweeks[week].length === 0 ? (
                        <p className="bg-red-200 rounded px-2 inline-block">No exercises done this week</p>
                    ) : (
                        <div>
                            <table className="table-auto w-full">
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
                                    {logweeks[week].map(log => (
                                        <tr key={log.exercise_id}>
                                            <td className="border px-4 py-2">{log.date}</td>
                                            <td className="border px-4 py-2">{log.exercise_name}</td>
                                            <td className="border px-4 py-2">{log.duration}</td>
                                            <td className="border px-4 py-2">{log.sets_complete}</td>
                                            <td className="border px-4 py-2">{log.reps_complete}</td>
                                            <td className="border px-4 py-2">{log.mistakes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {uniqueExerciseNames.map(exerciseName => (
                                <MistakesGraph key={exerciseName} exerciseLog={logweeks[week].filter(log => log.exercise_name === exerciseName)} exerciseName={exerciseName} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WeeklySummary;
