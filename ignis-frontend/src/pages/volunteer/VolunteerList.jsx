// src/pages/volunteer/VolunteerList.jsx
import React, { useEffect, useState } from 'react';
import { Button, Typography, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Home.css'; // 카드 그리드 재사용
import testImage from '../../assets/testImage.png';

const { Title } = Typography;

const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

export default function VolunteerList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch('/volunteer/react/list', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const arr = d?.volunteerList ?? d?.postList ?? (Array.isArray(d) ? d : []);
        setList(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setList([]));
  }, []);

  return (
    <Layout>
      <div className="page" style={{ paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>봉사 목록</Title>
          <Button type="primary" onClick={() => navigate('/volunteer/create')}>봉사 생성</Button>
        </div>

        {list.length === 0 ? (
          <Empty description="등록된 봉사가 없습니다." />
        ) : (
          <div className="card-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {list.map((item) => (
              <div
                key={item.volunteerId ?? item.id}
                className="card"
                role="button"
                onClick={() => navigate(`/volunteer/${item.volunteerId ?? item.id}`)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', cursor: 'pointer' }}
              >
                <img
                  src={toImageUrl(item.imagePath)}
                  alt={item.title || '봉사 이미지'}
                  className="donation-image"
                  loading="lazy"
                  onError={(e) => { if (!e.currentTarget.src.includes(testImage)) e.currentTarget.src = testImage; }}
                />
                <p style={{ margin: '12px 14px 14px', fontWeight: 600, lineHeight: 1.3, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
