import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Card,
  Space,
  Result,
  Divider,
  Tag,
  message,
  Skeleton,
} from "antd";
import {
  CheckCircleTwoTone,
  FileTextOutlined,
  HomeOutlined,
  GiftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import "../../styles/donation/DonationPaymentSuccessPage.css";

const { Text } = Typography;

export default function DonationPaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const qs = new URLSearchParams(location.search);
  const donationId = qs.get("donationId");
  const paidAmount = Number(qs.get("paidAmount") || 0);
  const merchantUid = qs.get("merchant_uid");
  const buyerNameFromQS = qs.get("buyerName");
  const titleFromQS = qs.get("title");
  const isAnonymous = qs.get("anonymous") === "1";

  const [loading, setLoading] = useState(!titleFromQS);
  const [donationTitle, setDonationTitle] = useState(titleFromQS || "");
  const buyerName = isAnonymous ? "익명 기부자" : buyerNameFromQS || "";

  // 타이틀 없으면 API로 조회
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (titleFromQS || !donationId) return;
      try {
        setLoading(true);
        const res = await fetch(`/donation/api/${donationId}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setDonationTitle(data?.title || data?.donation?.title || "");
      } catch (e) {
        console.error(e);
        message.error("기부 제목을 불러오지 못했어요.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [donationId, titleFromQS]);

  // ✅ "기부 상세로 돌아가기" 버튼 동작 (이전 페이지 or 상세로 폴백)
  const goBackToDetail = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (donationId) {
      navigate(`/donation/${donationId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="donation-success-wrap">
        <Card className="donation-success-card modern-success" bordered={false}>
          <Result
            status="success"
            title="결제가 완료되었습니다 🎉"
            subTitle="소중한 마음, 안전하게 전달되었습니다."
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          />

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <>
              <div className="success-detail">
                <div className="success-row">
                  <Text type="secondary">기부 제목</Text>
                  <Text strong className="succ-ellipsis">
                    {donationTitle || "-"}
                  </Text>
                </div>

                <div className="success-row">
                  <Text type="secondary">결제 금액</Text>
                  <Text strong className="success-amount">
                    ₩ {paidAmount.toLocaleString()}
                  </Text>
                </div>

                <div className="success-row">
                  <Text type="secondary">기부 참여자</Text>
                  <Space>
                    <UserOutlined />
                    <Text strong>{buyerName || "익명 기부자"}</Text>
                  </Space>
                </div>

                {merchantUid && (
                  <div className="success-row">
                    <Text type="secondary">주문 번호</Text>
                    <Text code>{merchantUid}</Text>
                  </div>
                )}
              </div>

              <Divider />

              {/* 버튼 정렬 수정 */}
              <div className="success-actions">
                <Space wrap>
                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    icon={<GiftOutlined />}
                    onClick={goBackToDetail}
                  >
                    기부 상세로 돌아가기
                  </Button>

                  <Button
                    size="large"
                    shape="round"
                    icon={<HomeOutlined />}
                    onClick={() => navigate("/")}
                  >
                    홈으로
                  </Button>

                
                </Space>
              </div>

              <div className="success-tip">
                <Tag color="blue" bordered={false}>
                  TIP
                </Tag>
                마이페이지 &gt; 기부 내역에서 영수증과 결제 상세정보를 다시 확인할 수 있어요.
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
