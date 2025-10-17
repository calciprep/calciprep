import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/common/context/AuthContext';
import Layout from './components/common/Layout';
import AuthModal from './components/common/AuthModal';
import Notification from './components/common/Notification';
import ProtectedRoute from './components/common/ProtectedRoute'; // Import the guard
import HomePage from './pages/HomePage';
import EnglishPage from './pages/EnglishPage';
import MathsPage from './pages/MathsPage';
import TypingSelectionPage from './pages/TypingSelectionPage';
import NotFoundPage from './pages/NotFoundPage';
import MathsGamePage from './pages/MathsGamePage'; 
import LearnTypingPage from './pages/LearnTypingPage';
import TypingTestPage from './pages/TypingTestPage';
import QuizListPage from './pages/QuizListPage';
import QuizPage from './pages/QuizPage';
import AccountPage from './pages/AccountPage';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<HomePage />} />
            <Route path="/english.html" element={<EnglishPage />} />
            <Route path="/maths.html" element={<MathsPage />} />
            <Route path="/typing-selection.html" element={<TypingSelectionPage />} />
            <Route path="/maths/game" element={<MathsGamePage />} />
            <Route path="/learn-typing.html" element={<LearnTypingPage />} />
            <Route path="/typing.html" element={<TypingTestPage />} />
            <Route path="/quiz-list.html" element={<QuizListPage />} />
            <Route path="/quiz.html" element={<QuizPage />} />
            
            {/* Wrap the AccountPage route with ProtectedRoute */}
            <Route 
              path="/account.html" 
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <AuthModal />
      <Notification />
    </AuthProvider>
  );
}

export default App;

