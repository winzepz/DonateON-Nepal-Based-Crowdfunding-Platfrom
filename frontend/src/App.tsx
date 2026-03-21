import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
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
import CreateStory from './pages/CreateStory';
import VerifyDonation from './pages/VerifyDonation';
import Badges from './pages/Badges';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import Donate from './pages/Donate';
import { AuthProvider } from './context/AuthContext';

// Layout component to conditionally render Navbar
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/help" element={<Help />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/verify" element={<VerifyDonation />} />
            <Route path="/donate" element={<Donate />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/kyc" element={<ProtectedRoute><KYCSubmission /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/create-campaign" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
            <Route path="/start-fundraising" element={<ProtectedRoute><StartFundraising /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/create-story" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
