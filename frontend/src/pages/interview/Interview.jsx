import React, { useEffect, useState } from 'react'
import InterviewService from '../../services/interview';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const Interview = () => {
    const { id } = useParams();
    const [QuactionsArray, setQuactionsArray] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, [id]);

    const fetchJobs = async () => {
        try {
            const response = await InterviewService.getInterviewQuactions(id);
            if (response.success) {
                setQuactionsArray(response.data.quactionList);
            } else {
                setQuactionsArray([]);
            }
            console.log("Interview Questions:", response);
            
        } catch (error) {
            Swal.fire({
                title: "Fetching Failed",
                text: error.message || "Error Fetching Jobs.",
                confirmButtonColor: "red",
            });
            setQuactionsArray([]);
        }
        setLoading(false);
    };
    return (
        <div>
            <div className='flex flex-row gap-2'>
                <div className='w-1/3 flex flex-col justify-center items-center'>
                    <h2 className='font-semibold text-xl'>Your Quactions</h2>
                    <div>
                        <ul className='list-disc'>
                            {QuactionsArray.map((question) => (
                                <li key={question.quactionNo} className='text-lg font-medium'>
                                    {question.quaction}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='w-2/3 flex flex-col justify-center items-center gap-y-4'>
                    <div className='bg-slate-400 rounded-lg w-96 h-96'></div>
                    <button className='bg-blue-500 text-white px-4 py-2 rounded-lg'>Start Interview</button>
                </div>
            </div>
        </div>
    )
}

export default Interview