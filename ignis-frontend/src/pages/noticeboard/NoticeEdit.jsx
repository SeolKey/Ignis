import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title } = Typography;
const { TextArea } = Input;

const NoticeEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/notice/notice-detail-view/${id}`, { credentials: 'include', signal: ctrl.signal });
        if (!res.ok) throw new Error('DETAIL_FAIL');
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          form.setFieldsValue({
            title: data?.title ?? data?.notice?.title ?? '',
            content: data?.content ?? data?.notice?.content ?? '',
          });
        } else {
          form.setFieldsValue({ title: '', content: '' });
        }
      } catch {
        form.setFieldsValue({ title: '', content: '' });
      }
    })();
    return () => ctrl.abort();
  }, [id, form]);

  // 2) onFinish 저장 (기존 onFinish가 있다면 본문만 교체)
  const onFinish = async (values) => {
    try {
      const body = new URLSearchParams({ title: values.title, content: values.content });
      const res = await fetch(`/notice/notice-edit-view/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        credentials: 'include',
      });
      // 응답이 텍스트일 수도 있으니 성공 가정 후 이동
      if (res.ok) {
        message.success('수정 완료');
        navigate(`/board/notice/${id}`);
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
            <Title level={3} style={{ margin: 0 }}>공지 수정</Title>
            <Button onClick={() => navigate(`/board/notice/${id}`)}>상세로</Button>
          </Space>
        </Card>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력해주세요' }]}>
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

export default NoticeEdit;
