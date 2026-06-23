// Spotify Web API service with rate limiting and retry logic

import { normalizeTrackName, normalizeArtistName, calculateSimilarity } from '../utils/trackNormalizer';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SIMILARITY_THRESHOLD = 0.8;

// Make an API request with retry logic and exponential backoff
const apiRequest = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
        const waitTime = retryAfter * 1000;
        console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
        await sleep(waitTime);
        continue;
      }

      // Handle other errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If it's the last retry, throw the error
      if (i === retries - 1) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      console.log(`Request failed. Retrying in ${waitTime}ms... (${i + 1}/${retries})`);
      await sleep(waitTime);
    }
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Search for a track on Spotify
export const searchTrack = async (trackName, artistName, token) => {
  const query = `track:${trackName} artist:${artistName}`;
  const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

  const data = await apiRequest(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const tracks = data.tracks?.items || [];

  if (tracks.length === 0) {
    return null;
  }

  // Normalize the search query
  const normalizedSearchName = normalizeTrackName(trackName);
  const normalizedSearchArtist = normalizeArtistName(artistName);

  // Find the best match based on similarity
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const track of tracks) {
    const normalizedResultName = normalizeTrackName(track.name);
    const normalizedResultArtist = normalizeArtistName(track.artists[0]?.name || '');

    const nameSimilarity = calculateSimilarity(normalizedSearchName, normalizedResultName);
    const artistSimilarity = calculateSimilarity(normalizedSearchArtist, normalizedResultArtist);

    // Weighted average (name is more important)
    const overallSimilarity = nameSimilarity * 0.7 + artistSimilarity * 0.3;

    if (overallSimilarity > bestSimilarity) {
      bestSimilarity = overallSimilarity;
      bestMatch = track;
    }
  }

  // Return match if confidence is high enough
  if (bestMatch && bestSimilarity >= SIMILARITY_THRESHOLD) {
    return {
      id: bestMatch.id,
      uri: bestMatch.uri,
      name: bestMatch.name,
      artist: bestMatch.artists[0]?.name || 'Unknown Artist',
      album: bestMatch.album?.name,
      confidence: bestSimilarity,
    };
  }

  return null;
};

// Search for tracks manually (for unmatched tracks)
export const manualSearchTrack = async (query, token) => {
  const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

  const data = await apiRequest(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const tracks = data.tracks?.items || [];

  return tracks.map(track => ({
    id: track.id,
    uri: track.uri,
    name: track.name,
    artist: track.artists[0]?.name || 'Unknown Artist',
    album: track.album?.name,
    image: track.album?.images[0]?.url,
  }));
};

// Get current user's Spotify ID
export const getCurrentUser = async (token) => {
  const url = `${SPOTIFY_API_BASE}/me`;

  const data = await apiRequest(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.id;
};

// Create a new playlist
export const createPlaylist = async (userId, playlistName, isPublic, token) => {
  const url = `${SPOTIFY_API_BASE}/users/${userId}/playlists`;

  const data = await apiRequest(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      public: isPublic,
      description: 'Converted from Apple Music using Apple Music to Spotify Converter',
    }),
  });

  return {
    id: data.id,
    url: data.external_urls.spotify,
  };
};

// Add tracks to a playlist (in batches of 100, which is Spotify's limit)
export const addTracksToPlaylist = async (playlistId, trackUris, token) => {
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < trackUris.length; i += batchSize) {
    batches.push(trackUris.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const url = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`;

    await apiRequest(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: batch,
      }),
    });
  }
};
