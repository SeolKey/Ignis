import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Typography, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';

const { Title } = Typography;
const { TextArea } = Input;

const FundingEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // TODO: 상세 로드 API 연동
  useEffect(() => {
    // fetch(`/funding/react/detail/${id}`)
    form.setFieldsValue({
      title: `펀딩 제목 #${id}`,
      description: '기존 설명',
      accountInfo: '하나 123-456-789012 / 홍길동',
      maxPrice: 1000000,
    });
  }, [id, form]);

  const onFinish = async () => {
    setSaving(true);
    try {
      // await fetch(`/funding/react/edit/${id}`, { ... })
      message.success('임시: 수정 성공(목업)');
      navigate(`/funding/${id}`, { replace: true });
    } catch {
      message.error('수정 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3} style={{ margin: 0 }}>펀딩 수정</Title>
            <Button onClick={() => navigate(`/funding/${id}`)}>상세로</Button>
          </Space>
        </Card>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력하세요' }]}>
              <Input placeholder="제목" />
            </Form.Item>

            <Form.Item name="description" label="설명" rules={[{ required: true, message: '설명을 입력하세요' }]}>
              <TextArea rows={8} placeholder="프로젝트 설명" />
            </Form.Item>

            <Form.Item name="accountInfo" label="계좌 정보">
              <Input placeholder="예) 하나 123-456-789012 / 홍길동" />
            </Form.Item>

            <Form.Item name="maxPrice" label="목표 금액" rules={[{ required: true, message: '목표 금액을 입력하세요' }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={1000} placeholder="예) 1,000,000" />
            </Form.Item>

            <Space>
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Button type="primary" htmlType="submit" loading={saving}>저장</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default FundingEdit;
