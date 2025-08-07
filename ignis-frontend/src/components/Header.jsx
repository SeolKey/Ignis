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
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    navigate('/login');
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
