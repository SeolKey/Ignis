// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Menu, Input, Button, Space, Typography, message, Tag } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import IgnisLogo from '../assets/IgnisLogo.png';
import '../styles/components/Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 사용자 정보 상태
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null); // 'ADMIN' | 'USER' | null
  const [searchValue, setSearchValue] = useState('');

  // ✅ 상단 메뉴 선택 상태
  const selectedKey =
    location.pathname.startsWith('/donation') ? 'donation' :
    location.pathname.startsWith('/volunteer') ? 'volunteer' :
    location.pathname.startsWith('/funding') ? 'funding' :
    location.pathname.startsWith('/board') ? 'board' :
    location.pathname.startsWith('/admin') ? 'admin' :
    'home';

  // ✅ 내 정보 로드
  const loadMe = async () => {
    try {
      const res = await fetch('/user/me', { credentials: 'include' });
      if (!res.ok) {
        setUsername(null);
        setRole(null);
        return;
      }
      const data = await res.json();

      // 백엔드 응답 key 호환 처리
      const name = data?.userName ?? data?.username ?? null;
      const isAuthed = data?.authenticated ?? !!name;

      setUsername(isAuthed ? name : null);
      setRole(isAuthed ? (data?.role ?? data?.authorities ?? data?.roles ?? null) : null);
      // role이 배열인 경우 첫 값 사용 (Spring Security의 GrantedAuthority 형태 대비)
      if (Array.isArray(data?.authorities) && !data?.role) {
        const adminLike = data.authorities.find((a) =>
          String(a?.authority ?? a).toUpperCase().includes('ADMIN')
        );
        setRole(adminLike ? 'ADMIN' : 'USER');
      } else if (Array.isArray(data?.roles) && !data?.role) {
        const adminLike = data.roles.find((r) => String(r).toUpperCase().includes('ADMIN'));
        setRole(adminLike ? 'ADMIN' : 'USER');
      }
    } catch {
      setUsername(null);
      setRole(null);
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
      setRole(null);
      window.dispatchEvent(new Event('auth:changed'));
      navigate('/login');
    } catch {
      message.error('로그아웃에 실패했습니다.');
    }
  };

  const handleSearch = () => {
    const q = searchValue.trim();
    if (!q) return message.info('검색어를 입력해 주세요.');
    // ✅ 검색 라우팅 (필요 시 경로 수정)
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // 관리자 여부 체크 (문자열/배열 대응)
  const isAdmin =
    (typeof role === 'string' && String(role).toUpperCase().includes('ADMIN')) ||
    (Array.isArray(role) && role.some((r) => String(r).toUpperCase().includes('ADMIN')));

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
          <Menu.Item key="home">
            <Link to="/">홈</Link>
          </Menu.Item>

          <Menu.Item key="donation">
            <Link to="/donation-list">기부</Link>
          </Menu.Item>

          <Menu.Item key="volunteer">
            <Link to="/volunteer">봉사</Link>
          </Menu.Item>

          <Menu.Item key="funding">
            <Link to="/funding">펀딩</Link>
          </Menu.Item>

          <Menu.SubMenu key="board" title="게시판">
            <Menu.Item key="board-free"><Link to="/board/free">후기 게시판</Link></Menu.Item>
            <Menu.Item key="board-notice"><Link to="/board/notice">공지사항</Link></Menu.Item>
          </Menu.SubMenu>

          {/* ✅ 관리자 전용 메뉴: ADMIN일 때만 노출 */}
          {isAdmin && (
            <Menu.SubMenu
              key="admin"
              title={
                <span>
                  <CrownOutlined style={{ marginRight: 6 }} />
                  관리자
                </span>
              }
            >
              {/* 필요에 맞게 라우트 경로 조정 */}
              <Menu.Item key="admin-dashboard">
                <Link to="/admin">대시보드</Link>
              </Menu.Item>
              <Menu.Item key="admin-users">
                <Link to="/admin/users">회원 관리</Link>
              </Menu.Item>
              <Menu.Item key="admin-content">
                <Link to="/admin/content">콘텐츠 관리</Link>
              </Menu.Item>
              <Menu.Item key="admin-reports">
                <Link to="/admin/reports">신고/리뷰 관리</Link>
              </Menu.Item>
              <Menu.Item key="admin-emergency">
                <Link to="/admin/emergency">긴급 배너</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )}
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
            <Text className="hello">
              <UserOutlined style={{ marginRight: 6 }} />
              {username}님
            </Text>
            {isAdmin && (
              <Tag color="gold" icon={<CrownOutlined />}>
                ADMIN
              </Tag>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-btn"
            >
              로그아웃
            </Button>
          </Space>
        ) : (
          <Button
            type="text"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            className="login-btn"
          >
            로그인
          </Button>
        )}
      </div>
    </AntHeader>
  );
}
