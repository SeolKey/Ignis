import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  SmileOutlined,
  FundOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined, // ⬅ 추가
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import IgnisLogo from '../assets/IgnisLogo.png';
import '../styles/Header.css';
const { Header } = Layout;

// .env.development 에 VITE_BACKEND_OFFLINE=1 넣어두면 개발 중 프록시 에러 로그/요청 자체를 차단
const BACKEND_OFFLINE = import.meta.env.VITE_BACKEND_OFFLINE === '1';

const DonationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(null);

  const selectedKey =
    location.pathname.startsWith('/donation') ? 'donation' :
      location.pathname.startsWith('/volunteer') ? 'volunteer' :
        location.pathname.startsWith('/funding') ? 'funding' :
          location.pathname.startsWith('/board') ? 'board' : 'home'; // ⬅ 선택 상태 추가

  useEffect(() => {
    if (BACKEND_OFFLINE) return;

    let cancelled = false;
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 2500);

    (async () => {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include',
          signal: ctrl.signal,
        });

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
      } catch {
        if (!cancelled) setUsername(null);
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // 조용히 무시
    } finally {
      setUsername(null);
      navigate('/login');
    }
  };

  return (
    <Header className="donation-header">
      <div className="logo">
        <Link to="/">
          <img src={IgnisLogo} alt="IGNIS Logo" />
        </Link>
      </div>

      <Menu
        mode="horizontal"
        theme="light"
        selectedKeys={[selectedKey]}
        className="donation-menu"
      >
        <Menu.Item key="home" icon={<span role="img" aria-label="home">🏠</span>}>
          <Link to="/">홈</Link>
        </Menu.Item>

        <Menu.Item key="donation" icon={<span role="img" aria-label="donation">❤️</span>}>
          <Link to="/donation-list">기부</Link>
        </Menu.Item>

        <Menu.Item key="volunteer" icon={<span role="img" aria-label="volunteer">😊</span>}>
          <Link to="/volunteer">봉사</Link>
        </Menu.Item>

        <Menu.Item key="funding" icon={<span role="img" aria-label="funding">📦</span>}>
          <Link to="/funding">펀딩</Link>
        </Menu.Item>

        {/* ▼ 게시판 드롭다운 (자유게시판/공지사항) */}
        <Menu.SubMenu key="board" icon={<span role="img" aria-label="board">📋</span>} title="게시판">
          <Menu.Item key="board-free">
            <Link to="/board/free">자유게시판</Link>
          </Menu.Item>
          <Menu.Item key="board-notice">
            <Link to="/board/notice">공지사항</Link>
          </Menu.Item>
        </Menu.SubMenu>

        {username ? (
          <>
            <Menu.Item key="user" icon={<UserOutlined />}>
              <Link to="/mypage">{username}님</Link>
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
    </Header >
  );
};

export default DonationHeader;
