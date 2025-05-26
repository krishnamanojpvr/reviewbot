import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Hooks/interceptor';
import Loader from '../Components/Loader';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/register', {
        username,
        password
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response?.data?.detail === '409: Username already exists') {
        setError('This Username is already registered');
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="text-center mt-5">
            <h2 className="text-4xl font-extrabold text-white">Create Account</h2>
            <p className="text-indigo-200 text-lg">Join our platform today</p>
          </div>

          <div className="border-t border-violet-700 my-6"></div>

          <div className="p-10 flex-1">
            {success && (
              <div className="mb-6 bg-green-900/30 border border-green-700 rounded-lg p-4">
                <p className="text-green-300">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-fuchsia-200 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-fuchsia-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition"
                  placeholder="Enter Username"
                  required
                />
              </div>

              <div>
                <label className="block text-fuchsia-200 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-fuchsia-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
              </div>

              <div>
                <label className="block text-fuchsia-200 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-fuchsia-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username || !password || !confirmPassword}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold rounded-lg shadow-md hover:shadow-fuchsia-900/40 transition duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-fuchsia-200">
                Already have an account?
                <a
                  href="/login"
                  className="font-medium text-fuchsia-400 hover:text-fuchsia-200 ml-1"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Loader isLoading={loading} />
    </div>
  );
};

export default Register;