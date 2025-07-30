import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  SmileOutlined,
  FundOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Header } = Layout;

const DonationHeader = () => {
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
        <Menu.Item key="login" icon={<UserOutlined />}>
          <Link to="/login">로그인</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default DonationHeader;
