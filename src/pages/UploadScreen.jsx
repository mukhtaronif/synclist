import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseAppleMusicFile } from '../services/appleMusicParser';

const UploadScreen = () => {
  const navigate = useNavigate();
  const { setParsedTracks, resetApp } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const tracks = await parseAppleMusicFile(file);
      setParsedTracks(tracks);
      navigate('/preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleStartOver = () => {
    resetApp();
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Upload Your Apple Music Playlist
        </h2>

        <div className="mb-6 text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p className="font-medium">How to export from Apple Music:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open the Music app on your Mac</li>
            <li>Select the playlist you want to export</li>
            <li>Go to File → Library → Export Playlist</li>
            <li>Save as .txt or .xml format</li>
            <li>Upload the file below</li>
          </ol>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isProcessing ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Processing file...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".txt,.xml"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer inline-block transition-colors">
                  Choose File
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Supports .txt and .xml files
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">Error:</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={handleStartOver}
              className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadScreen;
