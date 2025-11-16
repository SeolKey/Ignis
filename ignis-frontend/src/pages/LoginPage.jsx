import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import LoginWidget from "./home/LoginWidget";
import "../styles/home/Home.CSS";

export default function LoginPage() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            setLoading(true);

            // ⭐ 절대 origin 사용 금지 — 상대 경로로 고정 (메인 페이지 방식과 동일)
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
        fetchMe();

        const onAuthChanged = () => fetchMe();
        window.addEventListener("auth:changed", onAuthChanged);
        return () => window.removeEventListener("auth:changed", onAuthChanged);
    }, [fetchMe]);

    return (
        <Layout>
            <div className="login-page">
                <div className="login-hero" />
                <div
                    className="login-card-wrap"
                    style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}
                >
                    <LoginWidget me={me} onUserChange={setMe} loading={loading} />
                </div>
            </div>
        </Layout>
    );
}
