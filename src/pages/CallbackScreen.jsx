import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { handleSpotifyCallback } from '../services/spotifyAuth';

const CallbackScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSpotifyToken } = useApp();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authorization was denied. Please try again.');
        return;
      }

      if (!code) {
        setError('No authorization code received.');
        return;
      }

      try {
        const token = await handleSpotifyCallback(code);
        setSpotifyToken(token);
        navigate('/converting');
      } catch (err) {
        console.error('Callback error:', err);
        setError(err.message || 'Failed to complete authorization.');
      }
    };

    processCallback();
  }, [searchParams, navigate, setSpotifyToken]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Authorization Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Connecting to Spotify...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while we complete the authorization.
        </p>
      </div>
    </div>
  );
};

export default CallbackScreen;
