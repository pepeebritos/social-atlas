import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors duration-200 ${
        checked ? 'bg-green-600' : 'bg-gray-400'
      } relative`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-0.5 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

