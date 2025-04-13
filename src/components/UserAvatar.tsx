import React from 'react';
import { Star } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  status: 'speaking' | 'muted' | 'listening';
  isHost?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, imageUrl, status, isHost = false }) => {
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const statusClasses = {
    speaking: 'ring-neon-cyan shadow-neon-cyan animate-pulse',
    muted: 'ring-red-600',
    listening: 'ring-gray-600',
  };

  const [impact, setImpact] = React.useState(false);

  React.useEffect(() => {
    if (status === 'speaking') {
      setImpact(true);
      const timer = setTimeout(() => setImpact(false), 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="relative inline-block">
      <div
        className={`
          w-16 h-16 rounded-full border-4 border-manga-black bg-gray-700
          flex items-center justify-center overflow-hidden
          ring-4 ${statusClasses[status]} transition-all duration-300 ease-in-out
          ${status === 'speaking' ? 'scale-105' : ''}
          ${isHost ? 'animate-pulse-glow' : ''}
        `}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-manga font-black text-3xl text-neon-cyan">
            {getInitials(name)}
          </span>
        )}
        {status === 'speaking' && (
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-neon-cyan/30 to-transparent animate-ping opacity-50 duration-1000"></div>
        )}
        {impact && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHBhdGggZD0iTTE2IDMyTDMyIDQ4TDQ4IDMyTDMyIDE2WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBGRkZGIiBzdHJva2Utd2lkdGg9IjQiIGNsYXNzPSJhbmltYXRlLWltcGFjdCIvPjwvc3ZnPg==')] bg-no-repeat bg-center"></div>
          </div>
        )}
      </div>
      {isHost && (
        <div className="absolute -top-1 -right-1 bg-neon-magenta text-manga-black p-1 rounded-full border-2 border-manga-black shadow-neon-magenta">
          <Star size={14} fill="currentColor" strokeWidth={0} />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;