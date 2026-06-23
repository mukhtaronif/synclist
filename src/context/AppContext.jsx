import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [parsedTracks, setParsedTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [matchedTracks, setMatchedTracks] = useState([]);
  const [unmatchedTracks, setUnmatchedTracks] = useState([]);
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState({ current: 0, total: 0 });

  const resetApp = () => {
    setParsedTracks([]);
    setSelectedTracks([]);
    setMatchedTracks([]);
    setUnmatchedTracks([]);
    setCreatedPlaylistUrl(null);
    setIsConverting(false);
    setConversionProgress({ current: 0, total: 0 });
  };

  const value = {
    parsedTracks,
    setParsedTracks,
    selectedTracks,
    setSelectedTracks,
    spotifyToken,
    setSpotifyToken,
    matchedTracks,
    setMatchedTracks,
    unmatchedTracks,
    setUnmatchedTracks,
    createdPlaylistUrl,
    setCreatedPlaylistUrl,
    isConverting,
    setIsConverting,
    conversionProgress,
    setConversionProgress,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
