import React, { useEffect, useState } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Tag,
  Row,
  Col,
  Button,
  List,
  Space,
  Divider,
  Statistic,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  HistoryOutlined,
  HeartOutlined,
  SettingOutlined,
  PlusOutlined,
  DownloadOutlined,
  CheckCircleTwoTone,
  GiftTwoTone,
  StarTwoTone,
} from '@ant-design/icons';
import Layout from '../components/Layout';
import '../styles/MyPage.css';

const { Title, Text } = Typography;

export default function MyPage() {
  const [user, setUser] = useState({});
  
  useEffect(() => {
    // 사용자 정보 요청
    async function fetchUserData() {
      const res = await fetch('/api/user', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }

    fetchUserData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const stats = [
    { title: '총 참여 수', value: 128, icon: <GiftTwoTone twoToneColor="#1677ff" /> },
    { title: '총 기부 내역', value: 2450000, money: true },
    { title: '총 펀딩 내역', value: 450000, money: true },
  ];

  const activities = [
    { icon: <CheckCircleTwoTone twoToneColor="#52c41a" />, title: '게시물 등록이 승인되었습니다', hint: '게시물 링크 바로가기', time: '2시간 전' },
    { icon: <CheckCircleTwoTone twoToneColor="#52c41a" />, title: '참여 신청이 완료되었습니다', hint: '참여 링크 바로가기', time: '1일 전' },
    { icon: <StarTwoTone twoToneColor="#faad14" />, title: '리뷰를 작성해주세요', hint: '구매하신 상품에 대한 후기를 남겨주세요', time: '3일 전' },
  ];

  return (
    <Layout>
      <div className="mypage-wrap">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6}>
            <Card className="profile-card" bordered={false}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar size={88} style={{ background: '#1677ff' }}>{user.userName?.charAt(0)}</Avatar>
                <Title level={4} style={{ marginBottom: 0 }}>{user.userName}</Title>
                <Text type="secondary">{user.email}</Text>
                <Tag color="gold" style={{ marginTop: 8 }}>{user.grade}</Tag>
              </Space>
            </Card>

            <Card className="menu-card" bordered={false}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Button type="text" icon={<HomeOutlined />} className="menu-btn active">대시보드</Button>
                <Button type="text" icon={<UserOutlined />} className="menu-btn">프로필 관리</Button>
                <Button type="text" icon={<HistoryOutlined />} className="menu-btn">활동 내역</Button>
                <Button type="text" icon={<HeartOutlined />} className="menu-btn">관심 프로젝트</Button>
                <Button type="text" icon={<SettingOutlined />} className="menu-btn">설정</Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={16} lg={18}>
            <div className="greeting-bar">
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>안녕하세요, {user.userName}님!</Title>
                <Text type="secondary">오늘도 좋은 하루 되세요.</Text>
              </div>
              
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {stats.map((s, idx) => (
                <Col xs={24} sm={12} lg={8} key={idx}>
                  <Card className="stat-card" bordered={false}>
                    <Space align="start" size="large">
                      <div className="stat-icon">{s.icon || <GiftTwoTone twoToneColor="#1677ff" />}</div>
                      <div>
                        <Text type="secondary">{s.title}</Text>
                        <div>
                          {s.money ? (
                            <Statistic value={s.value} prefix="₩" valueStyle={{ fontSize: 28 }} />
                          ) : (
                            <Title level={2} style={{ margin: 0 }}>{s.value}건</Title>
                          )}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            <Card title="최근 활동" extra={<Button type="link">전체 보기</Button>} bordered={false}>
              <List
                itemLayout="horizontal"
                dataSource={activities}
                renderItem={(a, i) => (
                  <>
                    <List.Item>
                      <List.Item.Meta
                        avatar={<div className="activity-icon">{a.icon}</div>}
                        title={<span className="activity-title">{a.title}</span>}
                        description={<Text type="secondary">{a.hint}</Text>}
                      />
                      <Text type="secondary">{a.time}</Text>
                    </List.Item>
                    {i !== activities.length - 1 && <Divider style={{ margin: '8px 0' }} />}
                  </>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
