import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Upload, Typography, Select, DatePicker, Row, Col, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/DonationCreate.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const DonationCreate = () => {
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
    // (2) NaN 방지
    formData.append('maxPrice', parseInt(values.goalAmount || 0, 10));
    formData.append('currentPrice', 0);
    formData.append('rejectReason', '');
    // (1) 파일 키 이름 통일
    if (imageFile) formData.append('image', imageFile);

    try {
      // 상대경로(프록시 전제) + 세션 쿠키 포함
      const response = await fetch('/donation/create', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status === 401) {
        // (3) message.warning 사용
        message.warning('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      if (!response.ok) throw new Error('서버 오류');

      const result = await response.json();
      message.success('기부 프로젝트 등록 성공!');
      navigate(`/donation/${result.donation_id}`);
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
            <Form.Item name="category" label="카테고리">
              <Select defaultValue="donation">
                <Select.Option value="donation">기부</Select.Option>
                <Select.Option value="volunteer">봉사</Select.Option>
                <Select.Option value="funding">펀딩</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="title" label="프로젝트 제목" rules={[{ required: true }]}>
              <Input placeholder="기부 제목을 입력하세요" />
            </Form.Item>

            <Form.Item name="description" label="프로젝트 상세 내용" rules={[{ required: true }]}>
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item name="accountInfo" label="계좌 정보">
              <Input placeholder="기부금을 받을 계좌 정보를 입력하세요" />
            </Form.Item>

            <Card className="sub-card" title="기부 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="goalAmount" label="목표 금액" rules={[{ required: true }]}>
                    <Input addonAfter="원" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="period" label="기부 기간" rules={[{ required: true }]}>
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

            <Form.Item name="image" label="대표 이미지 업로드">
              <Dragger showUploadList={false} beforeUpload={() => false} onChange={handleImageChange}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">대표 이미지 업로드 (권장: 1200x600px)</p>
                {imageName && <p style={{ color: '#1890ff', fontWeight: 'bold' }}>업로드된 파일: {imageName}</p>}
              </Dragger>
            </Form.Item>

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
