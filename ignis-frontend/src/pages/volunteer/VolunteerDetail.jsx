// src/pages/volunteer/VolunteerDetail.jsx
import React, { useEffect, useState } from 'react';
import { Typography, Card, Skeleton, Empty } from 'antd';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import testImage from '../../assets/testImage.png';

const { Title, Paragraph } = Typography;

const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

export default function VolunteerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/volunteer/react/detail/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <div className="page" style={{ maxWidth: 880, margin: '24px auto' }}>
        {loading ? (
          <Skeleton active />
        ) : !data ? (
          <Empty description="봉사 정보를 불러올 수 없습니다." />
        ) : (
          <>
            <Title level={3} style={{ marginBottom: 12 }}>{data.title}</Title>
            <Card cover={
              <img
                alt={data.title}
                src={toImageUrl(data.imagePath)}
                style={{ maxHeight: 420, objectFit: 'cover' }}
                onError={(e) => { if (!e.currentTarget.src.includes(testImage)) e.currentTarget.src = testImage; }}
              />
            }>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {data.description}
              </Paragraph>
              {/* 필요한 경우 일정/장소/모집인원 등 메타 필드 섹션 추가 */}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
