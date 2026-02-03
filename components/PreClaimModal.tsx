import React, { useState } from 'react';
import { QuizData } from '../types';

interface PreClaimModalProps {
  onSubmit: (data: QuizData) => void;
}

const PreClaimModal: React.FC<PreClaimModalProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<QuizData>({
    resignationFrequency: '',
    hiringPlan: '',
    headcount: '',
  });

  const isComplete = formData.resignationFrequency && formData.hiringPlan && formData.headcount;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-red-950/95">
      {/* Container - Responsive sizing */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-3 sm:p-5 md:p-8 w-full max-w-6xl shadow-2xl relative overflow-hidden border-4 sm:border-6 md:border-8 border-yellow-500 animate-scale-bounce solid-shadow max-h-[95vh] overflow-y-auto">
        
        {/* Festive Header Section */}
        <div className="absolute top-0 left-0 w-full h-12 sm:h-16 md:h-20 bg-red-700 flex items-center justify-center">
            <h2 className="text-white font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-tighter drop-shadow-md">
                Unlock Your HUAT!
            </h2>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 text-center mb-4 sm:mb-6 md:mb-8">
          <p className="text-gray-800 font-black text-sm sm:text-lg md:text-xl italic px-2">
            "Just 3 quick questions to reveal your prosperity!"
          </p>
        </div>

        {/* 3 Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          
          {/* Question 1 */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 bg-red-50/50 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-red-100">
            <label className="text-xs sm:text-sm font-black text-red-700 uppercase tracking-wide sm:tracking-widest flex flex-col gap-1 sm:gap-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="bg-red-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs mt-0.5">1</span>
                    <span className="leading-tight">How often do employees resign in your company after CNY?</span>
                </div>
            </label>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {["Very frequently", "Occasionally", "Rarely", "Almost never"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData({...formData, resignationFrequency: opt})}
                  className={`text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border-2 font-bold transition-all text-left shadow-sm
                    ${formData.resignationFrequency === opt 
                      ? 'border-red-600 bg-red-50 text-red-700 scale-[1.02] ring-2 ring-red-200' 
                      : 'border-gray-200 text-gray-700 hover:border-red-200 bg-white'}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 bg-orange-50/50 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-orange-100">
            <label className="text-xs sm:text-sm font-black text-red-700 uppercase tracking-wide sm:tracking-widest flex flex-col gap-1 sm:gap-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="bg-red-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs mt-0.5">2</span>
                    <span className="leading-tight">Are you planning to hire new staffs after CNY?</span>
                </div>
            </label>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {[
                  "Yes, I'm hiring now",
                  "Yes, I will hire after CNY",
                  "I will hire within 3 months",
                  "No, I'm not hiring"
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData({...formData, hiringPlan: opt})}
                  className={`text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border-2 font-bold transition-all text-left shadow-sm
                    ${formData.hiringPlan === opt 
                      ? 'border-orange-500 bg-orange-50 text-orange-800 scale-[1.02] ring-2 ring-orange-200' 
                      : 'border-gray-200 text-gray-700 hover:border-orange-200 bg-white'}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 bg-yellow-50/50 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-yellow-100">
            <label className="text-xs sm:text-sm font-black text-red-700 uppercase tracking-wide sm:tracking-widest flex flex-col gap-1 sm:gap-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="bg-red-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs mt-0.5">3</span>
                    <span className="leading-tight">How many headcounts do you plan to hire?</span>
                </div>
            </label>
            <div className="flex flex-col gap-1.5 sm:gap-2">
                {[
                    "1 - 5 people",
                    "6 - 10 people",
                    "11 - 30 people",
                    "31 - 100 people",
                    "100 people"
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({...formData, headcount: opt})}
                    className={`text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border-2 font-bold transition-all text-left shadow-sm
                      ${formData.headcount === opt 
                        ? 'border-yellow-600 bg-yellow-100 text-yellow-900 scale-[1.02] ring-2 ring-yellow-200' 
                        : 'border-gray-200 text-gray-700 hover:border-yellow-300 bg-white'}
                    `}
                  >
                    {opt}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <button
          disabled={!isComplete}
          onClick={() => onSubmit(formData)}
          className={`w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl md:text-2xl shadow-xl transform active:scale-[0.98] transition-all uppercase tracking-wide sm:tracking-widest border-b-2 sm:border-b-4
            ${isComplete 
              ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-900 text-white border-red-900 hover:brightness-110 cursor-pointer animate-pulse' 
              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed shadow-none'}
          `}
        >
          REVEAL REWARD <i className="fa-solid fa-bolt ml-1 sm:ml-2 text-yellow-300 text-sm sm:text-base"></i>
        </button>
      </div>
    </div>
  );
};

export default PreClaimModal;
