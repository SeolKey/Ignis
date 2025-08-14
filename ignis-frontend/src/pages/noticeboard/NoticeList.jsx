import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Table, Typography, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title, Text } = Typography;
const { Search } = Input;

const NoticeList = () => {

  const navigate = useNavigate();
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/notice/react/list', { credentials: 'include', signal: ctrl.signal });
        if (!res.ok) throw new Error('LIST_FAIL');

        // JSON 응답이면 파싱, 템플릿이면 빈 배열 처리
        const ct = res.headers.get('content-type') || '';
        let data = [];
        if (ct.includes('application/json')) {
          const json = await res.json();
          data = Array.isArray(json?.noticeList) ? json.noticeList : Array.isArray(json) ? json : [];
        }
        setRaw(data);
      } catch {
        // 개발 중 템플릿 응답일 수 있어 조용 처리
        setRaw([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const data = useMemo(() => {
    return raw.map((n, i) => ({
      key: n.noticeId ?? n.id ?? i + 1,
      no: n.noticeId ?? n.id ?? i + 1,
      title: n.title ?? '제목',
      date: (n.createdAt ?? n.created_at ?? '').toString().slice(0, 10),
      tags: n.isPinned ? ['공지'] : [],
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
        <Space direction="vertical" size={0}>
          <a className="board-link" onClick={() => navigate(`/board/notice/${row.key}`)}>{text}</a>
          <div className="board-tags">{row.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        </Space>
      ),
    },
    { title: '작성일', dataIndex: 'date', width: 160 },
  ];

  return (
    <Layout>
      <div className="board-wrap">
        <Card className="board-header-card">
          <Space className="board-header" align="center" wrap>
            <div>
              <Title level={3} style={{ margin: 0 }}>공지사항</Title>
              <Text type="secondary">중요 공지를 확인해 주세요.</Text>
            </div>
            <Space className="board-actions" align="center" wrap>
              <Search placeholder="제목 검색" onSearch={setQ} allowClear enterButton className="board-search" />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/board/notice/create')}>
                공지 작성
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

export default NoticeList;
