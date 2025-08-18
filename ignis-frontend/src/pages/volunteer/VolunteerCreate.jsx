// src/pages/volunteer/VolunteerCreate.jsx
import React from 'react';
import { Form, Input, Button, Upload, Card, Typography, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const { Title } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

export default function VolunteerCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title || '');
      formData.append('description', values.description || '');
      if (values.file?.[0]?.originFileObj) {
        formData.append('file', values.file[0].originFileObj);
      }

      const res = await fetch('/volunteer/react/create', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || data?.result === 'fail' || data?.result === '실패') {
        message.error(data?.error || '생성 실패');
        return;
      }
      message.success('봉사 등록 완료');
      navigate('/volunteer');
    } catch {
          message.error('');
        }
  };

  return (
    <Layout>
      <div className="page" style={{ maxWidth: 880, margin: '24px auto' }}>
        <Title level={3}>봉사 생성</Title>
        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="제목" name="title" rules={[{ required: true, message: '제목을 입력하세요.' }]}>
              <Input placeholder="예) 독거 어르신 반찬 봉사 모집" />
            </Form.Item>

            <Form.Item label="설명" name="description" rules={[{ required: true, message: '설명을 입력하세요.' }]}>
              <TextArea rows={6} placeholder="봉사 내용, 일정, 장소 등을 입력하세요." />
            </Form.Item>

            <Form.Item label="대표 이미지" name="file" valuePropName="fileList" getValueFromEvent={normFile}>
              <Dragger beforeUpload={() => false} multiple={false} maxCount={1}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">이미지를 드래그하거나 클릭하여 업로드</p>
              </Dragger>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">등록</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>취소</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
