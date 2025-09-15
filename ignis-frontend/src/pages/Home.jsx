// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Home.css';
import testImage from '../assets/testImage.png';

const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const backendBase = window.location.origin.includes(':5173')
    ? 'http://localhost'
    : window.location.origin;
  const path = String(p).startsWith('/') ? p : `/${p}`;
  return `${backendBase}${encodeURI(path)}`;
};

export default function MainPage() {
  const navigate = useNavigate();

  const [donationList, setDonationList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [fundingList, setFundingList] = useState([]);

  useEffect(() => {
    fetch('/api/home', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setDonationList(data?.donationList ?? []);

        const vl = data?.volunteerList ?? [];
        if (Array.isArray(vl) && vl.length > 0) {
          setVolunteerList(vl);
        } else {
          fetch('/volunteer/react/list', { credentials: 'include' })
            .then((r) => r.json())
            .then((d) => {
              const arr =
                d?.volunteerList ?? d?.postList ?? (Array.isArray(d) ? d : []);
              setVolunteerList(Array.isArray(arr) ? arr : []);
            })
            .catch(() => { });
        }

        const fl = data?.fundingList ?? [];
        if (Array.isArray(fl) && fl.length > 0) {
          setFundingList(fl);
        } else {
          fetch('/funding/react/list', { credentials: 'include' })
            .then((r) => r.json())
            .then((d) => {
              const arr =
                d?.fundingList ?? d?.postList ?? (Array.isArray(d) ? d : []);
              setFundingList(Array.isArray(arr) ? arr : []);
            })
            .catch(() => { });
        }
      })
      .catch((err) => console.error('홈 데이터 로드 실패:', err));
  }, []);

  return (
    <Layout>
      <div className="page home-layout">
        {/* 메인 영역 */}
        <div className="main-content">
          {/* 임시 배너 */}
          <div className="simple-banner">
            <h2>✨ IGNIS에 오신 것을 환영합니다</h2>
            <p>기부 · 봉사 · 펀딩을 통해 세상을 더 밝게 만들어보세요!</p>
          </div>
          {/* 카테고리 버튼 */}
          <div className="category-buttons">
            <button
              onClick={() => navigate('/donation-list')}
              className="category-btn donation"
            >
              <span>❤️</span>
              기부
            </button>
            <button
              onClick={() => navigate('/volunteer')}
              className="category-btn volunteer"
            >
              <span>🤝</span>
              봉사
            </button>
            <button
              onClick={() => navigate('/funding')}
              className="category-btn funding"
            >
              <span>📦</span>
              펀딩
            </button>
          </div>

          {/* 기부 */}
          <section className="section" style={{ marginTop: 40 }}>
            <div
              className="top-bar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>기부</h2>
              <a
                onClick={() => navigate('/donation-list')}
                style={{ cursor: 'pointer' }}
              >
                더 보러가기 →
              </a>
            </div>

            <div className="card-container card-grid">
              {donationList.map((item) => (
                <div
                  key={item.donationId ?? item.id}
                  className="card"
                  role="button"
                  onClick={() =>
                    navigate(`/donation-detail/${item.donationId ?? item.id}`)
                  }
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    transition:
                      'transform .18s ease, box-shadow .18s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 22px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0,0,0,0.08)';
                  }}
                >
                  <img
                    src={toImageUrl(item.imagePath)}
                    alt={item.title || '기부 이미지'}
                    className="donation-image"
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes(testImage))
                        e.currentTarget.src = testImage;
                    }}
                  />
                  <p
                    style={{
                      margin: '12px 14px 14px',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#111',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 봉사 */}
          <section className="section" style={{ marginTop: 48 }}>
            <div
              className="top-bar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>봉사</h2>
              <a
                onClick={() => navigate('/volunteer')}
                style={{ cursor: 'pointer' }}
              >
                더 보러가기 →
              </a>
            </div>

            <div className="card-container card-grid">
              {volunteerList.map((item) => (
                <div
                  key={item.volunteerId ?? item.id}
                  className="card"
                  role="button"
                  onClick={() =>
                    navigate(`/volunteer/${item.volunteerId ?? item.id}`)
                  }
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    transition:
                      'transform .18s ease, box-shadow .18s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 22px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0,0,0,0.08)';
                  }}
                >
                  <img
                    src={toImageUrl(item.imagePath)}
                    alt={item.title || '봉사 이미지'}
                    className="donation-image"
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes(testImage))
                        e.currentTarget.src = testImage;
                    }}
                  />
                  <p
                    style={{
                      margin: '12px 14px 14px',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#111',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 펀딩 */}
          <section className="section" style={{ marginTop: 48 }}>
            <div
              className="top-bar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>펀딩</h2>
              <a
                onClick={() => navigate('/funding')}
                style={{ cursor: 'pointer' }}
              >
                더 보러가기 →
              </a>
            </div>

            <div className="card-container card-grid">
              {fundingList.map((item) => (
                <div
                  key={item.fundingId ?? item.id}
                  className="card"
                  role="button"
                  onClick={() =>
                    navigate(`/funding/${item.fundingId ?? item.id}`)
                  }
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    transition:
                      'transform .18s ease, box-shadow .18s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 22px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0,0,0,0.08)';
                  }}
                >
                  <img
                    src={toImageUrl(item.imagePath)}
                    alt={item.title || '펀딩 이미지'}
                    className="donation-image"
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes(testImage))
                        e.currentTarget.src = testImage;
                    }}
                  />
                  <div style={{ padding: '12px 14px 14px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: '#111',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </p>
                    {(item.maxPrice != null || item.currentPrice != null) && (
                      <p
                        style={{
                          margin: '6px 0 0',
                          color: '#666',
                          fontSize: 13,
                        }}
                      >
                        {item.currentPrice != null && (
                          <>현재 {Number(item.currentPrice).toLocaleString()}원</>
                        )}
                        {item.maxPrice != null && (
                          <> / 목표 {Number(item.maxPrice).toLocaleString()}원</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 추천 프로젝트 */}
        <aside className="recommend-box">
          <h3 className="recommend-title">추천 프로젝트</h3>
          <ul className="recommend-list">
            <li className="recommend-item">
              <img src={testImage} alt="추천1" />
              <p>🔥 인기 프로젝트 1</p>
            </li>
            <li className="recommend-item">
              <img src={testImage} alt="추천2" />
              <p>💡 추천 프로젝트 2</p>
            </li>
            <li className="recommend-item">
              <img src={testImage} alt="추천3" />
              <p>🎨 창작 프로젝트 3</p>
            </li>
            <li className="recommend-item">
              <img src={testImage} alt="추천4" />
              <p>🌱 환경 프로젝트 4</p>
            </li>
            <li className="recommend-item">
              <img src={testImage} alt="추천5" />
              <p>📚 교육 프로젝트 5</p>
            </li>
            <li className="recommend-item">
              <img src={testImage} alt="추천6" />
              <p>⚡ 기술 프로젝트 6</p>
            </li>
          </ul>
        </aside>
      </div>
    </Layout>
  );
}
