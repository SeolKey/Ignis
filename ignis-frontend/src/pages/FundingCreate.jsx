import React, { useState } from 'react';
import {
  Form, Input, Select, DatePicker, Button,
  Upload, Card, Typography, Space, Row, Col
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import '../styles/FundingCreate.css';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const { TextArea } = Input;
const { Title } = Typography;
const { Dragger } = Upload;

const FundingCreate = () => {

  const [form] = Form.useForm();
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;

    if (!file || !(file instanceof File)) {
      console.warn('⚠️ 이미지 파일이 없습니다.', info);
      return;
    }

    setImageName(file.name);
    setImageFile(file);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('accountInfo', values.accountInfo || '');
    formData.append('maxPrice', parseInt(values.goalAmount));
    formData.append('currentPrice', 0);
    formData.append('rejectReason', '');

    if (imageFile) {
      formData.append('file', imageFile); // ✅ 백엔드 필드명에 맞춤
    }

    try {
      const response = await fetch('http://localhost/donation/create', {
        method: 'POST',
        body: formData,
        credentials: 'include' // ✅ 세션 쿠키 전송
      });

      if (!response.ok) throw new Error('서버 오류');
      const result = await response.json();
      console.log('DB 저장 완료:', result);
      navigate(`/funding/${result.donation_id}`);
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  return (
    <Layout>
      <div className="funding-content">
        <Card className="form-card">
          <div className="form-header">
            <Title level={3}>새 펀딩 프로젝트 등록</Title>
          </div>

          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="category"
              label="카테고리"
              rules={[{ required: true, message: '카테고리를 선택하세요' }]}
            >
              <Select defaultValue="donation">
                <Select.Option value="donation">기부</Select.Option>
                <Select.Option value="volunteer">봉사</Select.Option>
                <Select.Option value="funding">펀딩</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="title" label="프로젝트 제목" rules={[{ required: true }]}>
              <Input placeholder="펀딩 제목을 입력하세요" />
            </Form.Item>

            <Form.Item name="description" label="프로젝트 상세 내용" rules={[{ required: true }]}>
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item name="accountInfo" label="계좌 정보">
              <Input placeholder="기부금을 받을 계좌 정보를 입력하세요" />
            </Form.Item>

            <Form.Item name="usagePlan" label="기부금 사용 계획">
              <TextArea rows={4} placeholder="예: 주택 복구, 생필품 지원 등" />
            </Form.Item>

            <Card className="sub-card" title="펀딩 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="goalAmount" label="목표 금액" rules={[{ required: true }]}>
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="period" label="펀딩 기간" rules={[{ required: true }]}>
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="minAmount" label="최소 기부 금액">
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="fundingType" label="펀딩 방식">
                    <Select defaultValue="all">
                      <Select.Option value="all">All or Nothing</Select.Option>
                      <Select.Option value="keep">Keep it All</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

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

            <Space style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <Button htmlType="reset">취소</Button>
              <Button type="primary" htmlType="submit">펀딩 시작하기</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default FundingCreate;
