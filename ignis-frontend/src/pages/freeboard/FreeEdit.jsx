import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title } = Typography;
const { TextArea } = Input;

const FreeEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        // ✅ React 전용 상세 로드
        const res = await fetch(`/post/react/detail/${id}`, {
          credentials: 'include',
          signal: ctrl.signal,
        });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          const p = data.post ?? data;
          form.setFieldsValue({
            title: p.title ?? '',
            content: p.content ?? '',
          });
        } else {
          form.setFieldsValue({ title: '', content: '' });
        }
      } catch {
        message.error('글 불러오기 실패');
      }
    })();
    return () => ctrl.abort();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      // ✅ React 전용 수정 API (폼 전송)
      const res = await fetch(`/post/react/edit/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ title: values.title, content: values.content }),
        credentials: 'include',
      });
      if (res.ok) {
        message.success('수정 완료');
        navigate(`/board/free/${id}`);
      } else {
        message.error('수정 실패');
      }
    } catch {
      message.error('수정 실패');
    }
  };

  return (
    <Layout>
      <div className="board-wrap">
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3} style={{ margin: 0 }}>글 수정</Title>
            <Button onClick={() => navigate(`/board/free/${id}`)}>상세로</Button>
          </Space>
        </Card>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="title"
              label="제목"
              rules={[{ required: true, message: '제목을 입력해주세요' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="content"
              label="내용"
              rules={[{ required: true, message: '내용을 입력해주세요' }]}
            >
              <TextArea rows={10} />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Button type="primary" htmlType="submit">저장</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default FreeEdit;
