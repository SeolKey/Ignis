import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Tag, Row, Col, Button, Space } from 'antd';
import {
  HomeOutlined, UserOutlined, HistoryOutlined, HeartOutlined, SettingOutlined
} from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/mypage/MyPage.css';
import Dashboard from './Dashboard';
import ProfileSettings from './ProfileSettings';
import Favorites from './Favorites';
import Settings from './Settings';

const { Title, Text } = Typography;

export default function MyPage() {
  const [active, setActive] = useState('dashboard'); // 기본 대시보드
  const [user, setUser] = useState({ userName: '', email: '', grade: '' });

  // 대시보드용
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.ok) {
          const d = await res.json();
          setUser({
            userName: d.userName ?? d.username ?? '사용자',
            email: d.email ?? d.userEmail ?? '',
            grade: d.grade ?? d.role ?? '',
          });
        }
      } catch {
        //
      }
      try {
        const rs = await fetch('/mypage/summary');
        if (rs.ok) {
          const s = await rs.json();
          setStats([
            { title: '총 참여 수', value: s.totalParticipations },
            { title: '총 기부 내역', value: s.totalDonationAmount, money: true },
            { title: '총 펀딩 내역', value: s.totalFundingAmount, money: true },
          ]);
          setActivities(s.activities || []);
        }
      } catch {
        // 
      }
    })();
  }, []);

  return (
    <Layout>
      <div className="mypage-wrap">
        <Row gutter={[24, 24]}>
          {/* 좌측 사이드 */}
          <Col xs={24} md={8} lg={6}>
            <Card className="profile-card" bordered={false}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar size={88} style={{ background: '#1677ff' }}>
                  {(user.userName || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Title level={4} style={{ marginBottom: 0 }}>{user.userName}</Title>
                <Text type="secondary">{user.email}</Text>
                <Tag color="gold" style={{ marginTop: 8 }}>{user.grade}</Tag>
              </Space>
            </Card>

            <Card className="menu-card" bordered={false}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  className={`menu-btn ${active === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActive('dashboard')}
                >대시보드</Button>

                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className={`menu-btn ${active === 'profile' ? 'active' : ''}`}
                  onClick={() => setActive('profile')}
                >프로필 관리</Button>

                <Button
                  type="text"
                  icon={<HeartOutlined />}
                  className={`menu-btn ${active === 'favorites' ? 'active' : ''}`}
                  onClick={() => setActive('favorites')}
                >관심 프로젝트</Button>

                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  className={`menu-btn ${active === 'settings' ? 'active' : ''}`}
                  onClick={() => setActive('settings')}
                >설정</Button>
              </Space>
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
