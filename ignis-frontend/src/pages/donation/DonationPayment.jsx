import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Typography,
  InputNumber,
  Input,
  Button,
  Radio,
  Space,
  Card,
  Checkbox,
  Divider,
  message,
  Row,
  Col,
  Steps,
  Tag,
  Tooltip,
  Progress,
  Skeleton,
  Affix,
} from "antd";
import {
  CreditCardOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  GiftOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import "../../styles/donation/DonationPayment.css";
import Layout from "../../components/Layout";

const { Title, Text, Paragraph } = Typography;

export default function DonationPayment() {
  const [params] = useSearchParams();
  const donationId = params.get("id");
  const amountParam = Number(params.get("amount") || 0);

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 결제 폼 상태
  const [amount, setAmount] = useState(amountParam || 10000);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agree, setAgree] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerTel, setBuyerTel] = useState("");

  const navigate = useNavigate();

  // 프로젝트 정보 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        if (!donationId) return;
        const res = await fetch(`/donation/api/${donationId}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setDonation(data);
      } catch (e) {
        console.error(e);
        message.error("프로젝트 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [donationId]);

  // PortOne(아임포트) init — .env: VITE_IAMPORT_ID=impXXXX
  useEffect(() => {
    const IMP = window.IMP;
    const IMP_CODE = import.meta.env.VITE_IAMPORT_ID;
    if (!IMP || !IMP_CODE) return;
    if (!window.__impInited) {
      IMP.init(IMP_CODE);
      window.__impInited = true;
    }
  }, []);

  const formatWon = (n) => `₩ ${Number(n || 0).toLocaleString()}`;
  const disabled = useMemo(
    () => !donationId || amount <= 0 || !agree || loading,
    [donationId, amount, agree, loading]
  );

  const target = Number(donation?.maxPrice || 0);
  const current = Number(donation?.currentPrice || 0);
  const progress = target ? Math.min(100, Math.floor((current * 100) / target)) : 0;

  // 결제 요청
  const requestPay = async () => {
    if (!donationId) return message.error("기부 대상 ID가 없습니다.");
    if (amount <= 0) return message.error("결제 금액을 입력해주세요.");

    try {
      setLoading(true);

      // 서버 사전등록
      const form = new URLSearchParams();
      form.append("donationId", String(donationId));
      form.append("amount", String(amount));
      if (buyerName) form.append("buyerName", buyerName);
      if (buyerEmail) form.append("buyerEmail", buyerEmail);
      if (buyerTel) form.append("buyerTel", buyerTel);
      if (isAnonymous) form.append("anonymous", "true");

      const prepRes = await fetch("/api/payment/donation/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form,
        credentials: "include",
      });

      if (!prepRes.ok) throw new Error(`결제 준비 실패 (HTTP ${prepRes.status})`);
      const raw = await prepRes.json();
      const prep = raw?.data ?? raw;

      const merchantUid = prep.merchantUid ?? prep.merchant_uid ?? prep.orderId;
      const readyAmount = Number(prep.amount ?? prep.totalAmount);
      const title = prep.name ?? prep.orderName ?? `[Donation] ${donationId}`;
      if (!merchantUid || !readyAmount) throw new Error("사전등록 응답에 필수 필드가 없습니다.");

      const IMP = window.IMP;
      if (!IMP) throw new Error("PortOne SDK 초기화 실패");

      IMP.request_pay(
        {
          pg: "html5_inicis",
          pay_method: paymentMethod,
          merchant_uid: merchantUid,
          name: title,
          amount: readyAmount,
          buyer_name: isAnonymous ? "익명 기부자" : buyerName || "",
          buyer_email: isAnonymous ? "" : buyerEmail || "",
          buyer_tel: isAnonymous ? "" : buyerTel || "",
        },
        (rsp) => {
          if (!rsp.success) {
            message.error(rsp.error_msg || "결제가 실패/취소되었습니다.");
            setLoading(false);
            return;
          }

          const completeForm = new URLSearchParams();
          completeForm.append("impUid", rsp.imp_uid);
          completeForm.append("merchantUid", rsp.merchant_uid);
          completeForm.append("donationId", String(donationId));

          fetch("/api/payment/donation/complete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: completeForm,
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.result === "success") {
                const q = new URLSearchParams({
                  imp_uid: rsp.imp_uid,
                  merchant_uid: rsp.merchant_uid,
                  donationId: String(donationId),
                  paidAmount: String(rsp.paid_amount ?? ""),
                  payMethod: String(rsp.pay_method ?? ""),
                }).toString();
                navigate("/donation-payment-success?" + q, { replace: true });
              } else {
                message.error(data?.error_message || "서버 완료 처리에 실패했습니다.");
              }
            })
            .catch((err) => {
              console.error(err);
              message.error("서버 완료 처리 중 오류가 발생했습니다.");
            })
            .finally(() => setLoading(false));
        }
      );
    } catch (e) {
      console.error(e);
      message.error(e.message || "결제 요청 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="donation-payment-wrap">
        {/* 상단 단계 안내 */}
        <div className="donation-payment-steps">
          <Steps
            current={1}
            items={[
              { title: "상세보기" },
              { title: "결제" },
              { title: "완료" },
            ]}
          />
        </div>

        <Row gutter={[24, 24]}>
          {/* 좌측: 결제 폼 */}
          <Col xs={24} md={14} lg={15}>
            <Card className="dp-card">
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <>
                  <div className="dp-head">
                    <div className="dp-title-row">
                      <Title level={4} className="dp-title">
                        {donation?.title || "프로젝트"}
                      </Title>
                      <Space size={8} wrap>
                        <Tag color="blue" bordered={false}>
                          <CalendarOutlined /> 진행률 {progress}%
                        </Tag>
                        <Tag color="default" bordered={false}>
                          목표 {formatWon(target)}
                        </Tag>
                      </Space>
                    </div>
                    <Progress percent={progress} showInfo={false} />
                    <div className="dp-progress-meta">
                      <span>{formatWon(current)}</span>
                      <span>{formatWon(target)}</span>
                    </div>
                  </div>

                  <Divider />

                  {/* 금액 */}
                  <div className="dp-section">
                    <div className="dp-section-head">
                      <Title level={5}>기부 금액</Title>
                      <Tooltip title="원터치로 금액을 빠르게 선택하세요">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <InputNumber
                      size="large"
                      className="dp-amount"
                      min={1}
                      step={1000}
                      value={amount}
                      onChange={(v) => setAmount(Number(v || 0))}
                      formatter={(v) =>
                        `₩ ${String(v || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                      }
                      parser={(v) => Number(String(v).replace(/[^\d]/g, ""))}
                    />
                    <Space wrap className="dp-quick">
                      {[1000, 5000, 10000, 30000, 50000, 100000].map((v) => (
                        <Button key={v} onClick={() => setAmount(v)}>
                          {v.toLocaleString()}원
                        </Button>
                      ))}
                      <Button onClick={() => setAmount(0)} type="text">
                        직접 입력
                      </Button>
                    </Space>
                  </div>

                  <Divider />

                  {/* 기부자 정보 */}
                  <div className="dp-section">
                    <div className="dp-section-head">
                      <Title level={5}>기부자 정보</Title>
                      <Tag icon={<SafetyOutlined />} color="success">
                        안전하게 암호화
                      </Tag>
                    </div>

                    <Checkbox
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      style={{ marginBottom: 12 }}
                    >
                      익명으로 기부하기
                    </Checkbox>

                    {!isAnonymous && (
                      <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Input
                          size="large"
                          placeholder="이름 (선택)"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                        />
                        <Input
                          size="large"
                          placeholder="이메일 (선택)"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                        />
                        <Input
                          size="large"
                          placeholder="연락처 (선택)"
                          value={buyerTel}
                          onChange={(e) => setBuyerTel(e.target.value)}
                        />
                      </Space>
                    )}
                  </div>

                  <Divider />

                  {/* 결제 수단 */}
                  <div className="dp-section">
                    <div className="dp-section-head">
                      <Title level={5}>결제 수단</Title>
                    </div>
                    <Radio.Group
                      className="dp-pay-methods"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Card
                          className={`dp-pay-card ${
                            paymentMethod === "card" ? "active" : ""
                          }`}
                          onClick={() => setPaymentMethod("card")}
                          hoverable
                        >
                          <Radio value="card">
                            <Space align="center">
                              <CreditCardOutlined />
                              <span>카드 결제 (PortOne)</span>
                            </Space>
                          </Radio>
                        </Card>
                        <Card className="dp-pay-card" hoverable>
                          <Radio value="account" disabled>
                            계좌이체
                          </Radio>
                        </Card>
                      </Space>
                    </Radio.Group>
                  </div>

                  <Divider />

                  {/* 약관 */}
                  <div className="dp-section">
                    <Checkbox
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    >
                      결제 및 이용 약관에 동의합니다. (필수)
                    </Checkbox>
                    <Paragraph className="dp-terms">
                      결제는 PortOne/이니시스를 통해 안전하게 처리됩니다. 결제 취소/환불
                      규정은 프로젝트 정책을 따릅니다.
                    </Paragraph>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="dp-submit"
                    loading={loading}
                    disabled={disabled}
                    onClick={requestPay}
                  >
                    {loading ? "결제 준비 중..." : "결제하기"}
                  </Button>
                </>
              )}
            </Card>
          </Col>

          {/* 우측: 요약/스티키 박스 */}
          <Col xs={24} md={10} lg={9}>
            <Affix offsetTop={88}>
              <Card className="dp-summary" title="결제 요약" bordered>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                  <>
                    <div className="dp-summary-row">
                      <Text type="secondary">프로젝트</Text>
                      <Text strong className="dp-ellipsis">{donation?.title || "-"}</Text>
                    </div>
                    <div className="dp-summary-row">
                      <Text type="secondary">목표 금액</Text>
                      <Text>{formatWon(target)}</Text>
                    </div>
                    <div className="dp-summary-row">
                      <Text type="secondary">현재 금액</Text>
                      <Text>{formatWon(current)}</Text>
                    </div>

                    <Divider />

                    <div className="dp-summary-row total">
                      <Text strong>총 결제금액</Text>
                      <Text strong className="dp-total">{formatWon(amount)}</Text>
                    </div>

                    <Divider />

                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Button
                        icon={<GiftOutlined />}
                        onClick={() => setAmount((v) => v + 1000)}
                        block
                      >
                        1,000원 더하기
                      </Button>
                      <Button
                        onClick={() => window.history.back()}
                        ghost
                        block
                      >
                        뒤로가기
                      </Button>
                    </Space>
                  </>
                )}
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
