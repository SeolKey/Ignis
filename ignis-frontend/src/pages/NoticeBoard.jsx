import React from 'react';
import { Card, List, Typography } from 'antd';
import Layout from '../components/Layout';

const { Title, Text } = Typography;

const NoticeBoard = () => {
  const notices = [
    { id: 1, title: '서비스 점검 안내', date: '2025-08-12' },
    { id: 2, title: '개인정보 처리방침 개정 안내', date: '2025-08-05' },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1080, margin: '24px auto', padding: '0 12px' }}>
        <Card style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>공지사항</Title>
          <Text type="secondary">중요 안내를 확인해줘.</Text>
        </Card>

        <Card>
          <List
            itemLayout="horizontal"
            dataSource={notices}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<a href={`/board/notice/${item.id}`}>{item.title}</a>}
                  description={<Text type="secondary">{item.date}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default NoticeBoard;
