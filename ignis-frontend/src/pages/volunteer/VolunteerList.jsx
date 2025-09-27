import React, { useEffect, useState } from 'react';
import { Button, Typography, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerList.css';  
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
      <div className="vol-list-page">
        <div className="vol-list-header">
          <Title level={3} className="vol-list-title">봉사 도와주러 가기</Title>
          <Button type="primary" onClick={() => navigate('/volunteer/create')}>봉사 생성</Button>
        </div>

        {list.length === 0 ? (
          <Empty description="등록된 봉사가 없습니다." className="vol-list-empty" />
        ) : (
          <div className="vol-grid">
            {list.map((item) => (
              <article
                key={item.volunteerId ?? item.id}
                className="vol-card"
                onClick={() => navigate(`/volunteer/${item.volunteerId ?? item.id}`)}
              >
                <img
                  src={toImageUrl(item.imagePath)}
                  alt={item.title || '봉사 이미지'}
                  className="vol-thumb"
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes(testImage)) e.currentTarget.src = testImage;
                  }}
                />
                <div className="vol-body">
                  <h3 className="vol-title">{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
