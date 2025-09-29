import React, { useEffect, useState } from 'react';
import { Layout, Menu, Input, Button, Space, Typography, message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SearchOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import IgnisLogo from '../assets/IgnisLogo.png';
import '../styles/components/Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const selectedKey =
    location.pathname.startsWith('/donation') ? 'donation' :
      location.pathname.startsWith('/volunteer') ? 'volunteer' :
        location.pathname.startsWith('/funding') ? 'funding' : '';

  const loadMe = async () => {
    try {
      const res = await fetch('/user/me', { credentials: 'include' });
      if (!res.ok) { setUsername(null); return; }
      const data = await res.json();
      const name = data?.userName ?? data?.username ?? null;
      setUsername(data?.authenticated ? name : null);
    } catch {
      setUsername(null);
    }
  };

  useEffect(() => {
    loadMe();
    const onAuthChanged = () => loadMe();
    window.addEventListener('auth:changed', onAuthChanged);
    return () => window.removeEventListener('auth:changed', onAuthChanged);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST', credentials: 'include' });
      setUsername(null);
      window.dispatchEvent(new Event('auth:changed'));
      navigate('/login');
    } catch {
      message.error('로그아웃에 실패했습니다.');
    }
  };

  const handleSearch = () => {
    if (!searchValue.trim()) {
      message.info('검색어를 입력해 주세요.');
      return;
    }
    // TODO: 검색 라우팅/모달 연결
    console.log('검색:', searchValue);
  };

  return (
    <AntHeader className="ignis-header trendy">
      {/* 왼쪽: 로고 + 1차 네비게이션 */}
      <div className="left-wrap">
        <Link to="/" className="brand" aria-label="IGNIS Home">
          <img src={IgnisLogo} alt="IGNIS" />
        </Link>

        <Menu
          mode="horizontal"
          theme="light"
          selectedKeys={[selectedKey]}
          className="menu"
        >
          <Menu.Item key="home"><Link to="/">홈</Link></Menu.Item>
          <Menu.Item key="donation"><Link to="/donation-list">기부</Link></Menu.Item>
          <Menu.Item key="volunteer"><Link to="/volunteer">봉사</Link></Menu.Item>
          <Menu.Item key="funding"><Link to="/funding">펀딩</Link></Menu.Item>
          <Menu.SubMenu key="board" title="게시판">
            <Menu.Item key="board-free"><Link to="/board/free">후기 게시판</Link></Menu.Item>
            <Menu.Item key="board-notice"><Link to="/board/notice">공지사항</Link></Menu.Item>
          </Menu.SubMenu>
        </Menu>

      </div>

      {/* 오른쪽: 검색 + 인증 */}
      <div className="right-wrap">
        <div className="search-shell trendy">
          <Input
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="무엇을 도와드릴까요?"
            prefix={<SearchOutlined />}
            className="search-input trendy"
            aria-label="검색어 입력"
          />
          <Button type="primary" onClick={handleSearch} className="search-btn trendy">
            검색
          </Button>
        </div>

        {username ? (
          <Space size={12} className="auth-zone">
            <Text className="hello">{username}님</Text>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} className="logout-btn">
              로그아웃
            </Button>
          </Space>
        ) : (
          <Button type="text" icon={<LoginOutlined />} onClick={() => navigate('/login')} className="login-btn">
            로그인
          </Button>
        )}
      </div>
    </AntHeader>
  );
}
