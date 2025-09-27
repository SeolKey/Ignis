import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Typography, Row, Col, Space, Button, Form, Input, Divider, Alert, Steps, Progress, Tag, Modal, message, notification
} from 'antd';
import {
  SafetyOutlined, MailOutlined, ExclamationCircleOutlined,
  CheckCircleTwoTone, WarningTwoTone, StopTwoTone
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const fmtKo = (d) => {
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'medium' }).format(d);
  } catch { return d?.toLocaleString?.() || ''; }
};
const passwordStrength = (pwd = '') => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 5);
};

export default function ProfileSettings({ user, setUser }) {
  const [noti, notiCtx] = notification.useNotification();

  // 보안 상태
  const [secLoading, setSecLoading] = useState(false);
  const [secLevel, setSecLevel] = useState('양호');
  const [lastPwdChangedAt, setLastPwdChangedAt] = useState(null);
  const [lastEmailChangedAt, setLastEmailChangedAt] = useState(null);

  // 비밀번호
  const [pwdForm] = Form.useForm();
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMeter, setPwdMeter] = useState(0);

  // 이메일
  const [emailForm] = Form.useForm();
  const [emailBusy, setEmailBusy] = useState({ send: false, verify: false, change: false });
  const [emailHint, setEmailHint] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [showCodeRow, setShowCodeRow] = useState(false);
  const [emailStep, setEmailStep] = useState(0);
  const [resendSec, setResendSec] = useState(0);
  useEffect(() => {
    if (!resendSec) return;
    const t = setInterval(() => setResendSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSec]);

  // 401 재인증
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyErr, setVerifyErr] = useState('');
  const [verifyPw, setVerifyPw] = useState('');
  const handleMaybe401 = async (res) => {
    if (res.status === 401) {
      setVerifyOpen(true);
      throw new Error('REVERIFY');
    }
  };
  const doReverify = async () => {
    if (!verifyPw.trim()) { setVerifyErr('비밀번호를 입력하세요.'); return; }
    try {
      setVerifyBusy(true); setVerifyErr('');
      const res = await fetch('/mypage/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ password: verifyPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setVerifyOpen(false); setVerifyPw(''); message.success('인증되었습니다.'); }
      else setVerifyErr(data.msg || '인증에 실패했습니다.');
    } catch { setVerifyErr('네트워크 오류입니다.'); }
    finally { setVerifyBusy(false); }
  };

  // 초기 보안 상태 로드
  useEffect(() => {
    (async () => {
      // 폼 초기값
      emailForm.setFieldsValue({ newEmail: user.email });
      setSecLoading(true);
      try {
        const rs = await fetch('/mypage/security', { credentials: 'include' });
        if (rs.ok) {
          const d = await rs.json().catch(() => ({}));
          if (d.passwordLastChangedAt) setLastPwdChangedAt(new Date(d.passwordLastChangedAt));
          if (d.emailLastChangedAt) setLastEmailChangedAt(new Date(d.emailLastChangedAt));
          if (d.level) setSecLevel(d.level === 'SAFE' ? '양호' : d.level === 'WARN' ? '주의' : '위험');
        }
      } catch {
        //
      }
      finally { setSecLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 비밀번호 변경
  const handleChangePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      pwdForm.setFields([{ name: 'confirmPassword', errors: ['새 비밀번호와 일치하지 않습니다.'] }]);
      return;
    }
    if (currentPassword && newPassword && currentPassword === newPassword) {
      pwdForm.setFields([{ name: 'newPassword', errors: ['현재 비밀번호와 다른 비밀번호를 설정하세요.'] }]);
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
      await handleMaybe401(res);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.code) {
        const msg = data.error_message || data.result || '비밀번호 변경 실패';
        if (/현재\s*비밀번호|current\s*password/i.test(msg)) {
          pwdForm.setFields([{ name: 'currentPassword', errors: ['현재 비밀번호가 올바르지 않습니다.'] }]);
        }
        throw new Error(msg);
      }
      noti.success({ message: '비밀번호 변경 완료', description: '보안을 위해 비밀번호가 변경되었습니다.', placement: 'topRight' });
      setLastPwdChangedAt(new Date());
      setSecLevel('양호');
      pwdForm.resetFields();
    } catch (e) {
      if (e.message !== 'REVERIFY') message.error(e.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setChangingPwd(false);
    }
  };

  // 이메일 발송/검증/변경
  const sendEmailCode = async () => {
    setEmailHint(''); setEmailVerified(false); setShowCodeRow(false); setEmailStep(0);
    try {
      const { newEmail } = await emailForm.validateFields(['newEmail']);
      setEmailBusy((s) => ({ ...s, send: true }));
      try {
        const chk = await fetch(`/user/check-email?email=${encodeURIComponent(newEmail)}`);
        const exists = await chk.json().catch(() => ({}));
        if (exists?.exists) { setEmailHint('이미 가입된 이메일입니다.'); return; }
      } catch {
        //
      }
      const res = await fetch('/user/email-auth/send', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: newEmail }),
      });
      await handleMaybe401(res);
      const data = await res.json().catch(() => ({}));
      if (data?.result) {
        setShowCodeRow(true); setEmailHint('인증코드 전송됨 (3분 내 입력).');
        message.success('인증코드를 전송했습니다.');
        setEmailStep(1); setResendSec(60);
      } else setEmailHint(data?.error_message || '인증코드 전송 실패');
    } catch (e) {
      if (e.message !== 'REVERIFY') setEmailHint('네트워크 오류 또는 입력값을 확인해 주세요.');
    } finally { setEmailBusy((s) => ({ ...s, send: false })); }
  };

  const verifyEmailCode = async () => {
    try {
      const { newEmail, emailCode } = await emailForm.validateFields(['newEmail', 'emailCode']);
      setEmailBusy((s) => ({ ...s, verify: true }));
      const res = await fetch('/user/email-auth/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: newEmail, code: emailCode }),
      });
      await handleMaybe401(res);
      const data = await res.json().catch(() => ({}));
      if (data?.result === '인증 성공') {
        setEmailVerified(true); setEmailHint('이메일 인증 완료');
        message.success('이메일 인증이 완료되었습니다.'); setEmailStep(2);
      } else { setEmailVerified(false); setEmailHint(data?.error_message || '인증 실패'); }
    } catch (e) {
      if (e.message !== 'REVERIFY') setEmailHint('인증코드를 입력해 주세요.');
    } finally { setEmailBusy((s) => ({ ...s, verify: false })); }
  };

  const changeEmail = async () => {
    if (!emailVerified) { setEmailHint('먼저 이메일 인증을 완료해 주세요.'); message.warning('먼저 이메일 인증을 완료해 주세요.'); return; }
    try {
      const { newEmail } = await emailForm.validateFields(['newEmail']);
      setEmailBusy((s) => ({ ...s, change: true }));
      const res = await fetch('/mypage/change-email', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ newEmail }),
      });
      await handleMaybe401(res);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.code) throw new Error(data?.error_message || '이메일 변경 실패');
      noti.success({ message: '이메일 변경 완료', description: '이후 알림/영수증은 새 메일로 발송됩니다.', placement: 'topRight' });
      setUser((prev) => ({ ...prev, email: newEmail }));
      setEmailVerified(false); setShowCodeRow(false); setLastEmailChangedAt(new Date());
      emailForm.resetFields(['emailCode']);
    } catch (e) {
      if (e.message !== 'REVERIFY') message.error(e.message || '이메일 변경 중 오류가 발생했습니다.');
    } finally { setEmailBusy((s) => ({ ...s, change: false })); }
  };

  const SecurityLevelTag = useMemo(() => {
    const map = {
      양호: { color: 'green', icon: <CheckCircleTwoTone twoToneColor="#52c41a" /> },
      주의: { color: 'gold', icon: <WarningTwoTone twoToneColor="#faad14" /> },
      위험: { color: 'red', icon: <StopTwoTone twoToneColor="#ff4d4f" /> },
    };
    const s = map[secLevel] || map['양호'];
    return <Space size={6}>{s.icon}<Tag color={s.color} className="sec-tag">{secLevel}</Tag></Space>;
  }, [secLevel]);

  return (
    <>
      {notiCtx}
      <Title level={3} style={{ marginBottom: 12 }}>프로필 관리</Title>

      {/* 보안 카드 */}
      <Card bordered={false} className="security-card"
            title={<Space><SafetyOutlined /> 계정 보안</Space>}
            extra={SecurityLevelTag}
            loading={secLoading}>
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <div className="sec-row">
              <Text type="secondary">보안 상태</Text>
              <span className="sec-pill">{secLevel}</span>
            </div>
          </Col>
          <Col span={24}>
            <div className="sec-row">
              <Text type="secondary">비밀번호 마지막 변경</Text>
              <Text>{lastPwdChangedAt ? fmtKo(lastPwdChangedAt) : '기록 없음'}</Text>
            </div>
          </Col>
          <Col span={24}>
            <div className="sec-row">
              <Text type="secondary">이메일 마지막 변경</Text>
              <Text>{lastEmailChangedAt ? fmtKo(lastEmailChangedAt) : '기록 없음'}</Text>
            </div>
          </Col>
        </Row>
        <Alert style={{ marginTop: 12 }} type="info" showIcon message="TIP"
               description="정기적인 비밀번호 변경과 2차 인증(가능 시)을 권장합니다." />
      </Card>

      <Row gutter={[16, 16]}>
        {/* 비밀번호 변경 */}
        <Col xs={24} lg={12}>
          <Card title={<span><SafetyOutlined /> 비밀번호 변경</span>} bordered={false}>
            <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item
                label="현재 비밀번호" name="currentPassword"
                rules={[{ required: true, message: '현재 비밀번호를 입력하세요.' }]}
              >
                <Input.Password placeholder="현재 비밀번호" autoComplete="current-password" />
              </Form.Item>

              <Form.Item
                label="새 비밀번호" name="newPassword"
                rules={[{ required: true, message: '새 비밀번호를 입력하세요.' }]} hasFeedback
              >
                <Input.Password
                  placeholder="새 비밀번호" autoComplete="new-password"
                  onChange={(e) => {
                    const s = passwordStrength(e.target.value || '');
                    const p = Math.round((s / 5) * 100);
                    setPwdMeter(p);
                  }}
                />
              </Form.Item>

              <div className="pwd-meter">
                <Progress
                  percent={pwdMeter || 0} showInfo={false} strokeWidth={8}
                  strokeColor={pwdMeter >= 70 ? '#52c41a' : pwdMeter >= 40 ? '#faad14' : '#ff4d4f'}
                  trailColor="#f4f6fb"
                />
                <span className="pwd-meter-hint">
                  안전도: {pwdMeter >= 70 ? '높음' : pwdMeter >= 40 ? '보통' : '낮음'}
                </span>
              </div>

              <Form.Item
                label="새 비밀번호 확인" name="confirmPassword" dependencies={['newPassword']} hasFeedback
                rules={[
                  { required: true, message: '새 비밀번호를 다시 입력하세요.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('새 비밀번호와 일치하지 않습니다.'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="새 비밀번호 확인" autoComplete="new-password" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={changingPwd}>비밀번호 변경</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* 이메일 변경 */}
        <Col xs={24} lg={12}>
          <Card title={<span><MailOutlined /> 이메일 변경</span>} bordered={false}>
            <Steps
              current={emailStep}
              items={[{ title: '이메일 입력' }, { title: '코드 인증' }, { title: '변경 완료' }]}
              size="small" className="email-steps"
            />

            <Form
              form={emailForm} layout="vertical"
              onValuesChange={(chg) => {
                if ('newEmail' in chg) {
                  setEmailVerified(false); setShowCodeRow(false); setEmailHint('');
                  setEmailStep(0); emailForm.resetFields(['emailCode']);
                }
              }}
            >
              <Form.Item
                label="새 이메일" name="newEmail"
                rules={[
                  { required: true, message: '새 이메일을 입력하세요.' },
                  { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
                ]}
              >
                <Input placeholder="name@example.com" autoComplete="email" />
              </Form.Item>

              <div className="verify-row">
                <Space wrap>
                  <Button onClick={sendEmailCode} loading={emailBusy.send} className="ghost-btn" disabled={resendSec > 0}>
                    {resendSec > 0 ? `재전송 (${resendSec}s)` : '인증코드 발송'}
                  </Button>
                  <Text type="secondary" className={`mini-hint ${emailHint ? 'show' : ''}`}>{emailHint}</Text>
                </Space>
              </div>

              {showCodeRow && (
                <>
                  <Form.Item
                    label="인증 코드" name="emailCode"
                    rules={[{ required: true, message: '메일로 받은 인증코드를 입력하세요.' }]}
                  >
                    {Input.OTP ? <Input.OTP length={6} disabled={emailVerified} /> : <Input maxLength={6} className="otp-fallback" placeholder="6자리" />}
                  </Form.Item>

                  <div className="verify-actions">
                    <Button onClick={verifyEmailCode} loading={emailBusy.verify}>인증확인</Button>
                    <Alert type={emailVerified ? 'success' : 'info'} showIcon
                           message={emailVerified ? '이메일 인증 완료' : '코드 입력 후 인증확인을 눌러주세요.'} />
                  </div>
                </>
              )}

              <Divider style={{ margin: '16px 0' }} />

              <Space>
                <Button type="primary" onClick={changeEmail} loading={emailBusy.change} disabled={!emailVerified}>
                  이메일 변경
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="tips-card">
        <Paragraph type="secondary" style={{ margin: 0 }}>
          로그인 알림 및 영수증은 등록된 이메일 주소로 발송됩니다. 이메일 변경 시 수신함/스팸함도 함께 확인해주세요.
        </Paragraph>
      </Card>

      {/* 401 재인증 모달 */}
      <Modal
        title={<Space><ExclamationCircleOutlined /> 본인 확인</Space>}
        open={verifyOpen} onOk={doReverify} okText="확인" confirmLoading={verifyBusy}
        onCancel={() => (!verifyBusy && setVerifyOpen(false))} maskClosable={!verifyBusy}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">보안상 확인이 필요합니다. 비밀번호를 한 번 더 입력해 주세요.</Text>
          <Input.Password value={verifyPw} onChange={(e) => setVerifyPw(e.target.value)} placeholder="비밀번호" />
          {verifyErr && <Alert type="error" showIcon message={verifyErr} />}
        </Space>
      </Modal>
    </>
  );
}
