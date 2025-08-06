import React from 'react';
import { Layout, Menu, Row, Col, Card, Typography, Progress, Button, Tabs, Divider } from 'antd';
import { CalendarOutlined, ShareAltOutlined, HomeOutlined, HeartOutlined, SmileOutlined, FundOutlined, UserOutlined } from '@ant-design/icons';
import '../styles/DonationDetail.css';
import { useNavigate } from 'react-router-dom';

const { Header, Footer, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DonationDetail = () => {
  const navigate = useNavigate();

  // localStorage에서 데이터 가져오기
  const fundingData = JSON.parse(localStorage.getItem('fundingData'));

  const handleParticipate = () => {
    navigate('/payment'); // 결제 페이지로 이동 (예시)
  };

  return (
    <Layout className="donation-layout">
      {/* 헤더 */}
      <Header className="donation-header">
        <div className="logo">IGNIS</div>
        <Menu
          mode="horizontal"
          theme="light"
          defaultSelectedKeys={['donation']}
          className="donation-menu"
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>홈</Menu.Item>
          <Menu.Item key="donation" icon={<HeartOutlined />}>기부</Menu.Item>
          <Menu.Item key="volunteer" icon={<SmileOutlined />}>봉사</Menu.Item>
          <Menu.Item key="funding" icon={<FundOutlined />}>펀딩</Menu.Item>
          <Menu.Item key="mypage" icon={<UserOutlined />}>마이페이지</Menu.Item>
        </Menu>
      </Header>

      {/* 본문 */}
      <Content className="donation-content">
        <Row gutter={[24, 24]}>
          {/* 좌측 */}
          <Col xs={24} md={16}>
            <Card bordered={false} className="thumbnail-card">
              <img
                src="/test_banner.png"
                alt="대표 이미지"
                className="thumbnail-image"
              />
            </Card>
            <Tabs defaultActiveKey="1" className="custom-tabs">
              <TabPane tab="상세내용" key="1">
                <Title level={4}>프로젝트 소개</Title>
                <Card className="content-card" bordered={false}>
                  <Paragraph>
                    {fundingData ? fundingData.description : "기부 상세 정보가 없습니다."}
                  </Paragraph>
                </Card>
                <Paragraph style={{ marginTop: 24 }}>기부금 사용 계획</Paragraph>
                <Card className="content-card" bordered={false}>
                  <Paragraph>
                    모금된 기부금은 아래와 같은 항목에 사용됩니다:
                    <ul>
                      <li>피해 지역 내 <Text strong>침수된 주택 복구 및 청소 지원</Text></li>
                      <li><Text strong>임시 거처 마련</Text> 및 기본 생필품 제공</li>
                      <li><Text strong>정신건강 상담 프로그램</Text> 및 커뮤니티 케어 활동</li>
                      <li>지역 아동을 위한 <Text strong>교육 지원</Text> 및 안전 공간 확보</li>
                    </ul>
                    <br />
                    모든 후원 내역은 프로젝트 종료 후 투명하게 공개되며,
                    <Text strong>후원자에게 결과 리포트</Text>가 제공됩니다.
                  </Paragraph>
                </Card>
              </TabPane>
              <TabPane tab="안내사항" key="2">
                <Title level={5}>기부 안내사항</Title>
                <Paragraph>
                  - 본 프로젝트는 <Text strong>긴급 재난 지원</Text>을 위한 목적으로 진행됩니다.<br />
                  - 기부하신 금액은 <Text strong>전액 피해 지역 지원</Text>에 사용됩니다.<br />
                  - 기부금은 <Text strong>세액공제 대상</Text>이 아니며, 기부 영수증 발급은 제공되지 않습니다.<br />
                  - 기부 후에는 <Text type="danger">환불이 불가능</Text>하오니 신중히 참여해 주세요.
                </Paragraph>
                <Paragraph>
                  궁금한 사항은 IGNIS 고객센터로 문의해 주세요.
                  <br />
                  <a href="mailto:support@ignis.org">support@ignis.org</a>
                  <br />
                  02-1234-5678
                </Paragraph>
              </TabPane>
              <TabPane tab="댓글" key="3">
                <Title level={5}>응원의 한마디</Title>
                <Paragraph>
                  아직 댓글 기능은 준비 중입니다
                  <br />
                  곧 기부자분들이 서로 응원과 감사를 나눌 수 있도록 댓글 기능을 오픈할 예정이에요.
                  <br /><br />
                  IGNIS는 모두의 참여로 따뜻한 변화를 만들어갑니다. 감사합니다!
                </Paragraph>
              </TabPane>
            </Tabs>
          </Col>

          {/* 우측 */}
          <Col xs={24} md={8}>
            <Card className="info-card" variant="borderless">
              <Title level={5}>{fundingData ? fundingData.title : "프로젝트 제목"}</Title>
              <div className="project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>2023.10.01 ~ 2023.11.30 (60일)</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Text strong>60% 달성</Text>
              <Progress percent={60} showInfo={false} status="active" />
              <Text type="secondary" style={{ float: 'right' }}>30일 남음</Text>

              <div className="stats">
                <Paragraph>
                  <Text>현재 모금액</Text><br />
                  <Text strong style={{ fontSize: 20 }}>60,000,000원</Text>
                </Paragraph>
                <Paragraph>
                  <Text>목표 금액</Text><br />
                  <Text>100,000,000원</Text>
                </Paragraph>
                <Paragraph>
                  <Text>참여자</Text><br />
                  <Text>328명</Text>
                </Paragraph>
              </div>

              <Button type="primary" block onClick={handleParticipate}>
                프로젝트 참여하기
              </Button>
              <Button icon={<ShareAltOutlined />} block style={{ marginTop: 12 }}>
                공유하기
              </Button>
            </Card>

            <Divider />

            <Card title="관련 프로젝트" bordered={false}>
              <div className="related-card">
                <div className="related-thumbnail" />
                <div>
                  <Text>도시 가꾸기 프로젝트</Text><br />
                  <Text type="secondary">75% 달성 | 15일 남음</Text>
                </div>
              </div>

              <Divider />

              <div className="related-card">
                <div className="related-thumbnail" />
                <div>
                  <Text>친환경 에너지 시설 구축</Text><br />
                  <Text type="secondary">42% 달성 | 25일 남음</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* 푸터 */}
      <Footer className="donation-footer">
        © 2025 IGNIS. 포트폴리오용 테스트 페이지입니다.
      </Footer>
    </Layout>
  );
};

export default DonationDetail;
