import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DonationDetail from './pages/DonationDetail';
import DonationCreate from './pages/DonationCreate';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DonationList from './pages/DonationList';
import MyPage from './pages/MyPage';
import NoticeList from "./pages/noticeboard/NoticeList";
import NoticeDetail from "./pages/noticeboard/NoticeDetail";
import NoticeCreate from "./pages/noticeboard/NoticeCreate";
import NoticeEdit from "./pages/noticeboard/NoticeEdit";
import FreeList from './pages/freeboard/FreeList';
import FreeDetail from './pages/freeboard/FreeDetail';
import FreeCreate from './pages/freeboard/FreeCreate';
import FreeEdit from './pages/freeboard/FreeEdit';


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
        <Route path="/donation-detail/:id" element={<DonationDetail />} />
        <Route path='/donation-list' element={<DonationList />} />
        <Route path="/mypage" element={<MyPage />} />

        {/* 공지사항 */}
        <Route path="/board/notice" element={<NoticeList />} />
        <Route path="/board/notice/create" element={<NoticeCreate />} />
        <Route path="/board/notice/:id" element={<NoticeDetail />} />
        <Route path="/board/notice/:id/edit" element={<NoticeEdit />} />

        {/*  [ADD] 자유게시판 */}
        <Route path="/board/free" element={<FreeList />} />
        <Route path="/board/free/create" element={<FreeCreate />} />
        <Route path="/board/free/:id" element={<FreeDetail />} />
        <Route path="/board/free/:id/edit" element={<FreeEdit />} />
        
      </Routes>
    </Router>
  );
}
console.log(" App.jsx 실행됨");

export default App; 
