import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/home/Home.css';
import testImage from '../../assets/testImage.png';
import { Card, Segmented, Space } from 'antd';

import Banner from './Banner';
import RecommendedProjects from './RecommendedProjects';

// 이미지 경로 → 절대URL로 보정
const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const backendBase = window.location.origin.includes(':5173')
    ? 'http://localhost'
    : window.location.origin;
  const path = String(p).startsWith('/') ? p : `/${p}`;
  return `${backendBase}${encodeURI(path)}`;
};

export default function Home() {
  const navigate = useNavigate();

  const [donationList, setDonationList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [fundingList, setFundingList] = useState([]);
  const [recTab, setRecTab] = useState('전체');


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
              const arr = d?.volunteerList ?? d?.postList ?? (Array.isArray(d) ? d : []);
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
              const arr = d?.fundingList ?? d?.postList ?? (Array.isArray(d) ? d : []);
              setFundingList(Array.isArray(arr) ? arr : []);
            })
            .catch(() => { });
        }
      })
      .catch((err) => console.error('홈 데이터 로드 실패:', err));
  }, []);

  // 통합 추천 소스(최대 6개는 필터 후 자르기)
  const combinedRecommend = useMemo(() => {
    const norm = (it, type) => ({
      id: it.fundingId ?? it.donationId ?? it.volunteerId ?? it.id ?? it.postId ?? it.projectId,
      title: it.title ?? it.name ?? `${type} 프로젝트`,
      image: toImageUrl(it.imagePath ?? it.thumbnailUrl ?? it.imageUrl),
      type, // '펀딩' | '기부' | '봉사'
    });
    return [
      ...(fundingList || []).map((x) => norm(x, '펀딩')),
      ...(donationList || []).map((x) => norm(x, '기부')),
      ...(volunteerList || []).map((x) => norm(x, '봉사')),
    ];
  }, [fundingList, donationList, volunteerList]);

  const recommendItems = useMemo(() => {
    const src =
      recTab === '전체'
        ? combinedRecommend
        : combinedRecommend.filter((x) => x.type === recTab);
    return src.slice(0, 6);
  }, [combinedRecommend, recTab]);

  return (
    <Layout>
      <div className="page home-layout">
        {/* 메인 컬럼 */}
        <div className="main-content">
          {/* ▶ 분리된 배너 */}
          <Banner
            title="세상에 불을 밝히는 작은 불꽃, IGNIS"
            subtitle="당신의 작은 선택이 세상을 바꿉니다, IGNIS에서 시작하세요."
            subNote="작은 참여가 큰 희망을 만듭니다"
          />

          {/* 카테고리 버튼 */}
          <div className="category-buttons">
            <div className="category-item">
              <button onClick={() => navigate('/donation-list')} className="category-btn donation">❤️</button>
              <p className="category-label">기부</p>
            </div>
            <div className="category-item">
              <button onClick={() => navigate('/volunteer')} className="category-btn volunteer">🤝</button>
              <p className="category-label">봉사</p>
            </div>
            <div className="category-item">
              <button onClick={() => navigate('/funding')} className="category-btn funding">📦</button>
              <p className="category-label">펀딩</p>
            </div>
          </div>

          {/* 기부 섹션 */}
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
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 봉사 섹션 */}
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
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 펀딩 섹션 */}
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
                        {item.maxPrice != null && <> 목표 금액 {Number(item.maxPrice).toLocaleString()}원</>}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ▶ 분리된 추천 프로젝트 */}
        <aside className="recommend-box">
          <Card bordered={false} className="recommend-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Segmented
                options={['전체', '기부', '펀딩', '봉사']}
                value={recTab}
                onChange={setRecTab}
                size="large"
                className="recommend-segmented"
              />

              <RecommendedProjects
                title={`추천 ${recTab === '전체' ? '프로젝트' : recTab}`}
                items={recommendItems}
                // 아이템 타입에 따라 라우팅 분기
                onClickItem={(item) => {
                  if (!item?.id) return;
                  if (item.type === '펀딩') navigate(`/funding/${item.id}`);
                  else if (item.type === '기부') navigate(`/donation-detail/${item.id}`);
                  else if (item.type === '봉사') navigate(`/volunteer/${item.id}`);
                }}
                fallbackImage={testImage}
                showTypeTag
              />
            </Space>
          </Card>
        </aside>
      </div>
    </Layout>
  );
}
