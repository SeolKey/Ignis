// src/pages/noticeboard/NoticeEdit.jsx
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
        // ✅ React 전용 상세 API
        const res = await fetch(`/notice/react/detail/${id}`, {
          credentials: 'include',
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error('DETAIL_FAIL');

        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          const n = data.notice ?? {}; // 컨트롤러 응답: { notice: {...} }
          form.setFieldsValue({
            title: n.title ?? '',
            content: n.content ?? '',
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

  const onFinish = async (values) => {
    try {
      const body = new URLSearchParams({
        title: values.title,
        content: values.content,
      });

      const res = await fetch(`/notice/react/edit/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        credentials: 'include',
      });

      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const txt = await res.text().catch(() => '');
        message.error(`수정 실패: JSON이 아님 (${res.status})`);
        console.warn('edit response (non-JSON):', txt);
        return;
      }

      const data = await res.json();
      if (res.ok && data?.result === 'success') {
        message.success('수정 완료');
        navigate(`/board/notice/${id}`);
      } else {
        message.error(`수정 실패: ${data?.reason || res.status}`);
      }
    } catch (e) {
      console.error(e);
      message.error('수정 실패 (네트워크 오류)');
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
