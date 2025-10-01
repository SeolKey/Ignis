import React, { useMemo, useState } from 'react';
import {
  Card, Form, Input, Button, Divider, Typography, Space, message, Checkbox, Skeleton, Avatar, Tag,
} from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function LoginWidget({ me, onUserChange, loading: meLoading }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const initials = useMemo(() => {
    const name = me?.userName || '';
    if (!name) return 'U';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0]?.toUpperCase() || 'U';
  }, [me?.userName]);

  const goOauth = (provider) => {
    const url = `/oauth2/authorization/${provider}`; // 프로젝트 설정에 맞게 조정
    window.location.href = url;
  };

  // 로딩 중: 스켈레톤
  if (meLoading) {
    return (
      <Card className="login-card" bordered={false}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  // 이미 로그인 상태
  if (me?.userName) {
    return (
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <div className="login-header-bg" />
          <Space align="center" style={{ width: '100%' }}>
            <Avatar size={48} icon={<UserOutlined />} style={{ background: '#1677ff' }}>
              {initials}
            </Avatar>
            <div style={{ lineHeight: 1.2 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Welcome back</Typography.Text>
              <Typography.Title level={5} style={{ margin: '2px 0 0' }}>
                {me.userName} <Tag color="blue" style={{ marginLeft: 6 }}>로그인</Tag>
              </Typography.Title>
              {me.email && <Typography.Text type="secondary">{me.email}</Typography.Text>}
            </div>
          </Space>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Button
            type="primary"
            block
            icon={<SmileOutlined />}
            onClick={() => navigate('/mypage')}
          >
            마이페이지
          </Button>
          <Space.Compact block>
            <Button block onClick={() => navigate('/donation-list')}>기부 </Button>
            <Button block onClick={() => navigate('/volunteer')}>봉사 </Button>
            <Button block onClick={() => navigate('/funding')}>펀딩</Button>
          </Space.Compact>
          <Button
            danger
            block
            onClick={async () => {
              try {
                const ok1 = await fetch('/user/logout', { method: 'POST', credentials: 'include' })
                  .then(r => r.ok)
                  .catch(() => false);
                if (!ok1) {
                  await fetch('/logout', { method: 'POST', credentials: 'include' }).catch(() => { });
                }
              } finally {
                onUserChange?.(null);
                window.dispatchEvent(new Event('auth:changed')); // ★ 헤더에 인증 변경 알림
                message.success('로그아웃 되었습니다.');
                navigate('/', { replace: true });               // ★ 홈으로 리다이렉트 (새로고침 원하면 window.location.reload();)
              }
            }}
          >
            로그아웃
          </Button>

        </Space>
      </Card>
    );
  }

  // 비로그인: 폼 먼저, 소셜 아래
  return (
    <Card className="login-card" bordered={false}>
      <div className="login-header">
        <div className="login-header-bg" />
        <div className="login-head-copy">
          <Typography.Title level={4} style={{ margin: 0 }}>IGNIS에 오신 걸 환영합니다</Typography.Title>
          <Typography.Text type="secondary">작은 참여가 큰 변화를 만듭니다.</Typography.Text>
        </div>
      </div>

      {/* ✅ 아이디/비번 폼 먼저 */}
      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={async (values) => {
          try {
            setSubmitting(true);
            const form = new URLSearchParams();
            form.append('userLoginId', values.username);
            form.append('password', values.password);
            form.append('rememberMe', values.remember ? 'true' : 'false');

            const res = await fetch('/user/do-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: form.toString(),
              credentials: 'include',
            });

            const data = await res.json().catch(() => ({}));
            if (data?.result === '성공') {
              const meRes = await fetch('/user/me', { credentials: 'include' });
              const meJson = meRes.ok ? await meRes.json() : null;
              onUserChange?.(meJson || null);

              // 🔔 헤더에 인증 상태 변경 알림 + 홈으로 이동
              window.dispatchEvent(new Event('auth:changed'));
              message.success('환영합니다 👋');
              navigate('/', { replace: true });  // 새로고침 대신 라우트 리다이렉트
              // 만약 강제 새로고침을 원하면: window.location.reload();
            } else {
              message.error(data?.error_message ?? '아이디 또는 비밀번호를 확인해 주세요.');
            }
          } catch {
            message.error('네트워크 오류가 발생했습니다.');
          } finally {
            setSubmitting(false);
          }
        }}
      >


        <Form.Item
          label="아이디"
          name="username"
          rules={[
            { required: true, message: '아이디를 입력해 주세요.' },
            { min: 3, message: '아이디는 3자 이상' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="아이디"
            autoComplete="username"
            allowClear
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="비밀번호"
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="비밀번호"
            autoComplete="current-password"
            size="large"
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>아이디 저장</Checkbox>
          </Form.Item>
          <Space size={12}>
            <Button type="link" size="small" onClick={() => navigate('/find-password')}>
              비밀번호 찾기
            </Button>
            <Button type="link" size="small" onClick={() => navigate('/signup')}>
              회원가입
            </Button>
          </Space>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={submitting}
        >
          로그인
        </Button>
      </Form>

      <Divider plain style={{ margin: '14px 0' }}>또는</Divider>

      {/* ✅ 소셜 로그인 아래 */}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={() => goOauth('google')}
          style={{ borderColor: '#d9d9d9' }}
        >
          Google로 시작하기
        </Button>
        <Button
          block
          size="large"
          onClick={() => goOauth('kakao')}
          style={{ background: '#fee500', borderColor: '#fee500' }}
        >
          Kakao로 시작하기
        </Button>
      </Space>

      <Divider style={{ margin: '12px 0' }} />

      <div className="login-footnote">
        <Typography.Text type="secondary">
          본 서비스는 안전한 통신(HTTPS)을 사용합니다.
        </Typography.Text>
      </div>
    </Card>
  );
}
