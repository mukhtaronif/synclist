# Apple Music to Spotify Playlist Converter

A web app that converts Apple Music playlists to Spotify playlists. Built with React, Tailwind CSS, and the Spotify Web API.

## Features

- Parse Apple Music playlist exports (.txt or .xml format)
- OAuth authentication with Spotify (PKCE flow, no backend required)
- Intelligent track matching with similarity scoring
- Manual search for unmatched tracks
- Create playlists directly on your Spotify account
- Fully client-side - no backend or database needed

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API**: Spotify Web API (OAuth PKCE flow)
- **File Parsing**: Native JavaScript (DOM Parser for XML, text parsing for .txt)

## Prerequisites

- Node.js 18+ and npm
- A Spotify account
- A Spotify Developer account (free)

## Setup Instructions

### 1. Register a Spotify Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the details:
   - **App name**: Apple Music to Spotify Converter (or any name you prefer)
   - **App description**: Convert Apple Music playlists to Spotify
   - **Redirect URI**: `http://localhost:5173/callback`
   - **APIs used**: Web API
5. Accept the terms and click "Save"
6. On the app page, click "Settings"
7. Copy your **Client ID** (you'll need this in the next step)

### 2. Clone and Configure

```bash
# Clone the repository (or extract if downloaded as ZIP)
cd Side-project

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Spotify Client ID
# VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

### Export from Apple Music

1. Open the Music app on your Mac
2. Select the playlist you want to export
3. Go to **File → Library → Export Playlist**
4. Choose either:
   - **Plain Text** (.txt) - recommended
   - **XML** (.xml) - iTunes library format

### Convert to Spotify

1. Open the app in your browser
2. **Upload** your exported playlist file (drag & drop or file picker)
3. **Preview** the parsed tracks and remove any you don't want
4. **Authenticate** with Spotify (you'll be redirected to Spotify's login)
5. **Wait** while tracks are matched on Spotify
6. **Review** results - manually search for any unmatched tracks if needed
7. **Create** your playlist with a custom name
8. **Done** - open your new playlist in Spotify

## Project Structure

```
src/
├── components/        # Reusable UI components (if needed)
├── context/          # React Context for state management
│   └── AppContext.jsx
├── pages/            # Screen components
│   ├── UploadScreen.jsx
│   ├── PreviewScreen.jsx
│   ├── AuthScreen.jsx
│   ├── CallbackScreen.jsx
│   ├── ConvertingScreen.jsx
│   ├── ResultsScreen.jsx
│   └── DoneScreen.jsx
├── services/         # API and parsing logic
│   ├── appleMusicParser.js
│   ├── spotifyAuth.js
│   └── spotifyApi.js
├── utils/            # Utility functions
│   └── trackNormalizer.js
├── App.jsx           # Main app with routing
└── main.jsx          # Entry point
```

## How It Works

### File Parsing

- **XML files**: Parsed using DOMParser, extracting `Name` and `Artist` from plist structure
- **TXT files**: Tab-separated format, header-based column detection
- Both formats are normalized to a common track object structure

### Track Matching

- Each track is searched on Spotify using the Web API
- Track names are normalized (removes "Remastered", "feat.", "Live", etc.)
- Similarity scoring using Levenshtein distance algorithm
- Confidence threshold of 0.8 (80%) for automatic matching
- Tracks below threshold are marked as "unmatched" for manual review

### Spotify Integration

- **PKCE OAuth flow** - No client secret needed, fully browser-based
- **Required scopes**: `playlist-modify-public`, `playlist-modify-private`, `user-read-private`
- **Rate limiting**: Automatic retry with exponential backoff
- **Batch operations**: Tracks added to playlist in batches of 100

### Error Handling

- File parsing errors with clear instructions
- Spotify API rate limiting with automatic retry
- Network error handling with user feedback
- Token expiration detection and re-authentication

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SPOTIFY_CLIENT_ID` | Your Spotify app's Client ID | Yes |

## Limitations

- Maximum 100 tracks per batch when adding to Spotify (handled automatically)
- Spotify API rate limits apply (429 responses trigger automatic retry)
- Some tracks may not be available on Spotify or may have different metadata
- Requires manual search for tracks that can't be automatically matched

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Since this is a client-side only app, you can deploy to:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect your git repo or drag & drop the `dist` folder
- **GitHub Pages**: Use `gh-pages` package

**Important**: When deploying, update the Redirect URI in your Spotify app settings to match your production URL (e.g., `https://yourdomain.com/callback`)

## Troubleshooting

### "No tracks found in file"
- Ensure you exported the correct format from Apple Music
- Try exporting as .txt instead of .xml or vice versa

### "Authorization failed"
- Check that your Client ID is correct in `.env`
- Ensure the redirect URI in Spotify app settings matches exactly: `http://localhost:5173/callback`

### "Rate limited" or slow matching
- This is normal - the app will automatically retry
- Large playlists (100+ tracks) may take several minutes

### Tracks not matching correctly
- Try using the manual search feature for specific tracks
- Some tracks may have different names on Spotify vs Apple Music

## License

MIT

## Contributing

Feel free to open issues or submit pull requests for improvements.

## Credits

Built with React, Vite, Tailwind CSS, and the Spotify Web API.
