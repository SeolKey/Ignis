import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/SignupPage.css';

const { Title, Text } = Typography;

const SignupPage = () => {
  const [form] = Form.useForm();
  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailCodeField, setShowEmailCodeField] = useState(false);

  const sendEmailCode = async () => {
    const email = form.getFieldValue('email');
    console.log('[이메일 인증 요청]', email); // 디버깅용 로그

    if (!email) return alert('이메일을 입력해주세요.');

    const res = await fetch('/user/email-auth/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email }),
    });

    if (res.ok) {
      alert('인증코드가 이메일로 전송되었습니다. 3분 내에 입력해주세요.');
      setShowEmailCodeField(true);
    } else {
      alert('인증코드 전송 실패');
    }
  };

  const verifyEmailCode = async () => {
    const email = form.getFieldValue('email');
    const code = form.getFieldValue('emailCode');
    if (!code) return alert('인증코드를 입력해주세요.');

    const res = await fetch('/user/email-auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, code }),
    });

    const data = await res.json();
    if (data.result === '인증 성공') {
      setEmailVerified(true);
      alert('이메일 인증이 완료되었습니다.');
    } else {
      alert(data.error_message || '인증 실패');
    }
  };

  const onFinish = async (values) => {
    const { username, password, confirm, name, phone, email } = values;

    if (!emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    if (password !== confirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await fetch('/user/do-sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userLoginId: username,
          password,
          name,
          phoneNumber: phone,
          email,
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.warn('응답 본문이 JSON 형식이 아닙니다:', text);
      }

      if (data.result === '회원가입 성공') {
        alert('회원가입 성공!');
        window.location.href = '/user/login';
      } else {
        alert(data.error_message || '회원가입 실패');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <Layout>
      <div className="signup-container">
        <div className="signup-box">
          <Title level={3}>회원가입</Title>
          <Text type="secondary">필수 정보를 입력하여 회원가입을 완료해 주세요.</Text>

          <Form layout="vertical" form={form} onFinish={onFinish} className="signup-form">
            <Form.Item label="아이디" name="username" rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}> 
              <div className="username-row">
                <Input placeholder="영문, 숫자 5~20자" />
                <Button>중복확인</Button>
              </div>
            </Form.Item>

            <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}> 
              <Input.Password placeholder="영문, 숫자, 특수문자 조합 8~20자" />
            </Form.Item>

            <Form.Item label="비밀번호 확인" name="confirm" dependencies={['password']} rules={[{ required: true, message: '비밀번호를 다시 입력해 주세요.' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject('비밀번호가 일치하지 않습니다.'); }, })]}> 
              <Input.Password placeholder="비밀번호를 다시 입력하세요" />
            </Form.Item>

            <Form.Item label="이름" name="name" rules={[{ required: true, message: '이름을 입력해 주세요.' }]}> 
              <Input placeholder="이름을 입력하세요" />
            </Form.Item>

            <Form.Item label="전화번호" name="phone" rules={[{ required: true, message: '전화번호를 입력해 주세요.' }]}> 
              <Input placeholder="'-' 없이 숫자만 입력하세요" />
            </Form.Item>

            <Form.Item label="이메일" name="email" rules={[{ required: true, type: 'email', message: '유효한 이메일 주소를 입력해 주세요.' }]}> 
              <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="example@email.com" />
                <Button onClick={sendEmailCode}>인증요청</Button>
              </Space.Compact>
            </Form.Item>

            {showEmailCodeField && (
              <Form.Item label="인증 코드" name="emailCode">
                <Space.Compact style={{ width: '100%' }}>
                  <Input placeholder="인증코드를 입력하세요" />
                  <Button onClick={verifyEmailCode}>인증확인</Button>
                </Space.Compact>
              </Form.Item>
            )}

            <Form.Item label="개인정보 수집 및 이용 동의"> 
              <Input.TextArea rows={4} readOnly defaultValue="개인정보 수집 및 이용에 대한 내용이 여기에 표시됩니다." />
              <Checkbox required style={{ marginTop: 8 }}>개인정보 수집 및 이용에 동의합니다. (필수)</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                회원가입
              </Button>
            </Form.Item>
          </Form>

          <div className="login-text">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
