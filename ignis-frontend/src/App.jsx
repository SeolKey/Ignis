// src/App.jsx
import { Routes, Route } from 'react-router-dom';

/* ========== 공통/홈 ========== */
import Home from './pages/Home';
import MyPage from './pages/MyPage';

/* ========== 인증 ========== */
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

/* ========== 기부( Donation ) ========== */
import DonationList from './pages/donation/DonationList';
import DonationDetail from './pages/donation/DonationDetail';
import DonationCreate from './pages/donation/DonationCreate';
import DonationPayment from './pages/donation/DonationPayment';
import DonationPaymentSuccessPage from './pages/donation/DonationPaymentSuccessPage.jsx';

/* ========== 공지사항( Notice ) ========== */
import NoticeList from './pages/noticeboard/NoticeList';
import NoticeDetail from './pages/noticeboard/NoticeDetail';
import NoticeCreate from './pages/noticeboard/NoticeCreate';
import NoticeEdit from './pages/noticeboard/NoticeEdit';

/* ========== 자유게시판( Freeboard ) ========== */
import FreeList from './pages/freeboard/FreeList';
import FreeDetail from './pages/freeboard/FreeDetail';
import FreeCreate from './pages/freeboard/FreeCreate';
import FreeEdit from './pages/freeboard/FreeEdit';

/* ========== 펀딩( Funding ) ========== */
import FundingList from './pages/funding/FundingList';
import FundingDetail from './pages/funding/FundingDetail';
import FundingCreate from './pages/funding/FundingCreate';
import FundingEdit from './pages/funding/FundingEdit';
import PaymentSuccessPage from './pages/funding/PaymentSuccessPage';
import PaymentPage from './pages/funding/PaymentPage'; // 결제 페이지


/* ========== 봉사( Volunteer ) ========== */
import VolunteerList from './pages/volunteer/VolunteerList';
import VolunteerDetail from './pages/volunteer/VolunteerDetail';
import VolunteerCreate from './pages/volunteer/VolunteerCreate';

function App() {
  return (
    <Routes>
      {/* ===== 홈/공통 ===== */}
      <Route path="/" element={<Home />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/mypage" element={<MyPage />} />

      {/* ===== 인증 ===== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* ===== 기부( Donation ) ===== */}
      <Route path="/donation-list" element={<DonationList />} />
      <Route path="/donation-detail/:id" element={<DonationDetail />} />
      <Route path="/donation-create" element={<DonationCreate />} />
      <Route path="/donation-payment" element={<DonationPayment />} />
      <Route path="/donation-payment-success" element={<DonationPaymentSuccessPage />} />

      {/* ===== 공지사항( Notice ) ===== */}
      <Route path="/board/notice" element={<NoticeList />} />
      <Route path="/board/notice/create" element={<NoticeCreate />} />
      <Route path="/board/notice/:id" element={<NoticeDetail />} />
      <Route path="/board/notice/:id/edit" element={<NoticeEdit />} />

      {/* ===== 자유게시판( Freeboard ) ===== */}
      <Route path="/board/free" element={<FreeList />} />
      <Route path="/board/free/create" element={<FreeCreate />} />
      <Route path="/board/free/:id" element={<FreeDetail />} />
      <Route path="/board/free/:id/edit" element={<FreeEdit />} />

      {/* ===== 펀딩( Funding ) ===== */}
      <Route path="/funding" element={<FundingList />} />
      <Route path="/funding/create" element={<FundingCreate />} />
      <Route path="/funding/:id" element={<FundingDetail />} />
      <Route path="/funding/:id/edit" element={<FundingEdit />} />
      <Route path="/funding/participate-complete" element={<PaymentSuccessPage />} />

      {/* ===== 봉사( Volunteer ) ===== */}
      <Route path="/volunteer" element={<VolunteerList />} />
      <Route path="/volunteer/create" element={<VolunteerCreate />} />
      <Route path="/volunteer/:id" element={<VolunteerDetail />} />
    </Routes>
  );
}

console.log('App.jsx 실행됨');
export default App;
