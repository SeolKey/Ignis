import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, Card, Space } from 'antd';
import Layout from '../../components/Layout';
import '../../styles/donation/DonationPaymentSuccessPage.css';

const { Title, Text } = Typography;

export default function DonationPaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const qs = new URLSearchParams(location.search);
  const impUid = qs.get('imp_uid');
  const merchantUid = qs.get('merchant_uid');
  const donationId = qs.get('donationId');
  const paidAmount = qs.get('paidAmount');
  const payMethod  = qs.get('payMethod');

  // 디버그 로그
  console.log('[Donation][Success] imp_uid:', impUid, 'merchant_uid:', merchantUid);
  console.log('amount:', paidAmount, 'method:', payMethod);

  return (
    <Layout>
      <div className="donation-success-wrap">
        <Card className="donation-success-card">
          <Title level={2}>기부 결제가 완료되었습니다 🎉</Title>
          <Text>소중한 기부에 감사드립니다.</Text>

          <div className="success-row">
            <Text strong>기부 ID</Text>
            <Text>{donationId || '-'}</Text>
          </div>
          <div className="success-row">
            <Text strong>결제 금액</Text>
            <Text>₩ {Number(paidAmount || 0).toLocaleString()}</Text>
          </div>
          <div className="success-row">
            <Text strong>결제 수단</Text>
            <Text>{payMethod || '-'}</Text>
          </div>

          <Space style={{ marginTop: 24 }} wrap>
            {donationId && (
              <Button type="primary" onClick={() => navigate(`/donation/${donationId}`)}>
                기부 상세로 이동
              </Button>
            )}
            <Button onClick={() => navigate('/')}>홈으로</Button>
          </Space>
        </Card>
      </div>
    </Layout>
  );
}
