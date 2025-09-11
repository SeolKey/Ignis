// src/pages/PaymentPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Input,
  Button,
  Radio,
  Space,
  Card,
  Checkbox,
  Divider,
  message,
} from "antd";
import "../styles/PaymentPage.css";
import Layout from "../components/Layout";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // URL 파라미터에서 기본값 주입 (예: /payment?type=funding&id=123&amount=10000)
  const typeParam = params.get("type") || "funding";
  const idParam = params.get("id");
  const amountParam = Number(params.get("amount") || 0);

  const [amount, setAmount] = useState(amountParam);
  const [paymentMethod, setPaymentMethod] = useState("kakaopay");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // PortOne init (한 번만)
  useEffect(() => {
    if (window.IMP && !window.__impInited) {
      window.IMP.init(import.meta.env.VITE_IAMPORT_ID); // .env의 VITE_IAMPORT_ID 사용
      window.__impInited = true;
    }
  }, []);

  const addAmount = (value) => setAmount((prev) => prev + value);

  const disabled = useMemo(() => {
    return !idParam || amount <= 0 || !agree || loading;
  }, [idParam, amount, agree, loading]);

  // PortOne 결제 요청
  const requestPay = async () => {
    if (paymentMethod !== "kakaopay") {
      message.info("현재는 카드/카카오페이(포트원)만 지원합니다.");
      return;
    }
    if (!idParam) {
      message.error("대상 ID가 없습니다. 상세 페이지에서 다시 시도해주세요.");
      return;
    }
    if (amount <= 0) {
      message.error("결제 금액을 입력해주세요.");
      return;
    }
    try {
      setLoading(true);

      // 1) 서버 사전등록: 주문번호(merchantUid) 생성 + 금액 검증 + READY 저장
      //    엔드포인트: POST /api/funding/react/{fundingId}/payments/ready
      const readyRes = await fetch(`http://localhost/api/payments/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "FUNDING", targetId: Number(idParam), amount }),
        credentials: "include", // (세션 사용 시 권장)
      });
      if (!readyRes.ok) throw new Error("결제 준비에 실패했습니다.");
      const ready = await readyRes.json(); // { merchantUid, amount, name, ... }

      // 2) 포트원 결제창 호출
      const IMP = window.IMP;
      IMP.request_pay(
        {
          pg: "html5_inicis",         // KG 이니시스(포트원)
          pay_method: "card",         // 또는 'kakaopay' 등
          merchant_uid: ready.merchantUid,
          name: ready.name || `[Funding] ${idParam}`,
          amount: ready.amount,       // 반드시 서버 금액 그대로
          // 모바일 환경이면 m_redirect_url 추가 가능
        },
        async (rsp) => {
          if (!rsp.success) {
            message.error(rsp.error_msg || "결제가 실패/취소되었습니다.");
            setLoading(false);
            return;
          }

          // 3) 서버 승인/검증: impUid/merchantUid 전달 → 승인 성공 시 DB PAID 처리
          const confirmRes = await fetch(`http://localhost/api/payment/react/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              impUid: rsp.imp_uid,
              merchantUid: rsp.merchant_uid,
            }),
            credentials: "include", // (세션 사용 시 권장)
          });
          if (!confirmRes.ok) {
            message.error("결제 승인에 실패했습니다.");
            setLoading(false);
            return;
          }

          // 4) 성공 이동 (상세페이지 복귀)
          navigate(`/funding/detail/${idParam}?paid=1`, { replace: true });
        }
      );
    } catch (e) {
      console.error(e);
      message.error(e.message || "결제 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="payment-content">
        <Card className="payment-card">
          <Title level={3}>결제하기</Title>

          <div className="section">
            <Text strong>대상</Text>
            <div style={{ marginTop: 6, color: "#666" }}>
              타입: {typeParam} / ID: {idParam || "-"}
            </div>
          </div>

          <Divider />

          <div className="section">
            <Text strong>결제 금액</Text>
            <Input
              prefix="₩"
              value={amount}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
                setAmount(Number(onlyNumber));
              }}
              style={{ marginTop: 8 }}
            />
            <Space style={{ marginTop: 12 }} wrap>
              <Button onClick={() => addAmount(1000)}>1,000원</Button>
              <Button onClick={() => addAmount(5000)}>5,000원</Button>
              <Button onClick={() => addAmount(10000)}>1만원</Button>
              <Button onClick={() => addAmount(100000)}>10만원</Button>
              <Button onClick={() => setAmount(0)}>직접입력</Button>
            </Space>
          </div>

          <Divider />

          <div className="section">
            <Text strong>결제 수단</Text>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
                <Card className="payment-option" bordered>
                  <Radio value="kakaopay">KC 결제하기</Radio>
                </Card>
                <Card className="payment-option" bordered>
                  <Radio value="account" disabled>
                    계좌이체 (준비중)
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </div>

          <Divider />

          <div className="section total-section">
            <Text strong>총 결제금액</Text>
            <Text className="total-amount">₩ {amount.toLocaleString()}</Text>
          </div>

          <Divider />

          <div className="section">
            <Text strong>결제 및 이용 동의</Text>
            <TextArea
              rows={4}
              placeholder="약관 내용을 여기에 넣을 수 있습니다"
              style={{ marginTop: 8 }}
            />
            <Checkbox style={{ marginTop: 12 }} checked={agree} onChange={(e) => setAgree(e.target.checked)}>
              결제 및 이용에 동의합니다. (필수)
            </Checkbox>
          </div>

          <Button
            className="payment-button"
            type="primary"
            block
            loading={loading}
            disabled={disabled}
            style={{ marginTop: 24 }}
            onClick={requestPay}
          >
            {loading ? "결제 준비 중..." : "결제하기"}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
