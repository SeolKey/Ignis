import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import "../../styles/funding/PaymentPage.css";
import Layout from "../../components/Layout";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const typeParam = params.get("type") || "funding";
  const idParam = params.get("id");
  const amountParam = Number(params.get("amount") || 0);

  const [amount, setAmount] = useState(amountParam);
  const [paymentMethod, setPaymentMethod] = useState("kakaopay");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.IMP && !window.__impInited) {
      window.IMP.init(import.meta.env.VITE_IAMPORT_ID);
      window.__impInited = true;
    }
  }, []);

  // 결제 금액에 값 추가하기 (버튼 클릭 시)
  const addAmount = (value) => setAmount((prev) => prev + value);

  // 버튼 비활성화 조건
  const disabled = useMemo(() => {
    return !idParam || amount <= 0 || !agree || loading;
  }, [idParam, amount, agree, loading]);

  // 결제 요청 함수
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

      // 결제 준비 요청
      const readyRes = await fetch(`/api/payments/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "FUNDING",  // 펀딩
          targetId: Number(idParam),  // 펀딩 ID
          amount: amount,  // 결제 금액
          buyerName: "구매자 이름",  // 예시로 넣은 값
          buyerEmail: "buyer@example.com",  // 예시로 넣은 값
          buyerTel: "010-1234-5678",  // 예시로 넣은 값
        }),
        credentials: "include",  // 세션 사용 시
      });

      if (!readyRes.ok) throw new Error("결제 준비에 실패했습니다.");
      const ready = await readyRes.json(); // { merchantUid, amount, name, ... }

      const IMP = window.IMP;
      IMP.request_pay(
  {
    pg: "html5_inicis",       // PG사
    pay_method: "card",       // 결제 방법 (카드)
    merchant_uid: ready.merchantUid,  // 주문 고유 ID
    name: ready.name || `[Funding] ${idParam}`,  // 펀딩 이름
    amount: ready.amount,     // 결제 금액
    buyer_name: ready.buyerName || '',
    buyer_email: ready.buyerEmail || '',
    buyer_tel: ready.buyerTel || ''
  },
  async (rsp) => {  // 결제 성공/실패 후 호출되는 콜백 함수
    if (rsp.success) {
      // 결제 성공 후 결제 정보 콘솔에 출력
      console.log("결제 성공!");
      console.log("결제 정보:", rsp);  // 결제 정보 전체 출력
      console.log("imp_uid:", rsp.imp_uid);
      console.log("merchant_uid:", rsp.merchant_uid);
      console.log("결제 금액:", rsp.paid_amount);  // 금액 확인
      console.log("결제 수단:", rsp.pay_method);  // 결제 수단 확인

      // 결제 성공 후, 결제 정보를 서버로 보내는 부분
      const payload = {
        imp_uid: rsp.imp_uid,               // 결제 고유 ID
        merchant_uid: rsp.merchant_uid,     // 주문 고유 ID
        fundingId: idParam,                  // 펀딩 ID
        paidAmount: rsp.paid_amount,         // 실제 결제 금액
        payMethod: rsp.pay_method            // 결제 수단
      };

      try {
        // 서버에 결제 정보를 전달하여 금액을 반영
        const completeRes = await fetch(`/api/payments/webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include", // 세션 사용 시
        });

        if (completeRes.ok) {
          message.success("결제 완료! 금액이 반영되었습니다.");
          // 결제 성공 후, 결제 완료 페이지로 리디렉션 (결제 정보와 함께)
          const queryParams = new URLSearchParams({
            imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid,
            fundingId: idParam,
            paidAmount: rsp.paid_amount,  // 결제 금액
            payMethod: rsp.pay_method    // 결제 수단
          }).toString();
          navigate(`/funding/participate-complete?${queryParams}`);
        } else {
          message.error("서버에서 결제 완료 처리가 실패했습니다.");
        }
      } catch (error) {
        console.error(error);
        message.error("결제 완료 처리가 실패했습니다.");
      }
    } else {
      message.error(rsp.error_msg || "결제가 실패/취소되었습니다.");
    }
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
            onClick={requestPay} // 버튼 클릭 시 함수 호출
          >
            {loading ? "결제 준비 중..." : "결제하기"}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
