import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const PreviewScreen = () => {
  const navigate = useNavigate();
  const { parsedTracks, setSelectedTracks } = useApp();
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    if (!parsedTracks || parsedTracks.length === 0) {
      navigate('/');
      return;
    }
    setTracks(parsedTracks.map(t => ({ ...t, selected: true })));
  }, [parsedTracks, navigate]);

  const toggleTrack = (trackId) => {
    setTracks(tracks.map(t =>
      t.id === trackId ? { ...t, selected: !t.selected } : t
    ));
  };

  const toggleAll = () => {
    const allSelected = tracks.every(t => t.selected);
    setTracks(tracks.map(t => ({ ...t, selected: !allSelected })));
  };

  const handleContinue = () => {
    const selected = tracks.filter(t => t.selected);
    if (selected.length === 0) {
      alert('Please select at least one track to continue.');
      return;
    }
    setSelectedTracks(selected);
    navigate('/auth');
  };

  const selectedCount = tracks.filter(t => t.selected).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Preview Your Tracks
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Found {parsedTracks.length} tracks. Uncheck any you don't want to include.
        </p>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleAll}
            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
          >
            {tracks.every(t => t.selected) ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCount} selected
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={tracks.length > 0 && tracks.every(t => t.selected)}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Artist
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tracks.map((track) => (
                <tr
                  key={track.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    !track.selected ? 'opacity-50' : ''
                  }`}
                  onClick={() => toggleTrack(track.id)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={track.selected}
                      onChange={() => toggleTrack(track.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {track.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {track.artist}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedCount === 0}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue ({selectedCount} tracks)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewScreen;
