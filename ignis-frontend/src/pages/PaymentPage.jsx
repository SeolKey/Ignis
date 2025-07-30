import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Input,
  Button,
  Radio,
  Space,
  Card,
  Checkbox,
  Divider,
} from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  SmileOutlined,
  FundOutlined,
  UserOutlined,
} from '@ant-design/icons';
import '../styles/PaymentPage.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const PaymentPage = () => {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('kakaopay');

  const addAmount = (value) => {
    setAmount((prev) => prev + value);
  };

  const requestKakaoPay = async () => {
    if (amount <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/payment/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          itemName: '호우 피해 기부',
        }),
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('카카오페이 요청 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 요청 중 오류 발생');
    }
  };

  return (
    <Layout className="payment-layout">
      {/* 헤더 */}
      <Header className="donation-header">
        <div className="logo">IGNIS</div>
      </Header>

      {/* 본문 */}
      <Content className="payment-content">
        <Card className="payment-card" variant="borderless">
          <Title level={3}>결제하기</Title>

          {/* 결제 금액 */}
          <div className="section">
            <Text strong>결제 금액</Text>
            <Input
              prefix="₩"
              value={amount}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
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

          {/* 결제 수단 */}
          <div className="section">
            <Text strong>결제 수단</Text>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
                <Card className="payment-option" bordered>
                  <Radio value="kakaopay">카카오페이 - 간편하고 안전한 결제</Radio>
                </Card>
                <Card className="payment-option" bordered>
                  <Radio value="account">계좌이체 - 은행 계좌로 직접 이체</Radio>
                </Card>
              </Space>
            </Radio.Group>
          </div>

          <Divider />

          {/* 총 결제 금액 */}
          <div className="section total-section">
            <Text strong>총 결제금액</Text>
            <Text className="total-amount">₩ {amount.toLocaleString()}</Text>
          </div>

          <Divider />

          {/* 이용 동의 */}
          <div className="section">
            <Text strong>결제 및 이용 동의</Text>
            <TextArea
              rows={4}
              placeholder="약관 내용을 여기에 넣을 수 있습니다"
              style={{ marginTop: 8 }}
            />
            <Checkbox style={{ marginTop: 12 }}>
              결제 및 이용에 동의합니다. (필수)
            </Checkbox>
          </div>

          {/* 결제 버튼 */}
          <Button
            type="primary"
            block
            style={{ marginTop: 24 }}
            onClick={() => {
              if (paymentMethod === 'kakaopay') {
                requestKakaoPay();
              } else {
                alert('아직 해당 결제수단은 지원하지 않습니다.');
              }
            }}
          >
            결제하기
          </Button>
        </Card>
      </Content>

      {/* 푸터 */}
      <Footer className="donation-footer">
        © 2025 IGNIS. 포트폴리오용 테스트 페이지입니다.
      </Footer>
    </Layout>
  );
};

console.log(' PaymentPage 컴포넌트 불러와짐');
export default PaymentPage;
