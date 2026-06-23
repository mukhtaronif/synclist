import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchTrack } from '../services/spotifyApi';

const ConvertingScreen = () => {
  const navigate = useNavigate();
  const {
    selectedTracks,
    spotifyToken,
    setMatchedTracks,
    setUnmatchedTracks,
    conversionProgress,
    setConversionProgress,
  } = useApp();

  useEffect(() => {
    if (!selectedTracks || selectedTracks.length === 0) {
      navigate('/');
      return;
    }

    if (!spotifyToken) {
      navigate('/auth');
      return;
    }

    const convertTracks = async () => {
      const matched = [];
      const unmatched = [];

      setConversionProgress({ current: 0, total: selectedTracks.length });

      for (let i = 0; i < selectedTracks.length; i++) {
        const track = selectedTracks[i];

        try {
          const result = await searchTrack(track.name, track.artist, spotifyToken);

          if (result) {
            matched.push({
              original: track,
              spotify: result,
            });
          } else {
            unmatched.push(track);
          }
        } catch (error) {
          console.error(`Error matching track ${track.name}:`, error);
          unmatched.push(track);
        }

        setConversionProgress({ current: i + 1, total: selectedTracks.length });
      }

      setMatchedTracks(matched);
      setUnmatchedTracks(unmatched);
      navigate('/results');
    };

    convertTracks();
  }, [selectedTracks, spotifyToken, navigate, setMatchedTracks, setUnmatchedTracks, setConversionProgress]);

  const percentage = conversionProgress.total > 0
    ? Math.round((conversionProgress.current / conversionProgress.total) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8 text-center">
          Matching Your Tracks
        </h2>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Progress</span>
            <span>{conversionProgress.current} / {conversionProgress.total}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-2xl font-bold text-gray-800 dark:text-white">
            {percentage}%
          </div>
        </div>

        <div className="text-center">
          <div className="animate-pulse space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Searching Spotify for your tracks...</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This may take a few moments. We're carefully matching each track to find the best results on Spotify.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConvertingScreen;
