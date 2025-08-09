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
import { Link, useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

const DonationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(null);

  // 현재 경로에 맞춰 메뉴 기본 선택키 추정 (선택 사항)
  const selectedKey =
    location.pathname.startsWith('/donation') ? 'donation' :
    location.pathname.startsWith('/volunteer') ? 'volunteer' :
    location.pathname.startsWith('/funding') ? 'funding' : 'home';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 서버 세션 기준으로만 판단 (credentials 필수)
        const res = await fetch('/api/user', { credentials: 'include' });

        if (!res.ok) {
          if (!cancelled) setUsername(null); // 비로그인 UI
          return;
        }

        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          if (!cancelled) setUsername(null);
          return;
        }

        const data = await res.json();
        // 백엔드 필드명 호환(userName | username)
        const name = data?.userName ?? data?.username ?? null;
        if (!cancelled) setUsername(name || null);
      } catch (e) {
        console.warn('세션 조회 실패:', e);
        if (!cancelled) setUsername(null);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.warn('서버 로그아웃 실패:', e);
    } finally {
      setUsername(null); // 서버 기준이므로 스토리지 사용 안 함
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
        selectedKeys={[selectedKey]}
        className="donation-menu"
      >
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">홈</Link>
        </Menu.Item>
        <Menu.Item key="donation" icon={<HeartOutlined />}>
          <Link to="/donation/donation-list-view">기부</Link>
        </Menu.Item>
        <Menu.Item key="volunteer" icon={<SmileOutlined />}>
          <Link to="/volunteer/volunteer-list-view">봉사</Link>
        </Menu.Item>
        <Menu.Item key="funding" icon={<FundOutlined />}>
          <Link to="/funding/funding-list-view">펀딩</Link>
        </Menu.Item>

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
