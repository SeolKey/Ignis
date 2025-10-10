import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Tag, Row, Col, Space, message, Menu, Divider } from 'antd';
import {
  HomeOutlined, UserOutlined, HeartOutlined, SettingOutlined
} from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/mypage/MyPage.css';
import Dashboard from './Dashboard';
import ProfileSettings from './ProfileSettings';
import Favorites from './Favorites';
import Settings from './Settings';

const { Title, Text } = Typography;

const DEFAULT_PROFILE = '/images/default-profile.png';

export default function MyPage() {
  const [active, setActive] = useState('dashboard');
  const [user, setUser] = useState({
    userId: null,
    name: '',
    userName: '',
    email: '',
    grade: '',
    profileImage: '',
  });

  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
        const d = await res.json();
        setUser({
          userId: d.userId ?? d.id ?? null,
          name: d.name ?? d.fullName ?? '',
          userName: d.userName ?? d.username ?? d.userLoginId ?? '',
          email: d.email ?? d.userEmail ?? '',
          grade: d.grade ?? d.role ?? '',
          profileImage: d.profileImage ?? '',
        });
      } catch (e) {
        console.warn(e);
        message.warning('로그인 정보 확인이 필요할 수 있어요.');
      }

      try {
        const rs = await fetch('/mypage/summary', { credentials: 'include' });
        if (rs.ok) {
          const s = await rs.json();
          setStats([
            { title: '총 참여 수', value: s.totalParticipations },
            { title: '총 기부 내역', value: s.totalDonationAmount, money: true },
            { title: '총 펀딩 내역', value: s.totalFundingAmount, money: true },
          ]);
          setActivities(s.activities || []);
        }
      } catch { /* noop */ }
    })();
  }, []);

  const displayName = user.name || user.userName || '사용자';

  const menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: '대시보드' },
    { key: 'profile', icon: <UserOutlined />, label: '프로필 관리' },
    { key: 'favorites', icon: <HeartOutlined />, label: '관심 프로젝트' },
    { key: 'settings', icon: <SettingOutlined />, label: '설정' },
  ];

  return (
    <Layout>
      <div className="mypage-wrap">
        <Row gutter={[24, 24]}>
          {/* 좌측 사이드 */}
          <Col xs={24} md={8} lg={6}>
            <Card className="profile-card glass-card" bordered={false} bodyStyle={{ padding: 18 }}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar
                  size={92}
                  src={user.profileImage || DEFAULT_PROFILE}
                  alt="프로필 이미지"
                  onError={() => true}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                >
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </Avatar>

                <Title level={4} style={{ marginBottom: 2, letterSpacing: '-0.2px' }}>
                  {displayName}
                </Title>
                {user.email && <Text type="secondary">{user.email}</Text>}
                {user.grade && <Tag color="blue" style={{ marginTop: 8 }}>{user.grade}</Tag>}

                <Divider style={{ margin: '12px 0' }} />
                <div className="profile-badges">
                  <span className="pill">IGNIS Member</span>
                  <span className="pill pill-secondary">인증완료</span>
                </div>
              </Space>
            </Card>

            <Card className="menu-card glass-card" bordered={false} bodyStyle={{ padding: 10 }}>
              <Menu
                mode="inline"
                items={menuItems}
                selectedKeys={[active]}
                onClick={(e) => setActive(e.key)}
                className="side-menu"
              />
            </Card>
          </Col>

          {/* 우측 콘텐츠 */}
          <Col xs={24} md={16} lg={18}>
            {active === 'dashboard' && <Dashboard user={user} stats={stats} activities={activities} />}
            {active === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
            {active === 'favorites' && <Favorites />}
            {active === 'settings' && <Settings />}
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
