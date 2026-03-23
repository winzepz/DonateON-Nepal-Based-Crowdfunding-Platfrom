import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Breadcrumbs from './components/Breadcrumbs';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Stories from './pages/Stories';
import Help from './pages/Help';
import StartFundraising from './pages/StartFundraising';
import CreateCampaign from './pages/CreateCampaign';
import CampaignList from './pages/CampaignList';
import CampaignDetails from './pages/CampaignDetails';
import PaymentSuccess from './pages/PaymentSuccess';
import Profile from './pages/Profile';
import KYCSubmission from './pages/KYCSubmission';
import AdminDashboard from './pages/AdminDashboard';
import KYCReview from './components/KYCReview';
import CampaignReview from './components/CampaignReview';
import PayoutReview from './components/PayoutReview';
import CreateStory from './pages/CreateStory';
import VerifyDonation from './pages/VerifyDonation';
import Badges from './pages/Badges';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import Donate from './pages/Donate';
import { AuthProvider } from './context/AuthContext';

import PageTransition from './components/PageTransition';
import CommandCenter from './components/CommandCenter';
import CommandBar from './components/CommandBar';

// Layout component to conditionally render Navbar
const Layout = ({ children, onSearchOpen }: { children: React.ReactNode, onSearchOpen: () => void }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);
  const showPageEnhancements = !['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] relative overflow-x-hidden">
      {/* Universal Background Enhancements */}
      {showPageEnhancements && (
        <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-80 -mt-80 pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -ml-80 -mb-80 pointer-events-none z-0" />
        </>
      )}

      {showNavbar && <Navbar />}
      
      <div className="flex-grow z-10 relative">
        {showPageEnhancements && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
            <Breadcrumbs />
          </div>
        )}
        {children}
      </div>
      <CommandBar onSearchOpen={onSearchOpen} />
      <Footer />
    </div>
  );
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                <Route path="/stories" element={<PageTransition><Stories /></PageTransition>} />
                <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
                <Route path="/campaigns" element={<PageTransition><CampaignList /></PageTransition>} />
                <Route path="/campaigns/:id" element={<PageTransition><CampaignDetails /></PageTransition>} />
                <Route path="/verify" element={<PageTransition><VerifyDonation /></PageTransition>} />
                <Route path="/donate" element={<PageTransition><Donate /></PageTransition>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
                <Route path="/kyc" element={<ProtectedRoute><PageTransition><KYCSubmission /></PageTransition></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
                <Route path="/admin/kyc/:id" element={<ProtectedRoute><PageTransition><KYCReview /></PageTransition></ProtectedRoute>} />
                <Route path="/admin/campaigns/:id" element={<ProtectedRoute><PageTransition><CampaignReview /></PageTransition></ProtectedRoute>} />
                <Route path="/admin/payouts/:id" element={<ProtectedRoute><PageTransition><PayoutReview /></PageTransition></ProtectedRoute>} />
                <Route path="/create-campaign" element={<ProtectedRoute><PageTransition><CreateCampaign /></PageTransition></ProtectedRoute>} />
                <Route path="/start-fundraising" element={<ProtectedRoute><PageTransition><StartFundraising /></PageTransition></ProtectedRoute>} />
                <Route path="/payment/success" element={<ProtectedRoute><PageTransition><PaymentSuccess /></PageTransition></ProtectedRoute>} />
                <Route path="/badges" element={<ProtectedRoute><PageTransition><Badges /></PageTransition></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><PageTransition><Support /></PageTransition></ProtectedRoute>} />
                <Route path="/create-story" element={<ProtectedRoute><PageTransition><CreateStory /></PageTransition></ProtectedRoute>} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global CMD+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Layout onSearchOpen={() => setIsSearchOpen(true)}>

          <CommandCenter isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <AnimatedRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
