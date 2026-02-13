import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ReviewProvider } from './contexts/ReviewContext'
import Header from './components/Header'
import DecisionReview from './pages/DecisionReview'
import AdminPanel from './pages/AdminPanel'
import SettingsPage from './pages/SettingsPage'
import { DecisionLibraryPage, DecisionDetailPage } from './features/decisions'
import { AnalyticsPage } from './features/analytics'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ReviewProvider>
          <div className="h-screen flex flex-col overflow-hidden font-sans">
            <Header />
            <Routes>
              <Route path="/" element={<DecisionReview />} />
              <Route path="/decisions" element={<DecisionLibraryPage />} />
              <Route path="/decisions/:id" element={<DecisionDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </ReviewProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
