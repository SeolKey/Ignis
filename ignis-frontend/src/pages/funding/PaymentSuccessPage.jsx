import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Typography, Card, Space, Result, Divider, Tag, message, Skeleton } from "antd";
import { CheckCircleTwoTone, FileTextOutlined, HomeOutlined, GiftOutlined, UserOutlined } from "@ant-design/icons";
import Layout from "../../components/Layout";
import "../../styles/funding/PaymentSuccessPage.css";

const { Text } = Typography;

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const qs = new URLSearchParams(location.search);
  const fundingId = qs.get("fundingId");
  const paidAmount = Number(qs.get("paidAmount") || 0);
  const merchantUid = qs.get("merchant_uid");
  const titleFromQS = qs.get("title");
  const buyerNameFromQS = qs.get("buyerName");
  const isAnonymous = qs.get("anonymous") === "1";

  const [loading, setLoading] = useState(!titleFromQS);
  const [title, setTitle] = useState(titleFromQS || "");
  const buyerName = isAnonymous ? "익명 참여자" : (buyerNameFromQS || "");

  // 제목 없으면 조회
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (titleFromQS || !fundingId) return;
      try {
        setLoading(true);
        const res = await fetch(`/funding/api/${fundingId}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setTitle(data?.title || data?.funding?.title || "");
      } catch (e) {
        console.error(e);
        message.error("펀딩 제목을 불러오지 못했어요.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [fundingId, titleFromQS]);

  // "펀딩 상세로 돌아가기" → 이전 경로 우선, 없으면 상세/홈 순
  const goBackToDetail = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (fundingId) navigate(`/funding/${fundingId}`);
    else navigate("/");
  };

  return (
    <Layout>
      <div className="fsuccess-wrap">
        <Card className="fsuccess-card" bordered={false}>
          <Result
            status="success"
            title="결제가 완료되었습니다 🎉"
            subTitle="참여 의사가 안전하게 접수되었습니다."
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          />

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <>
              <div className="fsuccess-detail">
                <div className="fsuccess-row">
                  <Text type="secondary">펀딩 제목</Text>
                  <Text strong className="fsuccess-ellipsis">{title || "-"}</Text>
                </div>

                <div className="fsuccess-row">
                  <Text type="secondary">결제 금액</Text>
                  <Text strong className="fsuccess-amount">₩ {paidAmount.toLocaleString()}</Text>
                </div>

                <div className="fsuccess-row">
                  <Text type="secondary">참여자</Text>
                  <Space>
                    <UserOutlined />
                    <Text strong>{buyerName || "익명 참여자"}</Text>
                  </Space>
                </div>

                {merchantUid && (
                  <div className="fsuccess-row">
                    <Text type="secondary">주문 번호</Text>
                    <Text code>{merchantUid}</Text>
                  </div>
                )}
              </div>

              <Divider />

              <div className="fsuccess-actions">
                <Space wrap>
                  <Button type="primary" size="large" shape="round" icon={<GiftOutlined />} onClick={goBackToDetail}>
                    펀딩 상세로 돌아가기
                  </Button>
                  <Button size="large" shape="round" icon={<HomeOutlined />} onClick={() => navigate("/")}>
                    홈으로
                  </Button>
                </Space>
              </div>

              <div className="fsuccess-tip">
                <Tag color="blue" bordered={false}>TIP</Tag>
                마이페이지 &gt; 펀딩 내역에서 영수증과 결제 상세정보를 다시 확인할 수 있어요.
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
