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
    const res = await fetch('/post/react/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ title: values.title, content: values.content }),
      credentials: 'include',
    });

    console.log('[create] status=', res.status, 'redirected=', res.redirected);
    const ct = res.headers.get('content-type') || '';
    console.log('[create] content-type=', ct);

    if (!res.ok) {
      const preview = await res.clone().text().catch(() => '');
      console.warn('[create] non-OK body:', preview.slice(0, 200));
      message.error(`등록 실패(${res.status})`);
      return;
    }

    if (!ct.includes('application/json')) {
      const preview = await res.clone().text().catch(() => '');
      console.warn('[create] non-JSON body:', preview.slice(0, 200));
      message.error('JSON이 아닌 응답(리다이렉트/로그인 만료 가능)');
      return;
    }

    const data = await res.json().catch((e) => {
      console.error('[create] JSON parse error:', e);
      return null;
    });
    console.log('[create] json=', data);

    // ✅ 성공 신호가 있을 때만 이동 (result/success/status/postId 등)
    const ok =
      data &&
      (data.result === '성공' ||
       data.success === true ||
       data.status === 'ok' ||
       !!data.postId || !!data.id);

    if (ok) {
      message.success('등록 완료');
      navigate('/board/free', { replace: true });
    } else {
      const hint = data?.error || data?.message || JSON.stringify(data);
      message.error(`등록 실패. ${hint ? `사유: ${String(hint).slice(0,120)}` : '사유 불명'}`);
    }
  } catch (err) {
    console.error('[create] fetch error:', err);
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
