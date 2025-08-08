import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';  // useNavigate import
import Layout from '../components/Layout'; 
import '../styles/LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();  // navigate 사용

  useEffect(() => {
    // 카카오 SDK 로드
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // 카카오 SDK 초기화
      window.Kakao.init('YOUR_KAKAO_APP_KEY');
    };
  }, []);

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
        credentials: 'include' // 세션 유지
      });

      const data = await res.json();

      if (data.result === '성공') {
        localStorage.setItem('username', data.username);
        navigate('/');  // 로그인 성공 후 홈으로 리디렉션
      } else {
        alert("로그인 실패: " + data.error_message);
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:80/oauth2/authorization/google';  // 구글 로그인 리디렉션
  };

  const handleKakaoLogin = () => {
    window.Kakao.Auth.login({
      success: (authObj) => {
        console.log(authObj);
        fetch('/user/kakao-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: authObj.access_token,
          }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.result === '성공') {
              navigate('/');  // 카카오 로그인 후 홈으로 리디렉션
            } else {
              alert('로그인 실패');
            }
          })
          .catch(error => {
            console.error('로그인 오류:', error);
          });
      },
      fail: (err) => {
        console.error(err);
      },
    });
  };

  return (
    <Layout>
      <div className="login-wrapper">
        <div className="login-container">
          <Title level={3}>로그인</Title>
          <Text type="secondary">계정 정보를 입력하여 로그인해 주세요.</Text>

          {/* 로그인 폼 */}
          <Form layout="vertical" onFinish={onFinish} className="login-form">
            <Form.Item
              label="아이디"
              name="username"
              rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}>
              <Input placeholder="아이디를 입력하세요" />
            </Form.Item>

            <Form.Item
              label="비밀번호"
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}>
              <Input.Password placeholder="비밀번호를 입력하세요" />
            </Form.Item>

            <div className="login-options">
              {/* 로그인 상태 유지 체크박스 */}
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>아이디 저장</Checkbox>
              </Form.Item>
              {/* 비밀번호 찾기 링크 */}
              <Link className="find-password" to="/find-password">비밀번호 찾기</Link>
            </div>

            {/* 로그인 버튼 */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                로그인
              </Button>
            </Form.Item>
          </Form>

          <div className="signup-text">
            아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
          </div>

          {/* 구글 로그인 버튼 */}
          <div className="google-login-btn">
            <button onClick={handleGoogleLogin} className="google-btn">
              구글 로그인
            </button>
          </div>

          {/* 카카오 로그인 버튼 */}
          <div className="kakao-login-btn">
            <button onClick={handleKakaoLogin} className="kakao-btn">
              카카오 로그인
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
