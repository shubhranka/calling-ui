import React from 'react';

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'cyan' | 'magenta' | 'lime';
  isActive?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'lime',
  isActive = false,
}) => {
  const variantClasses = {
    cyan: 'speech-bubble-button-cyan',
    magenta: 'speech-bubble-button-magenta',
    lime: '',
  };

  const [clicked, setClicked] = React.useState(false);

  const handleClick = () => {
    setClicked(true);
    onClick?.();
    setTimeout(() => setClicked(false), 300); // Reset animation
  };

  return (
    <button
      onClick={handleClick}
      className={`
        speech-bubble-button ${variantClasses[variant]}
        flex flex-col items-center justify-center p-3 m-2
        group hover:animate-flash active:scale-95 transition-transform
        ${isActive ? 'ring-2 ring-offset-2 ring-offset-manga-black ring-white' : ''}
        ${clicked ? 'animate-bubble-pop' : ''}
      `}
      aria-label={label}
    >
      <div className="mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-xs font-bold uppercase">{label}</span>
    </button>
  );
};

export default ControlButton;