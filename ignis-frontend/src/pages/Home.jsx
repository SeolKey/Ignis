import React from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import Layout from '../components/Layout'; // 경로 수정됨

const { Title, Text } = Typography;

export default function MainPage() {
  const sectionStyle = { marginBottom: 48 };
  const cardStyle = { borderRadius: 12 };

  const renderItems = (category, color) => (
    <div style={sectionStyle}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={4}>{category}</Title>
        <Button type="link">더 보러가기 &gt;</Button>
      </Row>
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={12} md={6} key={i}>
            <Card
              style={{ ...cardStyle, backgroundColor: color }}
              bodyStyle={{ minHeight: 100 }}
              hoverable
            >
              <Text strong>{category} ITEM{i}</Text>
              {category === '펀딩' && (
                <div style={{ marginTop: 8 }}>목표금액 10,000원</div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <Layout>
      <div style={{ padding: '48px 24px' }}>
        <Card
          style={{ backgroundColor: '#338AFF', borderRadius: 16, marginBottom: 64 }}
          bodyStyle={{ padding: 48 }}
        >
          <Title level={3} style={{ color: 'white' }}>여름, 시원한 바람을 느끼려면?</Title>
          <Text style={{ color: 'white', display: 'block', marginBottom: 16 }}>새로 입고된 텐 부채 확인해보세요!</Text>
          <Button>자세히 보기</Button>
        </Card>

        {/* 기부 섹션 추가 */}
        {renderItems('기부', '#f0f0f0')}
        <Button type="primary" style={{ marginTop: 16 }} href="/donation-create">
          기부 생성하기
        </Button>

        {renderItems('봉사', '#e6f7ff')}
        {renderItems('펀딩', '#f6ffed')}
      </div>
    </Layout>
  );
}
