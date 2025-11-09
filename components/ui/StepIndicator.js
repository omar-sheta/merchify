// components/ui/StepIndicator.js
const Step = ({ number, label, isActive }) => (
  <div className="flex items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? 'bg-accent-orange text-white' : 'bg-bg-card-light text-text-secondary'}`}>
      {number}
    </div>
    <span className={`ml-3 font-semibold ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</span>
  </div>
);

const Separator = () => (
  <div className="flex-1 h-px bg-bg-card-light mx-4"></div>
);

export default function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        <Step number={1} label="Capture" isActive={currentStep === 1} />
        <Separator />
        <Step number={2} label="Customize" isActive={currentStep === 2} />
        <Separator />
        <Step number={3} label="Generate" isActive={currentStep === 3} />
      </div>
    </div>
  );
}
