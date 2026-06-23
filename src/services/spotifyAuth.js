// Spotify PKCE OAuth flow implementation

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/callback';
const SCOPES = ['playlist-modify-public', 'playlist-modify-private', 'user-read-private'];

// Generate a random code verifier for PKCE
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
};

// Generate code challenge from verifier
const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
};

// Base64 URL encode
const base64URLEncode = (buffer) => {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Start the Spotify authorization flow
export const initiateSpotifyAuth = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store the verifier in sessionStorage (needed for token exchange)
  sessionStorage.setItem('spotify_code_verifier', codeVerifier);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  // Redirect to Spotify authorization page
  window.location.href = authUrl;
};

// Handle the OAuth callback and exchange code for token
export const handleSpotifyCallback = async (code) => {
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');

  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please try authorizing again.');
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange authorization code');
  }

  const data = await response.json();

  // Store token and expiry
  const tokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  sessionStorage.setItem('spotify_token', JSON.stringify(tokenData));
  sessionStorage.removeItem('spotify_code_verifier');

  return tokenData.access_token;
};

// Get stored token if valid, otherwise return null
export const getStoredToken = () => {
  const stored = sessionStorage.getItem('spotify_token');

  if (!stored) return null;

  const tokenData = JSON.parse(stored);

  // Check if token is expired
  if (Date.now() >= tokenData.expires_at) {
    sessionStorage.removeItem('spotify_token');
    return null;
  }

  return tokenData.access_token;
};

// Clear stored token
export const clearToken = () => {
  sessionStorage.removeItem('spotify_token');
  sessionStorage.removeItem('spotify_code_verifier');
};
