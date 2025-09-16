// Header.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import IgnisLogo from '../assets/IgnisLogo.png';
import '../styles/Header.css';
const { Header } = Layout;

const BACKEND_OFFLINE = import.meta.env.VITE_BACKEND_OFFLINE === '1';

const DonationHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState(null);

    const selectedKey =
        location.pathname.startsWith('/donation') ? 'donation' :
            location.pathname.startsWith('/volunteer') ? 'volunteer' :
                location.pathname.startsWith('/funding') ? 'funding' :
                    location.pathname.startsWith('/board') ? 'board' : 'home';

    const loadMe = async () => {
        if (BACKEND_OFFLINE) return;
        try {
            const res = await fetch('/user/me', { credentials: 'include' }); // ★ 변경: /api/user -> /user/me
            if (!res.ok) { setUsername(null); return; }
            const data = await res.json();
            const name = data?.userName ?? data?.username ?? null;
            setUsername(data?.authenticated ? name : null);
        } catch {
            setUsername(null);
        }
    };

    useEffect(() => {
        // 첫 진입 시 로드
        loadMe();
        // 로그인/로그아웃 직후 갱신
        const onAuthChanged = () => loadMe();
        window.addEventListener('auth:changed', onAuthChanged);
        return () => window.removeEventListener('auth:changed', onAuthChanged);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/logout', { method: 'POST', credentials: 'include' });
        } catch {}
        setUsername(null);
        window.dispatchEvent(new Event('auth:changed')); // 갱신 트리거
        navigate('/login');
    };

    return (
        <Header className="donation-header">
            <div className="logo">
                <Link to="/"><img src={IgnisLogo} alt="IGNIS Logo" /></Link>
            </div>

            <Menu mode="horizontal" theme="light" selectedKeys={[selectedKey]} className="donation-menu">
                <Menu.Item key="home"><Link to="/">홈</Link></Menu.Item>
                <Menu.Item key="donation"><Link to="/donation-list">기부</Link></Menu.Item>
                <Menu.Item key="volunteer"><Link to="/volunteer">봉사</Link></Menu.Item>
                <Menu.Item key="funding"><Link to="/funding">펀딩</Link></Menu.Item>
                <Menu.SubMenu key="board" title="게시판">
                    <Menu.Item key="board-free"><Link to="/board/free">자유게시판</Link></Menu.Item>
                    <Menu.Item key="board-notice"><Link to="/board/notice">공지사항</Link></Menu.Item>
                </Menu.SubMenu>

                {username ? (
                    <>
                        <Menu.Item key="user" icon={<UserOutlined />}><Link to="/mypage">{username}님</Link></Menu.Item>
                        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>로그아웃</Menu.Item>
                    </>
                ) : (
                    <Menu.Item key="login" icon={<UserOutlined />}><Link to="/login">로그인</Link></Menu.Item>
                )}
            </Menu>
        </Header>
    );
};

export default DonationHeader;
