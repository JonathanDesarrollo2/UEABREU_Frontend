import { useState } from "react";
import type { ReactNode } from "react";
import { Transition } from '@headlessui/react';
import {
  FaChevronDown,  // Flecha hacia abajo 
  FaChevronUp,    // Flecha hacia arriba
} from 'react-icons/fa';
interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultIsOpen?: boolean;
}
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultIsOpen = true }) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultIsOpen);
  return (
    <div className="col-span-1">
      <div
        className="flex justify-between items-center text-2xl text-left font-bold text-gray-800 mb-2 p-2 cursor-pointer hover:bg-blue-200/50 rounded-md transition-colors bg-blue-100/50 backdrop-blur-sm border border-white/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <div className="w-7 h-7 flex items-center justify-center rounded-full text-white">
          <span className="text-lg leading-none">
            {isOpen ? (
             <FaChevronUp className="text-gray-500" />
            ) : (
             <FaChevronDown className="text-gray-500" />
            )}
          </span>
        </div>
      </div>
      <Transition
        show={isOpen}
        enter="transition-opacity duration-300 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {children}
      </Transition>
    </div> 
  );
};