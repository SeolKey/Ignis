import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Upload, Typography, Select, DatePicker, Row, Col, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import "../../styles/donation/DonationCreate.css";
const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const DonationCreate = () => {
  const [form] = Form.useForm();
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  const [goalAmount, setGoalAmount] = useState('');

  // 숫자만 허용하고 천 단위로 쉼표 추가
  const handleChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    if (value) {
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위 쉼표 추가
    }
    setGoalAmount(value); // 상태 값 업데이트
  };

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
    formData.append('maxPrice', parseInt(values.goalAmount.replace(/,/g, '') || 0, 10)); // 쉼표를 제거한 숫자만 사용
    formData.append('currentPrice', 0);
    formData.append('rejectReason', '');
    if (imageFile) formData.append('image', imageFile);

    try {
      const response = await fetch('/donation/create', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status === 401) {
        message.warning('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      if (!response.ok) throw new Error('서버 오류');

      const result = await response.json();
      console.log(result);
      message.success('기부 프로젝트 등록 성공!');
      navigate('/');
    } catch (err) {
      console.error('업로드 실패:', err);
      message.error('기부 프로젝트 등록 실패!');
    }
  };

  return (
    <Layout>
      <div className="donation-content-create">
        <Card className="form-card">
          <div className="form-header">
            <Title level={3}>새 기부 프로젝트 등록</Title>
          </div>

          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            

            <Form.Item name="title" label="프로젝트 제목" rules={[{ required: true }]}>
              <Input placeholder="기부 제목을 입력하세요" />
            </Form.Item>

            <Form.Item name="description" label="프로젝트 상세 내용" rules={[{ required: true }]}>
              <TextArea rows={6} />
            </Form.Item>

            <Card className="sub-card" title="기부 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="goalAmount" label="목표 금액" rules={[{ required: true }]}>
                    <Input
                      addonAfter="원"
                      value={goalAmount}
                      onChange={handleChange}
                      placeholder="목표 금액을 입력하세요"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="period" label="기부 기간" rules={[{ required: true }]}>
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                {/* 계좌 정보 입력란 추가 */}
                <Col xs={24} md={8}>
                  <Form.Item name="bankName" label="은행명" rules={[{ required: true }]}>
                    <Input placeholder="은행명을 입력하세요" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="accountNumber" label="계좌번호" rules={[{ required: true }]}>
                    <Input placeholder="계좌번호를 입력하세요" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="accountHolder" label="예금주" rules={[{ required: true }]}>
                    <Input placeholder="예금주를 입력하세요" />
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
