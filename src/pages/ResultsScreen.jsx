import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { manualSearchTrack, createPlaylist, addTracksToPlaylist, getCurrentUser } from '../services/spotifyApi';

const ResultsScreen = () => {
  const navigate = useNavigate();
  const {
    matchedTracks,
    unmatchedTracks,
    setUnmatchedTracks,
    spotifyToken,
    setCreatedPlaylistUrl,
  } = useApp();

  const [playlistName, setPlaylistName] = useState('My Apple Music Playlist');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchingTrack, setSearchingTrack] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!matchedTracks && !unmatchedTracks) {
      navigate('/');
    }
  }, [matchedTracks, unmatchedTracks, navigate]);

  const handleManualSearch = async (track) => {
    setSearchingTrack(track);
    setSearchQuery(`${track.name} ${track.artist}`);
    setSearchResults([]);
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await manualSearchTrack(searchQuery, spotifyToken);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (spotifyTrack) => {
    // Add to matched tracks
    matchedTracks.push({
      original: searchingTrack,
      spotify: spotifyTrack,
    });

    // Remove from unmatched tracks
    setUnmatchedTracks(unmatchedTracks.filter(t => t.id !== searchingTrack.id));

    // Close search modal
    setSearchingTrack(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSkipTrack = () => {
    setSearchingTrack(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCreatePlaylist = async () => {
    if (matchedTracks.length === 0) {
      alert('No tracks to add to playlist.');
      return;
    }

    if (!playlistName.trim()) {
      alert('Please enter a playlist name.');
      return;
    }

    setIsCreating(true);

    try {
      const userId = await getCurrentUser(spotifyToken);
      const playlist = await createPlaylist(userId, playlistName, isPublic, spotifyToken);

      const trackUris = matchedTracks.map(t => t.spotify.uri);
      await addTracksToPlaylist(playlist.id, trackUris, spotifyToken);

      setCreatedPlaylistUrl(playlist.url);
      navigate('/done');
    } catch (error) {
      console.error('Playlist creation error:', error);
      alert(`Failed to create playlist: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Matching Results
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {matchedTracks?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Tracks Matched</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {unmatchedTracks?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Tracks Unmatched</div>
          </div>
        </div>

        {unmatchedTracks && unmatchedTracks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Unmatched Tracks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              These tracks couldn't be automatically matched. You can search for them manually.
            </p>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {unmatchedTracks.map((track) => (
                <div
                  key={track.id}
                  className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{track.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{track.artist}</div>
                  </div>
                  <button
                    onClick={() => handleManualSearch(track)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Playlist Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playlist Name
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter playlist name"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Make playlist public
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate('/converting')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            disabled={isCreating}
          >
            Back
          </button>
          <button
            onClick={handleCreatePlaylist}
            disabled={isCreating || matchedTracks.length === 0}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              `Create Playlist (${matchedTracks.length} tracks)`
            )}
          </button>
        </div>
      </div>

      {searchingTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Search for: {searchingTrack.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">by {searchingTrack.artist}</p>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Search Spotify..."
                  autoFocus
                />
                <button
                  onClick={performSearch}
                  disabled={isSearching}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                        onClick={() => handleSelectTrack(track)}
                      >
                        {track.image && (
                          <img
                            src={track.image}
                            alt={track.name}
                            className="w-12 h-12 rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 dark:text-white">{track.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {track.artist} • {track.album}
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg">
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {isSearching ? 'Searching...' : 'Enter a search query to find tracks'}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={handleSkipTrack}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Skip This Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;
