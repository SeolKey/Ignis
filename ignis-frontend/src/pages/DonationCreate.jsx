import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Space, Upload, Typography, Select, DatePicker, Row, Col, message } from 'antd';  // message import 추가
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; // Layout 컴포넌트 불러오기
import '../styles/DonationCreate.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const DonationCreate = () => {
  const [form] = Form.useForm();
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // 이미지 파일 처리
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;

    if (!file || !(file instanceof File)) {
      console.warn('⚠️ 이미지 파일이 없습니다.', info);
      return;
    }

    setImageName(file.name);
    setImageFile(file);
  };

  // 폼 제출 처리
  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('accountInfo', values.accountInfo || '');
    formData.append('maxPrice', parseInt(values.goalAmount));
    formData.append('currentPrice', 0);
    formData.append('rejectReason', '');

    if (imageFile) {
      formData.append('file', imageFile); // 이미지 파일 추가
    }

    try {
      const response = await fetch('http://localhost/donation/create', {
        method: 'POST',
        body: formData,
        credentials: 'include' // 세션 쿠키 전송
      });

      if (!response.ok) throw new Error('서버 오류');
      const result = await response.json();
      console.log('DB 저장 완료:', result);
      message.success('기부 프로젝트 등록 성공!');
      navigate(`/donation/${result.donation_id}`); // "funding"을 "donation"으로 변경
    } catch (err) {
      console.error('업로드 실패:', err);
      message.error('기부 프로젝트 등록 실패!');
    }
  };

  return (
    <Layout>
      <div className="donation-content">
        <Card className="form-card">
          <div className="form-header">
            <Title level={3}>새 기부 프로젝트 등록</Title>
          </div>

          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            {/* 카테고리 선택 (필수 아님) */}
            <Form.Item
              name="category"
              label="카테고리"
            >
              <Select defaultValue="donation">
                <Select.Option value="donation">기부</Select.Option>
                <Select.Option value="volunteer">봉사</Select.Option>
                <Select.Option value="funding">펀딩</Select.Option>
              </Select>
            </Form.Item>

            {/* 제목 입력 */}
            <Form.Item name="title" label="프로젝트 제목" rules={[{ required: true }]} >
              <Input placeholder="기부 제목을 입력하세요" />
            </Form.Item>

            {/* 설명 입력 */}
            <Form.Item name="description" label="프로젝트 상세 내용" rules={[{ required: true }]} >
              <TextArea rows={6} />
            </Form.Item>

            {/* 계좌 정보 입력 */}
            <Form.Item name="accountInfo" label="계좌 정보">
              <Input placeholder="기부금을 받을 계좌 정보를 입력하세요" />
            </Form.Item>

            {/* 사용 계획 */}
            <Form.Item name="usagePlan" label="기부금 사용 계획">
              <TextArea rows={4} placeholder="예: 주택 복구, 생필품 지원 등" />
            </Form.Item>

            {/* 펀딩 정보 (이전 배치 방식으로 복원) */}
            <Card className="sub-card" title="기부 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="goalAmount" label="목표 금액" rules={[{ required: true }]} >
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="period" label="기부 기간" rules={[{ required: true }]} >
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="minAmount" label="최소 기부 금액">
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="fundingType" label="기부 방식">
                    <Select defaultValue="all">
                      <Select.Option value="all">전액 목표 달성</Select.Option>
                      <Select.Option value="keep">목표 금액 유지</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 이미지 업로드 */}
            <Form.Item name="image" label="대표 이미지 업로드">
              <Dragger
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">대표 이미지 업로드 (권장: 1200x600px)</p>
                {imageName && (
                  <p style={{ color: '#1890ff', fontWeight: 'bold' }}>
                    업로드된 파일: {imageName}
                  </p>
                )}
              </Dragger>
            </Form.Item>

            {/* 버튼 */}
            <Space style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <Button htmlType="reset">취소</Button>
              <Button type="primary" htmlType="submit">기부 프로젝트 시작하기</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default DonationCreate;
