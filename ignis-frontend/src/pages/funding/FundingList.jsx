import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Table, Typography, message } from 'antd'; // message 임포트!
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

const FundingList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/funding/react/list', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => setData(json?.fundingList ?? [])) // 컨트롤러 응답 { fundingList: [...] }
      .catch(() => message.error('펀딩 목록 불러오기 실패'))
      .finally(() => setLoading(false));
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
