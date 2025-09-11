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
  Form,
  Input,
  message,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  HistoryOutlined,
  HeartOutlined,
  SettingOutlined,
  CheckCircleTwoTone,
  GiftTwoTone,
  StarTwoTone,
} from '@ant-design/icons';
import Layout from '../components/Layout';
import '../styles/MyPage.css';

const { Title, Text } = Typography;

export default function MyPage() {
  const [user, setUser] = useState({});
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'profile' | others
  const [changingPwd, setChangingPwd] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch('/api/user', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUserData();
  }, []);

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

  // 비밀번호 변경 (폼 파라미터 방식 — 컨트롤러 @RequestParam 매핑)
  async function handleChangePassword(values) {
    const { currentPassword, newPassword, confirmPassword } = values;
    if (newPassword !== confirmPassword) {
      message.warning('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setChangingPwd(true);
      const res = await fetch('/mypage/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ currentPassword, newPassword }).toString(),
      });
      const data = await res.json();
      if (!res.ok || data.code) throw new Error(data.error_message || '비밀번호 변경 실패');
      message.success(data.result || '비밀번호가 변경되었습니다.');
    } catch (e) {
      message.error(e.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setChangingPwd(false);
    }
  }

  // 이메일 변경 (폼 파라미터 방식 — 컨트롤러 @RequestParam 매핑)
  async function handleChangeEmail(values) {
    const { newEmail } = values;
    try {
      setChangingEmail(true);
      const res = await fetch('/mypage/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ newEmail }).toString(),
      });
      const data = await res.json();
      if (!res.ok || data.code) throw new Error(data.error_message || '이메일 변경 실패');
      message.success(data.result || '이메일이 변경되었습니다.');
      // 성공 시 화면의 사용자 이메일도 업데이트
      setUser(prev => ({ ...prev, email: newEmail }));
    } catch (e) {
      message.error(e.message || '이메일 변경 중 오류가 발생했습니다.');
    } finally {
      setChangingEmail(false);
    }
  }

  function renderDashboard() {
    return (
      <>
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
      </>
    );
  }

  function renderProfileManage() {
    return (
      <>
        <Title level={3} style={{ marginBottom: 12 }}>프로필 관리</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="비밀번호 변경" bordered={false}>
              <Form layout="vertical" onFinish={handleChangePassword}>
                <Form.Item label="현재 비밀번호" name="currentPassword" rules={[{ required: true, message: '현재 비밀번호를 입력하세요.' }]}> 
                  <Input.Password placeholder="현재 비밀번호" autoComplete="current-password" />
                </Form.Item>
                <Form.Item label="새 비밀번호" name="newPassword" rules={[{ required: true, message: '새 비밀번호를 입력하세요.' }, { min: 8, message: '8자 이상으로 설정하세요.' }]}>
                  <Input.Password placeholder="새 비밀번호 (8자 이상 권장)" autoComplete="new-password" />
                </Form.Item>
                <Form.Item label="새 비밀번호 확인" name="confirmPassword" dependencies={["newPassword"]} rules={[{ required: true, message: '새 비밀번호를 다시 입력하세요.' }]}>
                  <Input.Password placeholder="새 비밀번호 확인" autoComplete="new-password" />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={changingPwd}>비밀번호 변경</Button>
                </Space>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="이메일 변경" bordered={false}>
              <Form layout="vertical" onFinish={handleChangeEmail} initialValues={{ newEmail: user.email }}>
                <Form.Item label="새 이메일" name="newEmail" rules={[{ required: true, message: '새 이메일을 입력하세요.' }, { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]}>
                  <Input placeholder="example@domain.com" autoComplete="email" />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={changingEmail}>이메일 변경</Button>
                </Space>
              </Form>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <Layout>
      <div className="mypage-wrap">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6}>
            <Card className="profile-card" bordered={false}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar size={88} style={{ background: '#1677ff' }}>{user.userName?.charAt?.(0)}</Avatar>
                <Title level={4} style={{ marginBottom: 0 }}>{user.userName}</Title>
                <Text type="secondary">{user.email}</Text>
                <Tag color="gold" style={{ marginTop: 8 }}>{user.grade}</Tag>
              </Space>
            </Card>

            <Card className="menu-card" bordered={false}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Button type="text" icon={<HomeOutlined />} className={`menu-btn ${activeMenu==='dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>대시보드</Button>
                <Button type="text" icon={<UserOutlined />} className={`menu-btn ${activeMenu==='profile' ? 'active' : ''}`} onClick={() => setActiveMenu('profile')}>프로필 관리</Button>
                <Button type="text" icon={<HistoryOutlined />} className="menu-btn" onClick={() => setActiveMenu('history')}>활동 내역</Button>
                <Button type="text" icon={<HeartOutlined />} className="menu-btn" onClick={() => setActiveMenu('favorites')}>관심 프로젝트</Button>
                <Button type="text" icon={<SettingOutlined />} className="menu-btn" onClick={() => setActiveMenu('settings')}>설정</Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={16} lg={18}>
            {activeMenu === 'dashboard' && renderDashboard()}
            {activeMenu === 'profile' && renderProfileManage()}
            {activeMenu !== 'dashboard' && activeMenu !== 'profile' && (
              <Card bordered={false}>
                <Title level={4}>해당 메뉴는 준비 중입니다.</Title>
                <Text type="secondary">필요한 항목을 알려주시면 먼저 구현해드릴게요.</Text>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
