import React from 'react';

const NextAnswerLoader = () => {
  return (
     <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-blue-700 font-semibold text-lg">Wait for Next Quaction...</p>
            </div>
        </div>
  );
};

export default NextAnswerLoader;