import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, Card, Space } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/donation/DonationPaymentSuccessPage.css';

const { Title, Text, Paragraph } = Typography;

export default function DonationPaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const qs = new URLSearchParams(location.search);
  const donationId = qs.get('donationId');
  const paidAmount = qs.get('paidAmount');

  return (
    <Layout>
      <div className="donation-success-wrap">
        <Card className="donation-success-card modern-success">
          <div className="success-icon">
            <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 56 }} />
          </div>

          <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
            결제가 완료되었습니다 🎉
          </Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
            소중한 기부에 진심으로 감사드립니다.
          </Paragraph>

          <div className="success-row highlight">
            <Text strong>기부 ID</Text>
            <Text>{donationId || '-'}</Text>
          </div>
          <div className="success-row highlight">
            <Text strong>결제 금액</Text>
            <Text className="success-amount">₩ {Number(paidAmount || 0).toLocaleString()}</Text>
          </div>

          <Space style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }} wrap>
            {donationId && (
              <Button type="primary" size="large" onClick={() => navigate(`/donation/${donationId}`)}>
                기부 상세 보기
              </Button>
            )}
            <Button size="large" ghost onClick={() => navigate('/')}>
              홈으로
            </Button>
          </Space>
        </Card>
      </div>
    </Layout>
  );
}
