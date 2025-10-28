import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import LoginWidget from "./home/LoginWidget"; // 홈에서 쓰던 그 위젯 그대로
import "../styles/home/Home.CSS"; // ✅ 페이지 CSS 대신 위젯 CSS를 사용

export default function LoginPage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/user/me", { credentials: "include" });
      if (!res.ok) {
        setMe(null);
        return;
      }
      const json = await res.json().catch(() => null);
      setMe(json || null);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 최초 유저 정보 로드
    fetchMe();
    // 다른 곳(위젯/콜백)에서 로그인 상태가 바뀌면 갱신
    const onAuthChanged = () => fetchMe();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, [fetchMe]);

  return (
    <Layout>
      {/* 필요하면 기존 페이지 배경/히어로 섹션 유지 가능 */}
      <div className="login-page">
        <div className="login-hero" />
        {/* ✅ 위젯을 그대로 삽입 (폼+소셜 버튼+로그인 상태 UI 모두 포함) */}
        <div className="login-card-wrap" style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}>
          <LoginWidget me={me} onUserChange={setMe} loading={loading} />
        </div>
      </div>
    </Layout>
  );
}
