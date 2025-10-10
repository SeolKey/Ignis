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
  CalendarOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import "../../styles/funding/PaymentPage.css";

const { Title, Text, Paragraph } = Typography;

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // URL 파라미터
  const idParam = params.get("id"); // fundingId
  const amountParam = Number(params.get("amount") || 0);

  // 상태
  const [funding, setFunding] = useState(null);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState(amountParam || 10000);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agree, setAgree] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerTel, setBuyerTel] = useState("");

  // 펀딩 정보 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        if (!idParam) return;

        // 기본 엔드포인트
        const tryFetch = async (url) => {
          const res = await fetch(url, {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        };

        let data;
        try {
          // 1순위: api
          data = await tryFetch(`/funding/api/${idParam}`);
        } catch {
          try {
            // 2순위: react/detail (프로젝트 호환)
            data = await tryFetch(`/funding/react/detail/${idParam}`);
          } catch {
            data = {};
          }
        }

        const f =
          data?.funding ??
          data?.data ??
          data ??
          null;

        if (!ignore) setFunding(f);
      } catch (e) {
        console.error(e);
        message.error("펀딩 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [idParam]);

  // PortOne(아임포트) 초기화
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
    () => !idParam || amount <= 0 || !agree || loading,
    [idParam, amount, agree, loading]
  );

  const target = Number(funding?.maxPrice || funding?.targetAmount || 0);
  const current = Number(funding?.currentPrice || funding?.currentAmount || 0);
  const progress = target ? Math.min(100, Math.floor((current * 100) / target)) : 0;

  // 결제 요청
  const requestPay = async () => {
    if (!idParam) return message.error("펀딩 ID가 없습니다.");
    if (amount <= 0) return message.error("결제 금액을 입력해주세요.");

    try {
      setLoading(true);

      // 1) 서버 사전등록 (백엔드 규약에 맞춰 사용)
      const prepRes = await fetch("/api/payments/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetType: "FUNDING",
          targetId: Number(idParam),
          amount,
          buyerName: isAnonymous ? "" : buyerName,
          buyerEmail: isAnonymous ? "" : buyerEmail,
          buyerTel: isAnonymous ? "" : buyerTel,
          name: `[Funding] ${funding?.title || idParam}`,
        }),
      });
      if (!prepRes.ok) throw new Error("결제 준비에 실패했습니다.");
      const prep = await prepRes.json(); // { merchantUid, amount, name, ... }

      // 2) 포트원 결제창
      const IMP = window.IMP;
      if (!IMP) throw new Error("PortOne SDK 초기화 실패");
      IMP.request_pay(
        {
          pg: "html5_inicis",
          pay_method: paymentMethod,
          merchant_uid: prep.merchantUid,
          name: prep.name || `[Funding] ${idParam}`,
          amount: prep.amount ?? amount,
          buyer_name: isAnonymous ? "익명 참여자" : buyerName || "",
          buyer_email: isAnonymous ? "" : buyerEmail || "",
          buyer_tel: isAnonymous ? "" : buyerTel || "",
        },
        async (rsp) => {
          if (!rsp.success) {
            message.error(rsp.error_msg || "결제가 실패/취소되었습니다.");
            setLoading(false);
            return;
          }

          // 3) 서버 완료 알림
          const payload = {
            imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid,
            fundingId: idParam,
            paidAmount: rsp.paid_amount,
            payMethod: rsp.pay_method,
          };

          try {
            const completeRes = await fetch(`/api/payments/webhook`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            });
            if (!completeRes.ok) throw new Error("결제 완료 처리 실패");

            // 4) 성공 페이지 이동 (제목/이름/익명 여부 전달)
            const q = new URLSearchParams({
              fundingId: String(idParam),
              imp_uid: rsp.imp_uid,
              merchant_uid: rsp.merchant_uid,
              paidAmount: String(rsp.paid_amount ?? ""),
              payMethod: String(rsp.pay_method ?? ""),
              title: funding?.title || "",
              buyerName: isAnonymous ? "" : (buyerName || ""),
              anonymous: isAnonymous ? "1" : "0",
            }).toString();
            navigate(`/funding/participate-complete?${q}`, { replace: true });
          } catch (err) {
            console.error(err);
            message.error("결제 완료 처리 중 오류가 발생했습니다.");
          } finally {
            setLoading(false);
          }
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
      <div className="fpay-wrap">
        {/* 단계 표시 */}
        <div className="fpay-steps">
          <Steps current={1} items={[{ title: "상세보기" }, { title: "결제" }, { title: "완료" }]} />
        </div>

        <Row gutter={[24, 24]}>
          {/* 좌측: 결제 폼 */}
          <Col xs={24} md={14} lg={15}>
            <Card className="fpay-card">
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <>
                  <div className="fpay-head">
                    <div className="fpay-title-row">
                      <Title level={4} className="fpay-title">
                        {funding?.title || "펀딩 프로젝트"}
                      </Title>
                      <Space size={8} wrap>
                        {target > 0 && (
                          <Tag color="blue" bordered={false}>
                            <CalendarOutlined /> 진행률 {progress}%
                          </Tag>
                        )}
                        {target > 0 && (
                          <Tag color="default" bordered={false}>
                            목표 {formatWon(target)}
                          </Tag>
                        )}
                      </Space>
                    </div>

                    {target > 0 && (
                      <>
                        <Progress percent={progress} showInfo={false} />
                        <div className="fpay-progress-meta">
                          <span>{formatWon(current)}</span>
                          <span>{formatWon(target)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Divider />

                  {/* 금액 */}
                  <div className="fpay-section">
                    <div className="fpay-section-head">
                      <Title level={5}>참여 금액</Title>
                      <Tooltip title="원터치로 금액을 빠르게 선택하세요">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <InputNumber
                      size="large"
                      className="fpay-amount"
                      min={1}
                      step={1000}
                      value={amount}
                      onChange={(v) => setAmount(Number(v || 0))}
                      formatter={(v) =>
                        `₩ ${String(v || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                      }
                      parser={(v) => Number(String(v).replace(/[^\d]/g, ""))}
                    />
                    <Space wrap className="fpay-quick">
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

                  {/* 참여자 정보 */}
                  <div className="fpay-section">
                    <div className="fpay-section-head">
                      <Title level={5}>참여자 정보</Title>
                      <Tag icon={<SafetyOutlined />} color="success">
                        안전하게 암호화
                      </Tag>
                    </div>

                    <Checkbox
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      style={{ marginBottom: 12 }}
                    >
                      익명으로 참여하기
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
                  <div className="fpay-section">
                    <div className="fpay-section-head">
                      <Title level={5}>결제 수단</Title>
                    </div>
                    <Radio.Group
                      className="fpay-pay-methods"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Card
                          className={`fpay-pay-card ${paymentMethod === "card" ? "active" : ""}`}
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
                        <Card className="fpay-pay-card" hoverable>
                          <Radio value="account" disabled>
                            계좌이체
                          </Radio>
                        </Card>
                      </Space>
                    </Radio.Group>
                  </div>

                  <Divider />

                  {/* 약관 */}
                  <div className="fpay-section">
                    <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                      결제 및 이용 약관에 동의합니다. (필수)
                    </Checkbox>
                    <Paragraph className="fpay-terms">
                      결제는 PortOne/이니시스를 통해 안전하게 처리됩니다. 취소/환불 규정은
                      해당 펀딩 프로젝트 정책을 따릅니다.
                    </Paragraph>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="fpay-submit"
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

          {/* 우측: 요약 스티키 */}
          <Col xs={24} md={10} lg={9}>
            <Affix offsetTop={88}>
              <Card className="fpay-summary" title="결제 요약" bordered>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                  <>
                    <div className="fpay-summary-row">
                      <Text type="secondary">프로젝트</Text>
                      <Text strong className="fpay-ellipsis">{funding?.title || "-"}</Text>
                    </div>

                    {target > 0 && (
                      <>
                        <div className="fpay-summary-row">
                          <Text type="secondary">목표 금액</Text>
                          <Text>{formatWon(target)}</Text>
                        </div>
                        <div className="fpay-summary-row">
                          <Text type="secondary">현재 금액</Text>
                          <Text>{formatWon(current)}</Text>
                        </div>
                        <Divider />
                      </>
                    )}

                    <div className="fpay-summary-row total">
                      <Text strong>총 결제금액</Text>
                      <Text strong className="fpay-total">{formatWon(amount)}</Text>
                    </div>

                    <Divider />

                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Button onClick={() => setAmount((v) => v + 1000)} block>
                        1,000원 더하기
                      </Button>
                      <Button ghost block onClick={() => window.history.back()}>
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
