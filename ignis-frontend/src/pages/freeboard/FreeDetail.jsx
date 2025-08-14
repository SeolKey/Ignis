import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title, Text, Paragraph } = Typography;

const FreeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        // ✅ React 전용 상세 API (백엔드에 3-2 추가)
        const res = await fetch(`/post/react/detail/${id}`, { credentials: 'include', signal: ctrl.signal });
        if (!res.ok) throw new Error('DETAIL_FAIL');
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          const p = data.post ?? data;
          setItem({
            title: p.title ?? '제목',
            createdAt: (p.createdAt ?? '').toString().slice(0, 16),
            content: p.content ?? '',
          });
        } else {
          setItem({ title: '제목', createdAt: '', content: '' });
        }
      } catch {
        message.error('글을 불러오지 못했습니다.');
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  return (
    <Layout>
      <div className="board-wrap">
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>{item?.title ?? '상세'}</Title>
              <Text type="secondary">{item?.createdAt}</Text>
            </div>
            <Space>
              <Button onClick={() => navigate('/board/free')}>목록</Button>
              <Button type="primary" onClick={() => navigate(`/board/free/${id}/edit`)}>수정</Button>
            </Space>
          </Space>
        </Card>

        <Card>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {item?.content ?? '내용을 불러오는 중입니다.'}
          </Paragraph>
        </Card>
      </div>
    </Layout>
  );
};

export default FreeDetail;
