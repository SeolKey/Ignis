import React from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title } = Typography;
const { TextArea } = Input;

const FreeCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // ✅ React 전용 생성 API (백엔드에 3-3 추가)
      const res = await fetch('/post/react/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ title: values.title, content: values.content }),
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (json?.result === '성공') {
        message.success('등록 완료');
        navigate('/board/free');
      } else {
        message.error(json?.error || '등록 실패');
      }
    } catch {
      message.error('서버 오류로 등록 실패');
    }
  };

  return (
    <Layout>
      <div className="board-wrap">
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3} style={{ margin: 0 }}>새 글 작성</Title>
            <Button onClick={() => navigate('/board/free')}>목록</Button>
          </Space>
        </Card>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요' }]}>
              <Input placeholder="제목을 입력하세요" />
            </Form.Item>
            <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력해주세요' }]}>
              <TextArea rows={10} placeholder="내용을 입력하세요" />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Button type="primary" htmlType="submit">등록</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default FreeCreate;
