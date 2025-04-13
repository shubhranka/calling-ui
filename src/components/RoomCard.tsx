import React from 'react';
import { Users } from 'lucide-react'; // Icon for participant count

interface RoomCardProps {
  title: string;
  host: string;
  participants: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ title, host, participants }) => {
  return (
    <div
      className="
        bg-gray-800 border-3 border-manga-black p-4 mb-4
        transform -rotate-3 hover:rotate-0 hover:scale-105
        transition-transform duration-300 ease-out
        cursor-pointer group relative overflow-hidden
        hover:border-neon-cyan hover:shadow-neon-cyan
      "
      style={{ borderImage: 'linear-gradient(to right, #1a1a1a, #1a1a1a) 1', borderWidth: '3px' }} // Ensure solid border initially
    >
       <div className="absolute inset-0 border-3 border-transparent group-hover:border-neon-cyan transition-colors duration-300"></div> {/* Neon outline on hover */}
       <div className="relative z-10"> {/* Content above outline */}
        <h3 className="font-manga font-black text-xl text-manga-white mb-1 truncate">{title}</h3>
        <p className="text-sm text-gray-400 mb-2">Host: {host}</p>
        <div className="flex items-center">
          <Users size={16} className="text-neon-lime mr-1" />
          <span className="text-neon-lime font-bold text-sm">{participants}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
