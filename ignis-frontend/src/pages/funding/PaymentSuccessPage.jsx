import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, Card } from 'antd';

const { Title, Text } = Typography;

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URL 파라미터에서 결제 정보를 가져옵니다.
  const queryParams = new URLSearchParams(location.search);
  const impUid = queryParams.get('imp_uid');
  const merchantUid = queryParams.get('merchant_uid');
  const fundingId = queryParams.get('fundingId');
  const paidAmount = queryParams.get('paidAmount'); // 실제 결제 금액
  const payMethod = queryParams.get('payMethod'); // 결제 수단 (예: 'card', 'kakaopay' 등)

  // impUid와 merchantUid를 실제로 사용
  console.log("Payment successful! impUid:", impUid, "merchantUid:", merchantUid);
  console.log("결제 금액:", paidAmount);
  console.log("결제 수단:", payMethod);

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
        <Title level={2}>결제가 완료되었습니다!</Title>
        <Text>펀딩에 참여해주셔서 감사합니다.</Text>

        <div style={{ marginTop: '20px' }}>
          <Text strong>펀딩 ID:</Text>
          <Text>{fundingId}</Text>
        </div>

        <div style={{ marginTop: '10px' }}>
          <Text strong>결제 금액:</Text>
          <Text>₩ {paidAmount}</Text> {/* 실제 결제 금액을 표시 */}
        </div>

        <div style={{ marginTop: '10px' }}>
          <Text strong>결제 수단:</Text>
          <Text>{payMethod}</Text> {/* 실제 결제 수단을 표시 */}
        </div>

        <div style={{ marginTop: '20px' }}>
          <Button type="primary" onClick={() => navigate('/')}>홈으로 가기</Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
