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

  const selectedKey =
    location.pathname.startsWith('/donation') ? 'donation' :
    location.pathname.startsWith('/volunteer') ? 'volunteer' :
    location.pathname.startsWith('/funding') ? 'funding' : 'home';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });

        if (!res.ok) {
          if (!cancelled) setUsername(null); 
          return;
        }

        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          if (!cancelled) setUsername(null);
          return;
        }

        const data = await res.json();
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
              <Link to="/mypage">{username}님</Link> {/* 마이페이지로 이동하는 링크 추가 */}
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
