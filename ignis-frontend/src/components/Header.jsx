import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  SmileOutlined,
  FundOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header } = Layout;

const DonationHeader = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Vite proxy 사용 시 상대경로 호출
        const res = await fetch('/api/user', { credentials: 'include' });

        // 401/404 등은 로컬 저장값으로 폴백
        if (!res.ok) {
          const local = localStorage.getItem('username');
          if (local) setUsername(local);
          return;
        }

        // JSON이 아닐 수도 있으니 컨텐트 타입 확인
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = await res.text();
          console.warn('Non-JSON from /api/user:', ct, text.slice(0, 180));
          const local = localStorage.getItem('username');
          if (local) setUsername(local);
          return;
        }

        const data = await res.json();
        if (data?.userName) {
          setUsername(data.userName);
        } else {
          const local = localStorage.getItem('username');
          if (local) setUsername(local);
        }
      } catch (e) {
        console.error('세션 정보 가져오기 실패:', e);
        const local = localStorage.getItem('username');
        if (local) setUsername(local);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      // 스프링 로그아웃 먼저 호출 (기본 POST)
      await fetch('/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.warn('서버 로그아웃 실패, 클라이언트만 정리 진행', e);
    } finally {
      // 스토리지는 localStorage로 통일
      localStorage.removeItem('username');
      setUsername(null);
      navigate('/login');
    }
  };

  return (
    <Header className="donation-header">
      <div className="logo">
        <Link to="/">IGNIS</Link>
      </div>

      <Menu
        mode="horizontal"
        theme="light"
        defaultSelectedKeys={['home']}
        className="donation-menu"
      >
        <Menu.Item key="home" icon={<HomeOutlined />}><Link to="/">홈</Link></Menu.Item>
        <Menu.Item key="donation" icon={<HeartOutlined />}><Link to="/donation/donation-list-view">기부</Link></Menu.Item>
        <Menu.Item key="volunteer" icon={<SmileOutlined />}><Link to="/volunteer/volunteer-list-view">봉사</Link></Menu.Item>
        <Menu.Item key="funding" icon={<FundOutlined />}><Link to="/funding/funding-list-view">펀딩</Link></Menu.Item>

        {username ? (
          <>
            <Menu.Item key="user" icon={<UserOutlined />}>
              {username}님
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              로그아웃
            </Menu.Item>
          </>
        ) : (
          <Menu.Item key="login" icon={<UserOutlined />}>
            <Link to="/login">로그인</Link>
          </Menu.Item>
        )}
      </Menu>
    </Header>
  );
};

export default DonationHeader;
