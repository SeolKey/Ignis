import React from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const onFinish = async (values) => {
    try {
      const form = new URLSearchParams();
      form.append('userLoginId', values.username);
      form.append('password', values.password);
      form.append('rememberMe', values.remember || false);

      const res = await fetch('/user/do-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });

      const data = await res.json();

      if (data.result === '성공') {
        window.location.href = '/user/welcome'; // 로그인 성공 시 이동할 페이지
      } else if (data.code === 403) {
        alert(data.error_message);
      } else {
        alert('서버 오류입니다. 관리자에게 문의하세요.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      alert('네트워크 오류가 발생했습니다.');
    }

  };


  return (
    <Layout>
      <div className="login-container">
        <div className="login-box">
          <Title level={3}>로그인</Title>
          <Text type="secondary">계정 정보를 입력하여 로그인해 주세요.</Text>

          <Form layout="vertical" onFinish={onFinish} className="login-form">
            <Form.Item
              label="아이디"
              name="username"
              rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}
            >
              <Input placeholder="아이디를 입력하세요" />
            </Form.Item>

            <Form.Item
              label="비밀번호"
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}
            >
              <Input.Password placeholder="비밀번호를 입력하세요" />
            </Form.Item>

            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>아이디 저장</Checkbox>
              </Form.Item>
              <Link className="find-password" to="/find-password">비밀번호 찾기</Link>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                로그인
              </Button>
            </Form.Item>
          </Form>

          <div className="signup-text">
            아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;