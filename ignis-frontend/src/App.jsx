import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import DonationDetail from './pages/DonationDetail';
import FundingCreate from './pages/FundingCreate';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<DonationDetail />} />
        <Route path="/test2" element={<FundingCreate />} />
        <Route path="/test3" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}
console.log(" App.jsx 실행됨");

export default App; 
