import React, { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Home.css';

const { Title, Text } = Typography;

export default function MainPage() {
  const navigate = useNavigate();
  const [donationList, setDonationList] = useState([]);

  useEffect(() => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';
  fetch(`${API_BASE}/api/home`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => setDonationList(data?.donationList ?? []))
    .catch(err => console.error('홈 데이터 로드 실패:', err));
}, []);


  return (
    <Layout>
      <div className="page">
        {/* 배너 */}
        <div className="banner-card" style={{ padding: 48 }}>
          <Title level={3} className="banner-title">여름, 시원한 바람을 느끼려면?</Title>
          <Text className="banner-desc">새로 입고된 텐 부채 확인해보세요!</Text>
          <Button className="banner-button">자세히 보기</Button>
        </div>

        {/* 기부 섹션 (home.html 구조 그대로) */}
        <section className="section">
          <div className="top-bar">
            <h2>기부</h2>
            {/* 목록으로 이동 */}
            <a onClick={() => navigate('/donation-list')} style={{ cursor: 'pointer' }}>
              더 보러가기 →
            </a>
          </div>

          <div className="card-container">
            {donationList.map((item) => (
              <div key={item.donationId} className="card">
                <a
                  onClick={() => navigate(`/donation-detail/${item.donationId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={item.imagePath}
                    alt="기부 이미지"
                    className="donation-image"
                  />
                  <p>{item.title}</p>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* (선택) 기부 생성 버튼 */}
        <Button
          type="primary"
          className="create-button"
          onClick={() => navigate('/donation-create')}
        >
          기부 생성하기
        </Button>
      </div>
    </Layout>
  );
}
