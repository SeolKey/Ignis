import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress,
  Button, Tabs, Divider
} from 'antd';
import {
  CalendarOutlined, ShareAltOutlined
} from '@ant-design/icons';
import '../styles/DonationDetail.css';
import Layout from '../components/Layout';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const fundingData = JSON.parse(localStorage.getItem('fundings') || '[]');
  const project = fundingData.find(item => item.id === id);

  if (!project) return <Layout><p>해당 프로젝트를 찾을 수 없습니다.</p></Layout>;

  const handleParticipate = () => {
    navigate('/payment');
  };

  const start = project.period?.[0] || '';
  const end = project.period?.[1] || '';
  const progress = 0; // 향후 기부 금액 기반으로 계산 가능

  return (
    <Layout>
      <div className="donation-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card bordered={false} className="thumbnail-card">
              <img
                src={project.image || '/test_banner.png'}
                alt="대표 이미지"
                style={{
                  width: '100%',            // 카드 너비에 맞춤
                  height: '300px',          // 고정된 높이
                  objectFit: 'cover',       // 이미지가 꽉 차게
                  borderRadius: '8px',      // 모서리 둥글게 (선택)
                  backgroundColor: '#f0f0f0' // 이미지 없는 경우 배경 회색 (선택)
                }}
              />

            </Card>
            <Tabs defaultActiveKey="1" className="custom-tabs">
              <TabPane tab="상세내용" key="1">
                <Title level={4}>{project.title}</Title>
                <Card className="content-card" bordered={false}>
                  <Paragraph>{project.description}</Paragraph>
                </Card>
                <Paragraph style={{ marginTop: 24 }}>기부금 사용 계획</Paragraph>
                <Card className="content-card" bordered={false}>
                  <Paragraph>{project.usagePlan || '상세 계획이 등록되지 않았습니다.'}</Paragraph>
                </Card>
              </TabPane>
              <TabPane tab="안내사항" key="2">
                <Paragraph>
                  - 본 프로젝트는 실제 기부를 기반으로 하는 서비스이며, 사용자의 소중한 기부금은 각 펀딩 목적에 따라 투명하게 사용됩니다.
                  <br />
                  - 기부 내역은 프로젝트 종료 후 상세 리포트로 제공되며, 사용처와 결과는 공개됩니다.
                  <br />
                  - 프로젝트 진행에 필요한 일부 운영 비용이 포함될 수 있으며, 모든 사용 내역은 기록됩니다.
                  <br />
                  - 기부금은 세액공제 대상이 아니며, 기부 완료 후 환불은 불가하오니 신중히 참여 부탁드립니다.
                </Paragraph>
                <Paragraph>
                  자세한 문의는 고객센터 또는 이메일을 통해 연락 주세요.
                  <br />
                  📧 contact@ignis.org
                  <br />
                  ☎️ 02-1234-5678
                </Paragraph>
              </TabPane>

              <TabPane tab="댓글" key="3">
                <Paragraph>
                  댓글 기능은 준비 중입니다.
                </Paragraph>
              </TabPane>
            </Tabs>
          </Col>

          <Col xs={24} md={8}>
            <Card className="info-card" variant="borderless">
              <Title level={5}>{project.title}</Title>
              <div className="project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>{start} ~ {end}</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Text strong>{progress}% 달성</Text>
              <Progress percent={progress} showInfo={false} status="active" />
              <Text type="secondary" style={{ float: 'right' }}>{end} 종료</Text>

              <div className="stats">
                <Paragraph>
                  <Text>목표 금액</Text><br />
                  <Text>{project.goalAmount || 0}원</Text>
                </Paragraph>
                <Paragraph>
                  <Text>최소 금액</Text><br />
                  <Text>{project.minAmount || 0}원</Text>
                </Paragraph>
              </div>

              <Button type="primary" block onClick={handleParticipate}>
                프로젝트 참여하기
              </Button>
              <Button icon={<ShareAltOutlined />} block style={{ marginTop: 12 }}>
                공유하기
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default DonationDetail;
