import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

const FundingList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // TODO: API 연동
  useEffect(() => {
    setLoading(true);
    // setData(mockData)
    setTimeout(() => {
      setData([
        { key: 1, id: 1, title: '테스트 펀딩 1', maxPrice: 1000000, currentPrice: 250000, createdAt: '2025-08-15' },
        { key: 2, id: 2, title: '테스트 펀딩 2', maxPrice: 2000000, currentPrice: 1800000, createdAt: '2025-08-14' },
      ]);
      setLoading(false);
    }, 200);
  }, []);

  const columns = [
    { title: '번호', dataIndex: 'id', width: 90, align: 'center' },
    { title: '제목', dataIndex: 'title', render: (t, r) => <a onClick={() => navigate(`/funding/${r.id}`)}>{t}</a> },
    { title: '목표금액', dataIndex: 'maxPrice', width: 140, render: (v) => v?.toLocaleString() + '원' },
    { title: '현재금액', dataIndex: 'currentPrice', width: 140, render: (v) => v?.toLocaleString() + '원' },
    { title: '작성일', dataIndex: 'createdAt', width: 140 },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>펀딩 목록</Title>
              <Text type="secondary">펀딩 프로젝트들을 확인하세요.</Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/funding/create')}>
              펀딩 생성
            </Button>
          </Space>
        </Card>

        <Card>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default FundingList;
