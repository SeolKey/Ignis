import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Table, Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title, Text } = Typography;
const { Search } = Input;

const FreeList = () => {
  const navigate = useNavigate();
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // ✅ React 전용 목록 API (백엔드에 아래 3-1 추가)
        const res = await fetch('/post/react/list', { credentials: 'include', signal: ctrl.signal });
        if (!res.ok) throw new Error('LIST_FAIL');
        const ct = res.headers.get('content-type') || '';
        let data = [];
        if (ct.includes('application/json')) {
          const json = await res.json();
          data = Array.isArray(json?.postList) ? json.postList : Array.isArray(json) ? json : [];
        }
        setRaw(data);
      } catch {
        setRaw([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const data = useMemo(() => {
    return raw.map((p, i) => ({
      key: p.postId ?? p.id ?? i + 1,
      no: p.postId ?? p.id ?? i + 1,
      title: p.title ?? '제목',
      date: (p.createdAt ?? p.created_at ?? '').toString().slice(0, 16),
    }));
  }, [raw]);

  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    const qq = q.toLowerCase();
    return data.filter((r) => r.title.toLowerCase().includes(qq));
  }, [data, q]);

  const columns = [
    { title: '번호', dataIndex: 'no', width: 90, align: 'center' },
    {
      title: '제목',
      dataIndex: 'title',
      render: (text, row) => (
        <a className="board-link" onClick={() => navigate(`/board/free/${row.key}`)}>{text}</a>
      ),
    },
    { title: '작성일', dataIndex: 'date', width: 180 },
  ];

  return (
    <Layout>
      <div className="board-wrap">
        <Card className="board-header-card">
          <Space className="board-header" align="center" wrap>
            <div>
              <Title level={3} style={{ margin: 0 }}>자유게시판</Title>
              <Text type="secondary">자유롭게 소통하는 공간입니다.</Text>
            </div>
            <Space className="board-actions" align="center" wrap>
              <Search placeholder="제목 검색" onSearch={setQ} allowClear enterButton className="board-search" />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/board/free/create')}>
                글쓰기
              </Button>
            </Space>
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="key"
          />
        </Card>
      </div>
    </Layout>
  );
};

export default FreeList;
