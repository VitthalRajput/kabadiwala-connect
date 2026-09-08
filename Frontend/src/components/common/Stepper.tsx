import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  number: number;
  title: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-center w-full py-4">
      <div className="flex items-center space-x-3 sm:space-x-8">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <React.Fragment key={step.number}>
              <div
                onClick={() => onStepClick && isCompleted && onStepClick(step.number)}
                className={`flex items-center space-x-2.5 ${
                  isCompleted && onStepClick ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-saffron-500 text-white ring-4 ring-saffron-100 shadow-sm'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'text-gray-900 font-bold'
                      : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-12 h-0.5 transition-colors ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

