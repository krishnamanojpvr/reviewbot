import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';
import api from '../Hooks/interceptor';
import Loader from './Loader';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    navigate('/dashboard');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/login', {
        username,
        password
      });
      login(response.data.access_token, response.data.username);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl overflow-hidden w-full max-w-xl border border-gray-800">
        <div className="text-center py-8 px-10">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-indigo-200 text-lg mt-1">Sign in to your account</p>
        </div>

        <div className="border-t border-violet-700"></div>

        <div className="p-10">
          <form className="space-y-8" onSubmit={handleLogin}>
            <div>
              <label className="block text-fuchsia-200 text-base font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-700 bg-gray-900 text-fuchsia-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition text-lg"
                placeholder="Enter Username"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-fuchsia-200 text-base font-medium">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-700 bg-gray-900 text-fuchsia-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition text-lg"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-4 px-5 bg-gradient-to-r from-violet-900 via-gray-700 to-fuchsia-800 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-fuchsia-900/40 transition duration-300 text-lg disabled:opacity-50"
            >
              Sign In
            </button>
            
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-fuchsia-200">
              Don't have an account?
              <a
                href="/register"
                className="font-medium text-fuchsia-400 hover:text-fuchsia-200 ml-1"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
      <Loader isLoading={loading} />
    </div>
  );
};

export default Login;