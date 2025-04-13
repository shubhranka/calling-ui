import React, { useEffect, useRef, useState } from 'react';
import UserAvatar from '../components/UserAvatar';
import ControlButton from '../components/ControlButton';
import { Mic, MicOff, PhoneOff, UserMinus, UserPlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';

const LiveRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser, rooms, socket, toggleMute, promoteToSpeaker, kickUser, leaveRoom, isConnected } = useAppContext();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<{ [key: string]: RTCPeerConnection }>({});

  useEffect(() => {
    if (!socket || !roomId || !isConnected || !currentUser) {
      console.log('Cannot initialize room: Missing socket, roomId, connection, or user');
      return;
    }
    
    console.log('Initializing LiveRoomPage for roomId:', roomId);

    // Set initial room from rooms array if available
    const initialRoom = rooms.find((r) => r.id === roomId);
    if (initialRoom) {
      console.log('Found room in initial rooms:', initialRoom);
      setRoom(initialRoom);
    }

    // Join room if not already joined
    const joinIfNeeded = () => {
      const currentRoom = rooms.find((r) => r.id === roomId);
      if (!currentRoom || !currentRoom.participants.some((p: any) => p.userId === currentUser.id)) {
        console.log('Joining room:', roomId);
        socket.emit('joinRoom', roomId, (success: boolean) => {
          if (success) {
            console.log('Successfully joined room:', roomId);
          } else {
            console.log('Failed to join room:', roomId);
            navigate('/'); // Redirect if join fails
          }
        });
      } else {
        console.log('Already in room:', roomId);
      }
    };

    joinIfNeeded();

    // Create individual callback functions for events
    const handleRoomUpdated = (updatedRoom: any) => {
      console.log('Received roomUpdated:', updatedRoom);
      if (updatedRoom.id === roomId) {
        setRoom(updatedRoom);
      }
    };

    const handleRoomsUpdated = (updatedRooms: any[]) => {
      console.log('Received roomsUpdated:', updatedRooms);
      const updatedRoom = updatedRooms.find((r) => r.id === roomId);
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
    };

    const handleOffer = async ({ offer, from }: any) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer, to: from });
    };

    const handleAnswer = async ({ answer, from }: any) => {
      const pc = peers.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async ({ candidate, from }: any) => {
      const pc = peers.current[from];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    // Register event listeners specific to this component
    socket.on('roomUpdated', handleRoomUpdated);
    socket.on('roomsUpdated', handleRoomsUpdated);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    const initWebRTC = async () => {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const roomData = rooms.find((r) => r.id === roomId);
        if (!roomData) return;

        roomData.participants.forEach((p: any) => {
          if (p.userId !== currentUser.id && p.isSpeaker) createPeerConnection(p.userId);
        });
      } catch (err) {
        console.error('WebRTC init error:', err);
      }
    };

    initWebRTC();

    function createPeerConnection(userId: string) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peers.current[userId] = pc;

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current!));
      }

      pc.ontrack = (event) => {
        const audio = document.createElement('audio');
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        document.body.appendChild(audio);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket!.emit('ice-candidate', { roomId, candidate: event.candidate });
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => socket!.emit('offer', { roomId, offer: pc.localDescription }));

      return pc;
    }

    return () => {
      console.log('Cleaning up LiveRoomPage...');
      // Remove only the listeners that this component added.
      socket.off('roomUpdated', handleRoomUpdated);
      socket.off('roomsUpdated', handleRoomsUpdated);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peers.current).forEach((pc) => pc.close());
    };
  }, [socket, roomId, currentUser, rooms, isConnected, navigate]);

  if (!currentUser || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        {isConnected ? 'Loading room...' : 'Not connected to server. Please refresh.'}
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Room not found or still loading...
      </div>
    );
  }

  const isHost = room.hostId === currentUser.id;
  const currentParticipant = room.participants.find((p: any) => p.userId === currentUser.id);

  const handleLeave = () => {
    leaveRoom(room.id);
    navigate('/');
  };

  const handleToggleMute = () => {
    toggleMute(room.id, currentUser.id);
    if (localStream.current) {
      localStream.current.getAudioTracks()[0].enabled = !currentParticipant?.isMuted;
    }
  };

  const handleKick = (userId: string) => {
    if (isHost) kickUser(room.id, userId);
  };

  const handlePromote = (userId: string) => {
    if (isHost) promoteToSpeaker(room.id, userId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 bg-screentone">
      <header
        className="bg-manga-black p-3 text-manga-white relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)' }}
      >
        <div className="absolute bottom-0 left-0 h-1 w-full bg-neon-magenta"></div>
        <h1 className="font-manga font-black text-2xl">{room.title}</h1>
        <p className="text-sm text-gray-400">
          Hosted by {room.hostId === currentUser.id ? 'You' : `User_${room.hostId.slice(0, 4)}`}
        </p>
      </header>
      <main className="flex-grow p-4 md:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 place-items-center overflow-y-auto">
        {room.participants.map((p: any) => (
          <div key={p.userId} className="relative">
            <UserAvatar
              name={p.userId === currentUser.id ? currentUser.username : `User_${p.userId.slice(0, 4)}`}
              status={
                p.isSpeaker && !p.isMuted ? 'speaking' : p.isMuted ? 'muted' : 'listening'
              }
              isHost={p.userId === room.hostId}
            />
            {isHost && p.userId !== currentUser.id && !p.isSpeaker && (
              <ControlButton
                icon={<UserPlus size={16} />}
                label="Promote"
                variant="cyan"
                onClick={() => handlePromote(p.userId)}
              />
            )}
          </div>
        ))}
      </main>
      <footer className="bg-manga-black p-3 border-t-4 border-manga-black flex justify-center items-center flex-wrap">
        <ControlButton
          icon={currentParticipant?.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          label={currentParticipant?.isMuted ? 'Unmute' : 'Mute'}
          onClick={handleToggleMute}
          variant={currentParticipant?.isMuted ? 'magenta' : 'lime'}
          isActive={currentParticipant?.isMuted}
        />
        {isHost && (
          <ControlButton
            icon={<UserMinus size={24} />}
            label="Kick"
            variant="magenta"
            onClick={() =>
              handleKick(
                room.participants.find((p: any) => p.userId !== currentUser.id)?.userId || ''
              )
            }
          />
        )}
        <ControlButton
          icon={<PhoneOff size={24} />}
          label="Leave"
          variant="cyan"
          onClick={handleLeave}
        />
      </footer>
    </div>
  );
};

export default LiveRoomPage;