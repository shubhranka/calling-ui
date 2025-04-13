// File: ./src/pages/HomePage.tsx
import React, { useState } from 'react';
import RoomCard from '../components/RoomCard';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { rooms, createRoom, currentUser, isConnected } = useAppContext();
  const navigate = useNavigate();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setIsCreatingRoom(true);
    setShowModal(false); // close modal
    createRoom(roomName, true, (roomId) => {
      setIsCreatingRoom(false);
      if (roomId) {
        navigate(`/room/${roomId}`);
      } else {
        alert('Failed to create room. Please try again.');
      }
    });
  };

  const handleCreateRoom = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!isConnected) {
      alert('Not connected to server. Please try again later.');
      return;
    }
    setRoomName('');
    setShowModal(true);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!isConnected) {
      alert('Not connected to server. Please try again later.');
      return;
    }
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-layout">
      <aside className="bg-manga-black border-r-4 border-neon-cyan p-4 overflow-y-auto">
        <h2 className="font-manga font-black text-2xl text-neon-cyan mb-6 border-b-2 border-neon-cyan pb-2">
          Chapters (Rooms)
        </h2>
        {!isConnected && (
          <p className="text-yellow-400 text-sm mb-4">Connecting to server...</p>
        )}
        <div className="space-y-4 pr-2">
          {rooms.length === 0 && isConnected ? (
            <p className="text-gray-400">No rooms available. Create one!</p>
          ) : (
            rooms.map((room) => (
              <div onClick={() => handleJoinRoom(room.id)} key={room.id}>
                <RoomCard
                  title={room.title}
                  host={
                    room.hostId === currentUser?.id
                      ? currentUser.username
                      : `User_${room.hostId.slice(0, 4)}`
                  }
                  participants={room.participants.length}
                />
              </div>
            ))
          )}
        </div>
        <button
          onClick={handleCreateRoom}
          className="speech-bubble-button w-full mt-6 flex items-center justify-center disabled:opacity-50"
          disabled={!isConnected || isCreatingRoom}
        >
          <Plus size={20} className="mr-2" />
          {isCreatingRoom ? 'Creating...' : 'Create Room'}
        </button>
      </aside>
      <main className="bg-gray-900 bg-cityscape bg-cover bg-center flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1
            className="font-manga font-black text-6xl md:text-8xl text-manga-white mb-4"
            style={{ textShadow: '3px 3px 0px #00FFFF' }}
          >
            Join the Convo
          </h1>
          <p className="text-xl text-gray-300 max-w-lg mx-auto">
            Dive into dynamic voice rooms inspired by the world of manga. Connect, chat, and create.
          </p>
          {currentUser ? (
            <p className="mt-4 text-neon-cyan">Welcome, {currentUser.username}!</p>
          ) : (
            <a href="/login" className="mt-4 text-neon-cyan underline">
              Log in to start
            </a>
          )}
        </div>
      </main>

      { /* Modal for entering room name */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal backdrop */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal container */}
          <div className="bg-manga-white text-manga-black p-8 md:p-12 rounded-lg border-4 border-manga-black relative transform -rotate-2 shadow-lg z-10">
            <h2 className="font-manga font-black text-3xl text-center mb-6">
              Enter Room Name
            </h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Room Name"
                  className="w-full px-3 py-2 bg-transparent border-b-2 border-manga-black focus:border-neon-cyan outline-none transition-colors duration-300"
                  autoFocus
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="speech-bubble-button !bg-neon-magenta w-1/2 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="speech-bubble-button !bg-neon-lime w-1/2 ml-2"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;