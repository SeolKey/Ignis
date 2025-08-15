// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Home.css';
import testImage from '../assets/testImage.png';

const { Title, Text } = Typography;

// 이미지 경로 보정
const toImageUrl = (p) => {
  if (!p) return testImage; // 🔹 이미지가 없으면 기본 이미지
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

export default function MainPage() {
  const navigate = useNavigate();

  const [donationList, setDonationList] = useState([]);
  const [fundingList, setFundingList] = useState([]);

  useEffect(() => {
    // 1) 홈 API에서 donationList / fundingList 둘 다 시도
    fetch('/api/home', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setDonationList(data?.donationList ?? []);
        // fundingList가 같이 오면 사용
        const fl = data?.fundingList ?? [];
        setFundingList(Array.isArray(fl) ? fl : []);
        // 홈 응답에 fundingList가 없으면 보조 API 시도
        if (!fl || fl.length === 0) {
          fetch('/funding/react/list', { credentials: 'include' })
            .then((r) => r.json())
            .then((d) => {
              // 백엔드 구조 유연 처리: { fundingList: [...] } 또는 { postList: [...] } 또는 [...]
              const arr =
                d?.fundingList ??
                d?.postList ??
                (Array.isArray(d) ? d : []);
              setFundingList(Array.isArray(arr) ? arr : []);
            })
            .catch(() => {});
        }
      })
      .catch((err) => console.error('홈 데이터 로드 실패:', err));
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

        {/* 기부 섹션 */}
        <section className="section" style={{ marginTop: 40 }}>
          <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>기부</h2>
            <a onClick={() => navigate('/donation-list')} style={{ cursor: 'pointer' }}>
              더 보러가기 →
            </a>
          </div>

          <div
            className="card-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {donationList.map((item) => (
              <div
                key={item.donationId ?? item.id}
                className="card"
                role="button"
                onClick={() => navigate(`/donation-detail/${item.donationId ?? item.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                  transition: 'transform .18s ease, box-shadow .18s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                }}
              >
                <img
                  src={toImageUrl(item.imagePath)}
                  alt={item.title || '기부 이미지'}
                  className="donation-image"
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes(testImage)) {
                      e.currentTarget.src = testImage;
                    }
                  }}
                />
                <p style={{
                  margin: '12px 14px 14px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: '#111',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* (선택) 기부 생성 버튼 */}
        <Button
          type="primary"
          className="create-button"
          onClick={() => navigate('/donation-create')}
          style={{ marginTop: 24 }}
        >
          기부 생성하기
        </Button>

        {/* 🔻 펀딩 섹션 (기부 아래) */}
        <section className="section" style={{ marginTop: 48 }}>
          <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>펀딩</h2>
            <a onClick={() => navigate('/funding')} style={{ cursor: 'pointer' }}>
              더 보러가기 →
            </a>
          </div>

          <div
            className="card-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {fundingList.map((item) => (
              <div
                key={item.fundingId ?? item.id}
                className="card"
                role="button"
                onClick={() => navigate(`/funding/${item.fundingId ?? item.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                  transition: 'transform .18s ease, box-shadow .18s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                }}
              >
                <img
                  src={toImageUrl(item.imagePath)}
                  alt={item.title || '펀딩 이미지'}
                  className="donation-image"
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes(testImage)) {
                      e.currentTarget.src = testImage;
                    }
                  }}
                />
                <div style={{ padding: '12px 14px 14px' }}>
                  <p style={{
                    margin: 0,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: '#111',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.title}
                  </p>
                  {/* 목표/현재 금액 표시(있을 때만) */}
                  {(item.maxPrice != null || item.currentPrice != null) && (
                    <p style={{ margin: '6px 0 0', color: '#666', fontSize: 13 }}>
                      {item.currentPrice != null && <>현재 {Number(item.currentPrice).toLocaleString()}원</>}
                      {item.maxPrice != null && <> / 목표 {Number(item.maxPrice).toLocaleString()}원</>}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
