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
    // 세션에서 사용자 이름 가져오기
    const storedUsername = sessionStorage.getItem('userName');
    if (storedUsername) {
      setUsername(storedUsername);  // 상태에 사용자 이름 저장
    }
  }, []);  // 빈 배열을 넣어 한 번만 실행되도록 설정

  const handleLogout = () => {
    sessionStorage.removeItem('userName'); // 로그아웃 시 사용자 정보 삭제
    setUsername(null); // 상태 초기화
    navigate('/login'); // 로그인 페이지로 리디렉션
  };

  return (
    <Header className="donation-header">
      <div className="logo">
        <Link to="/">IGNIS</Link>
      </div>

      <Menu
        mode="horizontal"
        theme="light"
        defaultSelectedKeys={['donation']}
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
          <Menu.Item key="login" icon={<UserOutlined />}><Link to="/login">로그인</Link></Menu.Item>
        )}
      </Menu>
    </Header>
  );
};

export default DonationHeader;
