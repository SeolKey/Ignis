import React from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const form = new URLSearchParams();
            form.append('userLoginId', values.username);
            form.append('password', values.password);
            form.append('rememberMe', values.remember || false);

            // ⬇️ 로그인 요청(세션 쿠키 수신)
            const res = await fetch('/user/do-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: form.toString(),
                credentials: 'include', // ★ 세션 유지
            });

            const data = await res.json();

            if (data.result === '성공') {
                // ⬇️ 로그인 직후 서버 세션 기반 사용자 정보 복구
                const meRes = await fetch('/user/me', { credentials: 'include' });
                if (!meRes.ok) {
                    alert('세션 확인 실패(401/에러). CORS/쿠키 설정을 확인하세요.');
                    return;
                }
                const me = await meRes.json();

                // ⬇️ 클라이언트 상태 저장(필요 시 Context/Redux로 대체)
                localStorage.setItem('userId', me.userId ?? data.userId);
                localStorage.setItem('username', me.userName ?? data.username);

                // ⬇️ 이동
                navigate('/');
            } else {
                alert('로그인 실패: ' + (data.error_message ?? '알 수 없는 오류'));
            }
        } catch (err) {
            console.error('로그인 오류:', err);
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:80/oauth2/authorization/google';
    };
    const handleKakaoLogin = () => {
        window.location.href = 'http://localhost:80/oauth2/authorization/kakao';
    };

    return (
        <Layout>
            <div className="login-wrapper">
                <div className="login-container">
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
                            <Link className="find-password" to="/find-password">
                                비밀번호 찾기
                            </Link>
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

                    <div className="google-login-btn">
                        <button onClick={handleGoogleLogin} className="google-btn">
                            구글 로그인
                        </button>
                    </div>

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
