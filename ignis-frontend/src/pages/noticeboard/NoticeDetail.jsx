import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title, Text, Paragraph } = Typography;

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/notice/notice-detail-view/${id}`, { credentials: 'include', signal: ctrl.signal });
        if (!res.ok) throw new Error('DETAIL_FAIL');

        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          setItem({
            title: data.title ?? data.notice?.title ?? '공지 제목',
            createdAt: (data.createdAt ?? data.notice?.createdAt ?? '').toString().slice(0, 10),
            content: data.content ?? data.notice?.content ?? '',
          });
        } else {
          // 템플릿 응답이면 목업으로 표시
          setItem({ title: '공지 제목', createdAt: '', content: '' });
        }
      } catch {
        setItem({ title: '공지 상세', createdAt: '', content: '' });
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
              <Title level={3} style={{ margin: 0 }}>{item?.title ?? '공지 상세'}</Title>
              <Text type="secondary">{item?.createdAt}</Text>
            </div>
            <Space>
              <Button onClick={() => navigate('/board/notice')}>목록</Button>
              <Button type="primary" onClick={() => navigate(`/board/notice/${id}/edit`)}>수정</Button>
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

export default NoticeDetail;
