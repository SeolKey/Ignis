import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Typography, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;
const { TextArea } = Input;

const FundingCreate = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async () => {
        setSubmitting(true);
        try {
            // TODO: API 연동
            // await fetch('/funding/react/create', { ... })
            message.success('임시: 생성 성공(목업)');
            navigate('/funding', { replace: true });
        } catch {                              // ✅ e 안 쓰면 변수명 자체를 제거
            message.error('생성 실패');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
                <Card style={{ marginBottom: 12 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>펀딩 생성</Title>
                            <Text type="secondary">필수 정보를 입력하세요.</Text>
                        </div>
                        <Button onClick={() => navigate('/funding')}>목록</Button>
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

                        <Form.Item name="accountInfo" label="계좌 정보" tooltip="은행명 / 계좌번호 / 예금주">
                            <Input placeholder="예) 하나 123-456-789012 / 홍길동" />
                        </Form.Item>

                        <Form.Item name="maxPrice" label="목표 금액" rules={[{ required: true, message: '목표 금액을 입력하세요' }]}>
                            <InputNumber style={{ width: '100%' }} min={0} step={1000} placeholder="예) 1,000,000" />
                        </Form.Item>

                        <Space>
                            <Button onClick={() => navigate(-1)}>취소</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>등록</Button>
                        </Space>
                    </Form>
                </Card>
            </div>
        </Layout>
    );
};

export default FundingCreate;
