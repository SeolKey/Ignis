import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Divider, message } from 'antd'; // message 임포트!
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';

const { Title, Text, Paragraph } = Typography;

const FundingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    fetch(`/funding/react/detail/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setItem(data?.funding ?? null)) // 컨트롤러 응답 { funding: {...} }
      .catch(() => message.error('펀딩 상세 불러오기 실패'));
  }, [id]);


  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>{item?.title ?? '펀딩 상세'}</Title>
              <Text type="secondary">{item?.createdAt}</Text>
            </div>
            <Space>
              <Button onClick={() => navigate('/funding')}>목록</Button>
              <Button type="primary" onClick={() => navigate(`/funding/${id}/edit`)}>수정</Button>
            </Space>
          </Space>
        </Card>

        <Card>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 380px' }}>
              <div style={{ width: 380, height: 260, background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                {/* 이미지 경로 있으면 표시 */}
                {item?.imagePath ? (
                  <img src={item.imagePath} alt="대표 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#888' }}>
                    대표 이미지
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: '1 1 300px', minWidth: 280 }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{item?.description}</Paragraph>
              <Divider />
              <Text>현재 모금액: <b>{item?.currentPrice?.toLocaleString()}원</b></Text><br />
              <Text>목표 금액: <b>{item?.maxPrice?.toLocaleString()}원</b></Text>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default FundingDetail;
