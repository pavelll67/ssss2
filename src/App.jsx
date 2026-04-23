import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SaveNotificationProvider } from './contexts/SaveNotificationContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { MyPosters } from './pages/MyPosters';
import { Profile } from './pages/Profile';
import { Checkout } from './pages/Checkout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SaveNotificationProvider>
        <Router>
          <div className="h-screen bg-background flex flex-col overflow-hidden">
            <div className="max-w-5xl w-full mx-auto flex flex-col flex-1 overflow-hidden">
            <Navigation />
              <main className="flex-1 overflow-y-auto scrollbar-hide">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/my-posters" element={<MyPosters />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
              </Routes>
            </main>
            </div>
          </div>
        </Router>
        </SaveNotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App
