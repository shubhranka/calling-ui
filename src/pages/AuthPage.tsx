import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  isLogin?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ isLogin = true }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isConnected } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError('Cannot connect to server. Please try again later.');
      return;
    }
    setError('');
    setLoading(true);

    if (isLogin) {
      login(email, password, (result) => {
        setLoading(false);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Invalid email or password');
        }
      });
    } else {
      register(username, email, password, (result) => {
        setLoading(false);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Email already exists');
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-speed-lines p-4">
      <div
        className="
          bg-manga-white text-manga-black p-8 md:p-12 rounded-lg border-4 border-manga-black
          w-full max-w-md relative
          transform -rotate-2 shadow-lg
        "
      >
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/10 to-transparent opacity-30 -z-10"></div>
        <h2 className="font-manga font-black text-3xl text-center mb-8">
          {isLogin ? 'Log In' : 'Register'}
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-bold mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 bg-transparent border-b-2 border-manga-black focus:border-neon-cyan outline-none transition-colors duration-300"
                disabled={loading || !isConnected}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-transparent border-b-2 border-manga-black focus:border-neon-cyan outline-none transition-colors duration-300"
              disabled={loading || !isConnected}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              required
              className="w-full px-3 py-2 bg-transparent border-b-2 border-manga-black focus:border-neon-cyan outline-none transition-colors duration-300"
              disabled={loading || !isConnected}
            />
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {!isConnected && (
            <p className="text-yellow-400 text-sm text-center">Connecting to server...</p>
          )}
          <button
            type="submit"
            className="speech-bubble-button w-full mt-4 !bg-neon-lime disabled:opacity-50"
            disabled={loading || !isConnected}
          >
            {loading ? 'Processing...' : 'Go!'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <a
            href={isLogin ? '/register' : '/login'}
            className="text-neon-cyan font-bold ml-1 hover:underline"
          >
            {isLogin ? 'Register' : 'Log In'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;