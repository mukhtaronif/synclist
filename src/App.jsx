import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import UploadScreen from './pages/UploadScreen';
import PreviewScreen from './pages/PreviewScreen';
import AuthScreen from './pages/AuthScreen';
import ConvertingScreen from './pages/ConvertingScreen';
import ResultsScreen from './pages/ResultsScreen';
import DoneScreen from './pages/DoneScreen';
import CallbackScreen from './pages/CallbackScreen';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Apple Music → Spotify
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Convert your Apple Music playlists to Spotify
              </p>
            </header>

            <Routes>
              <Route path="/" element={<UploadScreen />} />
              <Route path="/preview" element={<PreviewScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/converting" element={<ConvertingScreen />} />
              <Route path="/results" element={<ResultsScreen />} />
              <Route path="/done" element={<DoneScreen />} />
              <Route path="/callback" element={<CallbackScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
