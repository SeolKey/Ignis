import React, { useMemo, useState } from 'react';
import { Card, Button, Input, Table, Tag, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Layout from '../components/Layout';
import '../styles/Board.css';

const { Title, Text } = Typography;
const { Search } = Input;

const BoardFree = () => {
  // 데모용 더미 데이터
  const [query, setQuery] = useState('');
  const data = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        key: i + 1,
        no: 42 - i,
        title: `IGNIS 자유게시판 테스트 글 #${i + 1}`,
        author: i % 3 === 0 ? '관리자' : `user${(i % 9) + 1}`,
        date: `2025-08-${(i % 28) + 1}`.replace(/-(\d)$/, '-0$1'),
        views: 100 + i * 3,
        tags: i % 5 === 0 ? ['공지'] : i % 2 ? ['잡담'] : ['질문'],
      })),
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.author.toLowerCase().includes(q) ||
        row.tags.join(',').toLowerCase().includes(q)
    );
  }, [data, query]);

  const columns = [
    { title: '번호', dataIndex: 'no', width: 80, align: 'center' },
    {
      title: '제목',
      dataIndex: 'title',
      render: (text, row) => (
        <Space direction="vertical" size={0}>
          <a href={`/board/free/${row.key}`} className="board-link">{text}</a>
          <div className="board-tags">
            {row.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </Space>
      ),
    },
    { title: '작성자', dataIndex: 'author', width: 140 },
    { title: '작성일', dataIndex: 'date', width: 140 },
    { title: '조회', dataIndex: 'views', width: 100, align: 'right' },
  ];

  const onSearch = (val) => setQuery(val);

  const handleCreate = () => {
    // TODO: 글쓰기 라우팅 연결
    // 예: navigate('/board/free/write');
    alert('글쓰기 페이지로 연결 예정!');
  };

  return (
    <Layout>
      <div className="board-wrap">
        <Card className="board-header-card">
          <Space className="board-header" align="center" wrap>
            <div>
              <Title level={3} style={{ margin: 0 }}>자유게시판</Title>
              <Text type="secondary">커뮤니티 가이드라인을 준수해줘 🙏</Text>
            </div>
            <Space className="board-actions" align="center" wrap>
              <Search
                placeholder="제목/작성자/태그 검색"
                onSearch={onSearch}
                allowClear
                enterButton
                className="board-search"
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                글쓰기
              </Button>
            </Space>
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="key"
          />
        </Card>
      </div>
    </Layout>
  );
};

export default BoardFree;
