// ============================
// LoginPage.jsx (refreshed)
// ============================
import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Card, Divider, Flex, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import Layout from "../components/Layout";
import "../styles/LoginPage.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const form = new URLSearchParams();
      form.append("userLoginId", values.username);
      form.append("password", values.password);
      form.append("rememberMe", values.remember || false);

      const res = await fetch("/user/do-login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        credentials: "include",
      });

      const data = await res.json();
      if (data.result === "성공") {
        const meRes = await fetch("/user/me", { credentials: "include" });
        if (!meRes.ok) {
          message.error("세션 확인 실패. CORS/쿠키 설정을 확인하세요.");
          setLoading(false);
          return;
        }
        const me = await meRes.json();
        localStorage.setItem("userId", me.userId ?? data.userId);
        localStorage.setItem("username", me.userName ?? data.username);
        message.success("환영합니다 👋");
        navigate("/");
      } else {
        message.error(data.error_message ?? "로그인에 실패했습니다");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      message.error("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:80/oauth2/authorization/google";
  };
  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:80/oauth2/authorization/kakao";
  };

  return (
    <Layout>
      <div className="login-page">
        <div className="login-hero" />
        <Card className="login-card" bordered={false}>
          <Flex vertical gap={4} align="center" style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>로그인</Title>
            <Text type="secondary">계정 정보를 입력해 주세요</Text>
          </Flex>

          <Form
            layout="vertical"
            name="login-form"
            onFinish={onFinish}
            requiredMark={false}
            className="login-form"
          >
            <Form.Item
              label="아이디"
              name="username"
              rules={[
                { required: true, message: "아이디를 입력해 주세요." },
                { min: 3, message: "아이디는 3자 이상" },
              ]}
            >
              <Input size="large" placeholder="아이디" prefix={<UserOutlined />} allowClear />
            </Form.Item>

            <Form.Item
              label="비밀번호"
              name="password"
              rules={[{ required: true, message: "비밀번호를 입력해 주세요." }]}
            >
              <Input.Password size="large" placeholder="비밀번호" prefix={<LockOutlined />} />
            </Form.Item>

            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>아이디 저장</Checkbox>
              </Form.Item>
              <Link to="/find-password" className="link subtle">비밀번호 찾기</Link>
            </Flex>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              로그인
            </Button>
          </Form>

          <Divider plain>또는</Divider>

          <Flex vertical gap={8}>
            <Button size="large" block icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
              Google로 계속하기
            </Button>
            <Button size="large" block className="kakao" onClick={handleKakaoLogin}>
              <span className="kakao-dot" /> Kakao로 계속하기
            </Button>
          </Flex>

          <Divider style={{ margin: 16 }} />

          <div className="signup-line">
            <Text type="secondary">아직 회원이 아니신가요?</Text>
            <Link to="/signup" className="link">회원가입</Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
