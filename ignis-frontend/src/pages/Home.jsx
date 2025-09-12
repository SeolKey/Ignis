// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Home.css';
import testImage from '../assets/testImage.png';

const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;               // 이미 절대 URL이면 그대로
  const backendBase = window.location.origin.includes(':5173')
    ? 'http://localhost'                                // server.port=80 → http://localhost
    : window.location.origin;                           // 배포 시에는 동일 오리진
  const path = String(p).startsWith('/') ? p : `/${p}`;
  return `${backendBase}${encodeURI(path)}`;
};

export default function MainPage() {
  const navigate = useNavigate();

  const [donationList, setDonationList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [fundingList, setFundingList] = useState([]);

  useEffect(() => {
    // 홈에서 donationList, fundingList 우선 시도
    fetch('/api/home', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setDonationList(data?.donationList ?? []);

        // 봉사(없으면 보조 API로 로드)
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

        // 펀딩(없으면 보조 API로 로드)
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

  // ✅ 요청한 색상: 하늘색 / 초록 / 주황
  const baseSlides = [
    {
      title: '여름, 시원한 바람을 느끼려면?',
      desc: '새로 입고된 텐 부채 확인해보세요!',
      cta: '자세히 보기',
      bg: 'linear-gradient(135deg, #91d5ff, #1677ff)', // 하늘색
    },
    {
      title: '희망의 불씨, IGNIS',
      desc: '기부·봉사·펀딩으로 세상을 밝히자',
      cta: '지금 시작하기',
      bg: 'linear-gradient(135deg, #95de64, #52c41a)', // 초록
    },
    {
      title: '오늘의 봉사 추천',
      desc: '가까운 곳에서 바로 참여해봐요',
      cta: '봉사 보러가기',
      bg: 'linear-gradient(135deg, #ffd591, #fa8c16)', // 주황
    },
  ];

  // [last] + base + [first] (무한 루프 슬라이드용 클론)
  const slides = [baseSlides[baseSlides.length - 1], ...baseSlides, baseSlides[0]];

  const [idx, setIdx] = useState(1);          // 첫 실제 슬라이드에서 시작
  const [noAnim, setNoAnim] = useState(false); // 점프 시 transition 제거
  const trackRef = useRef(null);

  // 자동 슬라이드 (오른쪽으로만)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => i + 1), 4000);
    return () => clearInterval(t);
  }, []);

  // transition 끝나면 양 끝에서 점프 처리
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onEnd = (e) => {
      if (e.propertyName !== 'transform') return; // ⭐ transform만 처리

      if (idx === slides.length - 1) {
        setNoAnim(true);
        setIdx(1);
        requestAnimationFrame(() => setNoAnim(false));
      }
      if (idx === 0) {
        setNoAnim(true);
        setIdx(slides.length - 2);
        requestAnimationFrame(() => setNoAnim(false));
      }
    };

    el.addEventListener('transitionend', onEnd);
    return () => el.removeEventListener('transitionend', onEnd);
  }, [idx, slides.length]);
  useEffect(() => {
    if (idx === slides.length - 1) {
      const t = setTimeout(() => {
        setNoAnim(true);
        setIdx(1);
        requestAnimationFrame(() => setNoAnim(false));
      }, 480); // transition 0.45s보다 살짝 길게
      return () => clearTimeout(t);
    }
    if (idx === 0) {
      const t = setTimeout(() => {
        setNoAnim(true);
        setIdx(slides.length - 2);
        requestAnimationFrame(() => setNoAnim(false));
      }, 480);
      return () => clearTimeout(t);
    }
  }, [idx, slides.length]);



  // 표시용 현재 페이지(점/인디케이터)
  const page = (idx - 1 + baseSlides.length) % baseSlides.length;

  // 좌우 버튼
  const goPrev = () => setIdx((i) => i - 1);
  const goNext = () => setIdx((i) => i + 1);

  // 점 클릭
  const goTo = (i) => setIdx(i + 1); // 클론 한 칸 보정

  return (
    <Layout>
      <div className="page">
        {/* 배너 슬라이더 */}
        {/* 배너 바깥 화살표 + 슬라이더 */}
        <div className="banner-wrap">
          <button className="banner-arrow outside left" onClick={goPrev} aria-label="이전">‹</button>

          <div className="banner-slider">
            <div
              ref={trackRef}
              className="banner-track"
              style={{
                transform: `translateX(-${idx * 100}%)`,
                transition: noAnim ? 'none' : 'transform 0.45s ease',
              }}
            >
              {slides.map((s, i) => (
                <div className="banner-card" key={i} style={{ background: s.bg }}>
                  <h3 className="banner-title">{s.title}</h3>
                  <p className="banner-desc">{s.desc}</p>
                  <button className="banner-button" type="button">
                    {s.cta}
                    <span className="arrow">→</span>
                  </button>

                </div>
              ))}
            </div>

            {/* 인디케이터(점) */}
            <div className="banner-dots">
              {baseSlides.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === page ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`배너 ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button className="banner-arrow outside right" onClick={goNext} aria-label="다음">›</button>
        </div>
        {/* 카테고리 버튼 영역 */}
        <div className="category-buttons">
          <button onClick={() => navigate('/donation-list')} className="category-btn donation">
            <span>❤️</span>
            기부
          </button>
          <button onClick={() => navigate('/volunteer')} className="category-btn volunteer">
            <span>🤝</span>
            봉사
          </button>
          <button onClick={() => navigate('/funding')} className="category-btn funding">
            <span>📦</span>
            펀딩
          </button>
        </div>



        {/* 기부 */}
        <section className="section" style={{ marginTop: 40 }}>
          <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>기부</h2>
            <a onClick={() => navigate('/donation-list')} style={{ cursor: 'pointer' }}>더 보러가기 →</a>
          </div>

          <div className="card-container card-grid">
            {donationList.map((item) => (
              <div
                key={item.donationId ?? item.id}
                className="card"
                role="button"
                onClick={() => navigate(`/donation-detail/${item.donationId ?? item.id}`)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', transition: 'transform .18s ease, box-shadow .18s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
              >
                <img
                  src={toImageUrl(item.imagePath)}
                  alt={item.title || '기부 이미지'}
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
        </section>

        {/* 봉사 */}
        <section className="section" style={{ marginTop: 48 }}>
          <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>봉사</h2>
            <a onClick={() => navigate('/volunteer')} style={{ cursor: 'pointer' }}>더 보러가기 →</a>
          </div>

          <div className="card-container card-grid">
            {volunteerList.map((item) => (
              <div
                key={item.volunteerId ?? item.id}
                className="card"
                role="button"
                onClick={() => navigate(`/volunteer/${item.volunteerId ?? item.id}`)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', transition: 'transform .18s ease, box-shadow .18s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
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
        </section>

        {/* 펀딩 */}
        <section className="section" style={{ marginTop: 48 }}>
          <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>펀딩</h2>
            <a onClick={() => navigate('/funding')} style={{ cursor: 'pointer' }}>더 보러가기 →</a>
          </div>

          <div className="card-container card-grid">
            {fundingList.map((item) => (
              <div
                key={item.fundingId ?? item.id}
                className="card"
                role="button"
                onClick={() => navigate(`/funding/${item.fundingId ?? item.id}`)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', transition: 'transform .18s ease, box-shadow .18s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
              >
                <img
                  src={toImageUrl(item.imagePath)}
                  alt={item.title || '펀딩 이미지'}
                  className="donation-image"
                  loading="lazy"
                  onError={(e) => { if (!e.currentTarget.src.includes(testImage)) e.currentTarget.src = testImage; }}
                />
                <div style={{ padding: '12px 14px 14px' }}>
                  <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.3, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </p>
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
