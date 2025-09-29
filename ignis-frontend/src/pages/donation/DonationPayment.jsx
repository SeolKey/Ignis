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
import "../../styles/donation/DonationPayment.css";
import Layout from "../../components/Layout";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DonationPayment() {
  const [params] = useSearchParams();
  const donationId = params.get("id");
  const amountParam = Number(params.get("amount") || 0);

  const [donation, setDonation] = useState(null);
  const [amount, setAmount] = useState(amountParam);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerTel, setBuyerTel] = useState("");

  const navigate = useNavigate();


  // 프로젝트 정보 (제목/목표/현재금액)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!donationId) return;
      try {
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
      }
    })();
    return () => { ignore = true; };
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

  const disabled = useMemo(
    () => !donationId || amount <= 0 || !agree || loading,
    [donationId, amount, agree, loading]
  );

  const addAmount = (v) => setAmount((prev) => Math.max(0, Number(prev || 0) + v));
  const numberOnly = (v) => v.replace(/[^0-9]/g, "");
  const formatWon = (n) => `${Number(n || 0).toLocaleString()}원`;

  // 결제 요청
  const requestPay = async () => {
    if (!donationId) return message.error("기부 대상 ID가 없습니다.");
    if (amount <= 0) return message.error("결제 금액을 입력해주세요.");

    try {
      setLoading(true);

      // 서버 사전등록 (x-www-form-urlencoded)
      const form = new URLSearchParams();
      form.append("donationId", String(donationId));
      form.append("amount", String(amount));
      if (buyerName) form.append("buyerName", buyerName);
      if (buyerEmail) form.append("buyerEmail", buyerEmail);
      if (buyerTel) form.append("buyerTel", buyerTel);

      const prepRes = await fetch("/api/payment/donation/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form,
        credentials: "include",
      });

      if (!prepRes.ok) throw new Error(`결제 준비 실패 (HTTP ${prepRes.status})`);
      const raw = await prepRes.json();
      const prep = raw?.data ?? raw; // 래퍼/비래퍼 모두 대응

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
          buyer_name: buyerName || "",
          buyer_email: buyerEmail || "",
          buyer_tel: buyerTel || "",
        },
        (rsp) => {
          if (!rsp.success) {
            message.error(rsp.error_msg || "결제가 실패/취소되었습니다.");
            setLoading(false);
            return;
          }

          // ====== 서버에 결제 완료 요청 ======
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
            .then(res => res.json())
            .then(data => {
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
            .catch(err => {
              console.error(err);
              message.error("서버 완료 처리 중 오류가 발생했습니다.");
            })
            .finally(() => setLoading(false));
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
      <div className="donation-payment-content">
        <Card className="donation-payment-card">
          {/* ======= 같은 박스(카드) 안에 전체 구성 ======= */}
          <Title level={4}>
            기부 참여 - {donation?.title || "프로젝트 로딩 중"}
          </Title>

          {/* 프로젝트 요약 */}
          <div className="info-row">
            <Text strong>제목</Text>
            <Text>{donation?.title || "-"}</Text>
          </div>
          <div className="info-row">
            <Text strong>목표 금액</Text>
            <Text>{formatWon(donation?.maxPrice)}</Text>
          </div>
          <div className="info-row">
            <Text strong>현재 금액</Text>
            <Text>{formatWon(donation?.currentPrice)}</Text>
          </div>

          <Divider />

          {/* 결제 금액 */}
          <div className="section">
            <Text strong>기부 금액</Text>
            <Input
              prefix="₩"
              value={amount}
              onChange={(e) => setAmount(Number(numberOnly(e.target.value)))}
              style={{ marginTop: 8 }}
              inputMode="numeric"
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

          {/* 기부자 정보 */}
          <div className="section">
            <Text strong>기부자 정보 (선택)</Text>
            <Space direction="vertical" style={{ width: "100%", marginTop: 8 }}>
              <Input placeholder="이름(선택)" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
              <Input placeholder="이메일(선택)" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
              <Input placeholder="연락처(선택)" value={buyerTel} onChange={(e) => setBuyerTel(e.target.value)} />
            </Space>
          </div>

          <Divider />

          {/* 결제 수단 */}
          <div className="section">
            <Text strong>결제 수단</Text>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
                <Card className="donation-payment-option" bordered>
                  <Radio value="card">카드 결제(포트원)</Radio>
                </Card>
                <Card className="donation-payment-option" bordered>
                  <Radio value="account" disabled>계좌이체</Radio>
                </Card>
              </Space>
            </Radio.Group>
          </div>

          <Divider />

          {/* 총액 + 약관 */}
          <div className="section total-section">
            <Text strong>총 결제금액</Text>
            <Text className="total-amount">₩ {amount.toLocaleString()}</Text>
          </div>

          <Divider />

          <div className="section">
            <Text strong>결제 및 이용 동의</Text>
            <TextArea rows={4} placeholder="약관 내용을 여기에 넣을 수 있습니다" style={{ marginTop: 8 }} />
            <Checkbox style={{ marginTop: 12 }} checked={agree} onChange={(e) => setAgree(e.target.checked)}>
              결제 및 이용에 동의합니다. (필수)
            </Checkbox>
          </div>

          <Button
            className="donation-payment-button"
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
