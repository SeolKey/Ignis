import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import DonationDetail from './pages/DonationDetail';
import DonationCreate from './pages/DonationCreate';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donation-detail" element={<DonationDetail />} />  {/* 기부 상세 페이지 경로 수정 */}
        <Route path="/donation-create" element={<DonationCreate />} />   {/* 기부 생성 페이지 경로 수정 */}
        <Route path="/payment" element={<PaymentPage />} />            {/* 결제 페이지 경로 수정 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/donation/:id" element={<DonationDetail />} />
      </Routes>
    </Router>
  );
}
console.log(" App.jsx 실행됨");

export default App; 
