import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Tag, Row, Col, Button, Space, message } from 'antd';
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

// 기본 프로필 이미지 
const DEFAULT_PROFILE = '/images/default-profile.png';

export default function MyPage() {
  const [active, setActive] = useState('dashboard'); // 기본 대시보드
  const [user, setUser] = useState({
    userId: null,
    name: '',            //  이름 우선
    userName: '',        // 아이디(로그인ID) — fallback용
    email: '',
    grade: '',
    profileImage: '',    // 서버가 내려주면 사용
  });

  // 대시보드용
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    (async () => {
      // 사용자 정보
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
        const d = await res.json();

        setUser({
          userId: d.userId ?? d.id ?? null,
          name: d.name ?? d.fullName ?? '',                           // ✅ DB name 컬럼
          userName: d.userName ?? d.username ?? d.userLoginId ?? '',  // fallback
          email: d.email ?? d.userEmail ?? '',
          grade: d.grade ?? d.role ?? '',
          profileImage: d.profileImage ?? '',                         // 없으면 기본 이미지 사용
        });
      } catch (e) {
        console.warn(e);
        message.warning('로그인 정보 확인이 필요할 수 있어요.');
      }

      // 요약/통계
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
      } catch {
        /* noop */
      }
    })();
  }, []);

  const displayName = user.name || user.userName || '사용자';

  return (
    <Layout>
      <div className="mypage-wrap">
        <Row gutter={[24, 24]}>
          {/* 좌측 사이드 */}
          <Col xs={24} md={8} lg={6}>
            <Card className="profile-card" bordered={false}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar
                  size={88}
                  src={user.profileImage || DEFAULT_PROFILE}
                  alt="프로필 이미지"
                  // 이미지 로드 실패 시 이니셜 아이콘으로 폴백
                  onError={() => true} // true 반환 시 Antd가 내장 fallback(아바타 children/아이콘)을 사용
                  icon={<UserOutlined />}
                >
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </Avatar>

                <Title level={4} style={{ marginBottom: 0 }}>
                  {displayName}
                </Title>
                {user.email && <Text type="secondary">{user.email}</Text>}
                {user.grade && <Tag color="gold" style={{ marginTop: 8 }}>{user.grade}</Tag>}
              </Space>
            </Card>

            <Card className="menu-card" bordered={false}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  className={`menu-btn ${active === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActive('dashboard')}
                >
                  대시보드
                </Button>

                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className={`menu-btn ${active === 'profile' ? 'active' : ''}`}
                  onClick={() => setActive('profile')}
                >
                  프로필 관리
                </Button>

                <Button
                  type="text"
                  icon={<HeartOutlined />}
                  className={`menu-btn ${active === 'favorites' ? 'active' : ''}`}
                  onClick={() => setActive('favorites')}
                >
                  관심 프로젝트
                </Button>

                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  className={`menu-btn ${active === 'settings' ? 'active' : ''}`}
                  onClick={() => setActive('settings')}
                >
                  설정
                </Button>
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
