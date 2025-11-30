import React from 'react';

interface StepCardProps {
  stepNumber: number;
  title: string;
  image?: string;
  isActive: boolean;
  isCompleted: boolean;
  rotationClass: string;
  onClick: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ 
  stepNumber, 
  title, 
  image, 
  isActive, 
  isCompleted, 
  rotationClass,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative w-28 h-40 md:w-40 md:h-56 rounded-2xl shadow-xl transition-all duration-300 ease-out cursor-pointer
        ${rotationClass}
        ${isActive ? 'z-20 scale-110 ring-4 ring-accent' : 'z-10 opacity-70 hover:opacity-100 hover:scale-105 hover:z-30'}
        bg-white overflow-hidden
      `}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-4xl font-light">{stepNumber}</span>
          <span className="text-xs mt-2 uppercase tracking-wider">{title}</span>
        </div>
      )}
      
      {/* Label Badge */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-6">
        <p className="text-white text-xs md:text-sm font-medium text-center">{title}</p>
      </div>

      {/* Checkmark for completion */}
      {isCompleted && !isActive && (
        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};
