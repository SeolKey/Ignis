import React from 'react';
import { Card, Typography, Row, Col, Space, Divider, Statistic, List } from 'antd';
import { GiftTwoTone } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Dashboard({ user, stats = [], activities = [] }) {
  return (
    <>
      <div className="greeting-bar">
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            안녕하세요, {user.userName || '사용자'}님!
          </Title>
          <Text type="secondary">오늘도 좋은 하루 되세요.</Text>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s, idx) => (
          <Col xs={24} sm={12} lg={8} key={idx}>
            <Card className="stat-card" bordered={false}>
              <Space align="start" size="large">
                <div className="stat-icon"><GiftTwoTone twoToneColor="#1677ff" /></div>
                <div>
                  <Text type="secondary">{s.title}</Text>
                  <div>
                    {s.money ? (
                      <Statistic value={s.value} prefix="₩" valueStyle={{ fontSize: 28 }} />
                    ) : (
                      <Title level={2} style={{ margin: 0 }}>{s.value}건</Title>
                    )}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="최근 활동" extra={<a>전체 보기</a>} bordered={false}>
        <List
          itemLayout="horizontal"
          dataSource={activities}
          renderItem={(a, i) => (
            <>
              <List.Item>
                <List.Item.Meta
                  avatar={<div className="activity-icon">{a.icon}</div>}
                  title={<span className="activity-title">{a.title}</span>}
                  description={<Text type="secondary">{a.hint}</Text>}
                />
                <Text type="secondary">{a.time}</Text>
              </List.Item>
              {i !== activities.length - 1 && <Divider style={{ margin: '8px 0' }} />}
            </>
          )}
        />
      </Card>
    </>
  );
}
