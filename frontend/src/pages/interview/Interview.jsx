import React from 'react'

const Interview = () => {
    return (
        <div>
            <div className='flex flex-row gap-2'>
                <div className='w-1/3 flex flex-col justify-center items-center'>
                    <h2 className='font-semibold'>Your Quactions</h2>
                    <div>
                        <ul className='list-disc'>
                            <li>What is your name?</li>
                            <li>What is your age?</li>
                            <li>What is your qualification?</li>
                            <li>What is your experience?</li>
                            <li>What is your skill?</li>
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