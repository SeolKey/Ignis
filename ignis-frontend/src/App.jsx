import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DonationDetail from './pages/DonationDetail';
import DonationCreate from './pages/DonationCreate';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DonationList from './pages/DonationList';  
import MyPage from './pages/MyPage';
import BoardFree from './pages/BoardFree';
import NoticeBoard from './pages/NoticeBoard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donation-detail" element={<DonationDetail />} />  
        <Route path="/donation-create" element={<DonationCreate />} /> 
        <Route path="/payment" element={<PaymentPage />} />            
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/donation-detail/:id" element={<DonationDetail />} />
        <Route path='/donation-list' element={<DonationList />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/board/free" element={<BoardFree />} />
        <Route path="/board/notice" element={<NoticeBoard />} />
      </Routes>
    </Router>
  );
}
console.log(" App.jsx 실행됨");

export default App; 
