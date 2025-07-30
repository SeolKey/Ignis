import React from 'react';
import { Layout, Form, Input, Select, DatePicker, Button, Upload, Checkbox, Card, Typography, Space, Row, Col } from 'antd';
import { InboxOutlined, PlusOutlined, MinusCircleOutlined, CalendarOutlined, ShareAltOutlined, HomeOutlined, HeartOutlined, SmileOutlined, FundOutlined, UserOutlined } from '@ant-design/icons';
import '../styles/FundingCreate.css';


const { Header, Footer, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;
const { Dragger } = Upload;

const FundingCreate = () => {
  return (
    <Layout className="funding-layout">
      {/* 헤더 */}
      <Header className="donation-header">
        <div className="logo">IGNIS</div>
      </Header>

      {/* 본문 */}
      <Content className="funding-content">
        <Card className="form-card">
          {/* 타이틀 + 상단 버튼 */}
          <div className="form-header">
            <Title level={3} style={{ margin: 0 }}>새 펀딩 프로젝트 등록</Title>
            <div className="form-actions">
              <Button>취소</Button>
              <Button>임시저장</Button>
              <Button type="primary">펀딩 시작</Button>
            </div>
          </div>

          <Form layout="vertical">
            {/* 카테고리 */}
            <Form.Item label="카테고리">
              <Select placeholder="카테고리를 선택하세요">
                <Select.Option value="env">환경보호</Select.Option>
                <Select.Option value="education">교육지원</Select.Option>
              </Select>
            </Form.Item>

            {/* 제목 / 소개 */}
            <Form.Item label="프로젝트 제목">
              <Input placeholder="펀딩 제목을 입력하세요" />
            </Form.Item>

            <Form.Item label="한줄 소개">
              <Input placeholder="간단한 소개를 입력하세요" />
            </Form.Item>

            {/* 펀딩 정보 */}
            <Card className="sub-card" title="펀딩 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="목표 금액">
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="펀딩 기간">
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="최소 기부 금액">
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="펀딩 방식">
                    <Select defaultValue="all">
                      <Select.Option value="all">All or Nothing</Select.Option>
                      <Select.Option value="keep">Keep it All</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 리워드 */}
            <Card
              className="sub-card"
              title="후원 리워드"
              extra={<Button icon={<PlusOutlined />}>리워드 추가</Button>}
            >
              <Form.Item label="감사 메시지">
                <Row gutter={12}>
                  <Col xs={24} md={6}>
                    <Input addonAfter="원" defaultValue="10,000" />
                  </Col>
                  <Col xs={24} md={16}>
                    <Input defaultValue="감사 편지 + 스티커" />
                  </Col>
                  <Col xs={24} md={2}>
                    <Button danger icon={<MinusCircleOutlined />} />
                  </Col>
                </Row>
              </Form.Item>
            </Card>

            {/* 상세 내용 */}
            <Form.Item label="프로젝트 상세 내용">
              <TextArea rows={6} placeholder="목적, 필요성, 기대효과 등을 자유롭게 서술하세요" />
            </Form.Item>

            {/* 대표 이미지 업로드 */}
            <Form.Item label="대표 이미지 업로드">
              <Dragger>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">대표 이미지 업로드 (권장: 1200x600px)</p>
              </Dragger>
            </Form.Item>

            {/* 단체/개인 정보 */}
            <Card className="sub-card" title="단체/개인 정보">
              <Form.Item label="단체/이름">
                <Input />
              </Form.Item>
              <Form.Item label="연락처">
                <Input type="email" />
              </Form.Item>
              <Form.Item>
                <Checkbox>단체 인증서 제출 (신뢰도 향상)</Checkbox>
              </Form.Item>
              <Form.Item label="추가 자료">
                <Dragger multiple>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">관련 문서, 이미지 등을 드래그하거나 클릭하여 업로드하세요</p>
                </Dragger>
              </Form.Item>
            </Card>

            {/* 하단 버튼 */}
            <Space style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <Button>취소</Button>
              <Button type="primary">펀딩 시작하기</Button>
            </Space>
          </Form>
        </Card>
      </Content>

      {/* 푸터 */}
      <Footer className="donation-footer">
        © 2025 IGNIS. 포트폴리오용 테스트 페이지입니다.
      </Footer>
    </Layout>
  );
};

export default FundingCreate;
