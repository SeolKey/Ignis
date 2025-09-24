// src/pages/donation/DonationCreate.jsx
import React, { useState } from 'react';
import {
  Form, Input, Button, Card, Space, Upload, Typography,
  DatePicker, Row, Col, message
} from 'antd';
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
    if (value) value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위 쉼표
    setGoalAmount(value);
  };

  const handleImageChange = (info) => {
    const file = info?.file?.originFileObj || info?.file;
    if (!file || !(file instanceof File)) {
      console.warn('⚠️ 이미지 파일이 없습니다.', info);
      return;
    }
    setImageName(file.name);
    setImageFile(file);
  };

  const handleSubmit = async (values) => {
    // goalAmount는 state 기준으로 숫자화
    const mp = parseInt(String(goalAmount).replace(/,/g, ''), 10) || 0;

    // 계좌정보를 합쳐서 전송
    const accountInfo = [
      values.bankName ? `[${values.bankName}]` : '',
      values.accountNumber || '',
      values.accountHolder ? `(${values.accountHolder})` : ''
    ].filter(Boolean).join(' ').trim();

    const formData = new FormData();
    formData.append('title', values.title || '');
    formData.append('description', values.description || '');
    formData.append('accountInfo', accountInfo);
    formData.append('maxPrice', String(mp));
    formData.append('currentPrice', '0');
    formData.append('rejectReason', '');
    if (imageFile) formData.append('file', imageFile); // 펀딩과 동일 키

    try {
      const res = await fetch('/donation/react/create', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      // 미로그인
      if (res.status === 401) {
        message.warning('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      // 정상
      if (res.ok) {
        try { await res.json(); } catch (e) {
          console.warn("JSON parse 실패:", e);
        }
        message.success('기부 프로젝트 등록 성공!');
        navigate('/');
        return;
      }

      // 서버가 500이어도 DB가 이미 들어간 상황을 고려
      if (res.status === 500) {
        message.success('등록은 완료된 것으로 보여요. (서버 응답 오류) 홈으로 이동합니다.');
        navigate('/');
        return;
      }

      // 그 외 상태코드
      message.error(`등록 실패 (HTTP ${res.status}) 홈으로 이동합니다.`);
      navigate('/');

    } catch (err) {
      console.error('업로드 실패:', err);
      message.error('기부 프로젝트 등록 실패! 홈으로 이동합니다.');
      navigate('/');
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
            <Form.Item name="title" label="프로젝트 제목" rules={[{ required: true, message: '제목을 입력하세요' }]}>
              <Input placeholder="기부 제목을 입력하세요" />
            </Form.Item>

            <Form.Item name="description" label="프로젝트 상세 내용" rules={[{ required: true, message: '내용을 입력하세요' }]}>
              <TextArea rows={6} placeholder="프로젝트 소개를 작성하세요" />
            </Form.Item>

            <Card className="sub-card" title="기부 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="goalAmount" label="목표 금액" rules={[{ required: true, message: '목표 금액을 입력하세요' }]}>
                    <Input
                      addonAfter="원"
                      value={goalAmount}
                      onChange={handleChange}
                      placeholder="예: 1,000,000"
                      inputMode="numeric"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="period" label="기부 기간" rules={[{ required: true, message: '기간을 선택하세요' }]}>
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                {/* 계좌 정보 */}
                <Col xs={24} md={8}>
                  <Form.Item name="bankName" label="은행명" rules={[{ required: true, message: '은행명을 입력하세요' }]}>
                    <Input placeholder="예: 국민은행" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="accountNumber" label="계좌번호" rules={[{ required: true, message: '계좌번호를 입력하세요' }]}>
                    <Input placeholder="예: 123-456-789" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="accountHolder" label="예금주" rules={[{ required: true, message: '예금주를 입력하세요' }]}>
                    <Input placeholder="예: 홍길동" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item name="image" label="대표 이미지 업로드" rules={[{ required: true, message: '대표 이미지를 업로드하세요' }]}>
              <Dragger
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                accept="image/*"
                maxCount={1}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">대표 이미지 업로드 (권장: 1200×600px)</p>
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
