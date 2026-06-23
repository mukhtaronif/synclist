import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { initiateSpotifyAuth, getStoredToken } from '../services/spotifyAuth';

const AuthScreen = () => {
  const navigate = useNavigate();
  const { selectedTracks, spotifyToken, setSpotifyToken } = useApp();

  useEffect(() => {
    if (!selectedTracks || selectedTracks.length === 0) {
      navigate('/');
      return;
    }

    // Check if we already have a valid token
    const token = getStoredToken();
    if (token) {
      setSpotifyToken(token);
      navigate('/converting');
    }
  }, [selectedTracks, navigate, spotifyToken, setSpotifyToken]);

  const handleConnectSpotify = async () => {
    try {
      await initiateSpotifyAuth();
    } catch (error) {
      console.error('Failed to initiate Spotify auth:', error);
      alert('Failed to connect to Spotify. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-green-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Connect to Spotify
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          To create your playlist on Spotify, you need to authorize this app to access your account.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Ready to convert:
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {selectedTracks?.length || 0} tracks
          </p>
        </div>

        <button
          onClick={handleConnectSpotify}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-full transition-colors inline-flex items-center gap-3"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Connect with Spotify
        </button>

        <button
          onClick={() => navigate('/preview')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Go back
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;
