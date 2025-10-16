import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/home/Home.css';
import testImage from '../../assets/testImage.png';
import HomeGridSection from './HomeGridSection';
import DailyQuoteCard from './DailyQuoteCard';
import { Card, Segmented, Space, message } from 'antd';
import { HeartTwoTone, SmileTwoTone, GiftTwoTone } from "@ant-design/icons";

import Banner from './Banner';
import EmergencyBanner from './EmergencyBanner'; // ✅ 추가(경로 유지)
import RecommendedProjects from './RecommendedProjects';
import LoginWidget from './LoginWidget';

// 상대경로 이미지를 절대경로로 보정(백엔드 정적 리소스)
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

  // 메인 카드 데이터
  const [donationList, setDonationList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [fundingList, setFundingList] = useState([]);

  // 추천 탭
  const [recTab, setRecTab] = useState('전체');

  // 로그인 상태
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

  // ✅ 긴급 배너 상태
  const [emg, setEmg] = useState(null);
  const [emgLoading, setEmgLoading] = useState(true);

  useEffect(() => {
    // 내 세션
    fetch('/user/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setMe(u || null))
      .catch(() => {})
      .finally(() => setMeLoading(false));

    // 홈 섹션 데이터
    fetch('/api/home', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setDonationList(data?.donationList ?? []);
        setVolunteerList(data?.volunteerList ?? []);
        setFundingList(data?.fundingList ?? []);
      })
      .catch(() => {
        // 폴백: 개별 목록 API
        Promise.allSettled([
          fetch('/donation/react/list', { credentials: 'include' }).then(r => r.json()),
          fetch('/volunteer/react/list', { credentials: 'include' }).then(r => r.json()),
          fetch('/funding/react/list', { credentials: 'include' }).then(r => r.json()),
        ]).then(([d, v, f]) => {
          try {
            const dl = d.value?.donationList ?? d.value?.postList ?? (Array.isArray(d.value) ? d.value : []);
            const vl = v.value?.volunteerList ?? v.value?.postList ?? (Array.isArray(v.value) ? v.value : []);
            const fl = f.value?.fundingList ?? f.value?.postList ?? (Array.isArray(f.value) ? f.value : []);
            setDonationList(Array.isArray(dl) ? dl : []);
            setVolunteerList(Array.isArray(vl) ? vl : []);
            setFundingList(Array.isArray(fl) ? fl : []);
          } catch {
            message.error('홈 데이터를 불러오지 못했습니다.');
          }
        });
      });

    // ✅ 긴급 배너 자동 감지 (DB의 is_emergency 기반)
    const loadEmergency = () => {
      fetch('/admin/api/emergency/check', { credentials: 'include' })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          // data 예: { isActive: true, type: "emergency", title, desc, imagePath, ctaText, ctaHref, endAt, severity, ribbon }
          const hiddenUntil = sessionStorage.getItem('ignis:hideEmgUntil');
          const now = Date.now();

          if (data?.isActive && data?.type !== 'none') {
            if (hiddenUntil && now < Number(hiddenUntil)) {
              setEmg(null);
            } else {
              setEmg({
                isActive: true,
                title: data.title ?? '🚨 긴급 공지',
                subtitle: data.desc ?? '지금 가장 도움이 필요한 곳입니다.',
                bgImage: toImageUrl(data.imagePath ?? '/assets/emergency_default.jpg'),
                ctaText: data.ctaText ?? '자세히 보기',
                ctaHref: data.ctaHref ?? '/donation-list',
                severity: data.severity ?? 'red',
                endAt: data.endAt ?? null,
                ribbon: data.ribbon ?? '긴급',
              });
            }
          } else {
            setEmg(null);
          }
        })
        .catch(() => setEmg(null))
        .finally(() => setEmgLoading(false));
    };

    loadEmergency();
    const iv = setInterval(loadEmergency, 5 * 60 * 1000); // 5분마다 재확인
    return () => clearInterval(iv);
  }, []);

  // 추천 묶음
  const combinedRecommend = useMemo(() => {
    const norm = (it, type) => ({
      id: it.fundingId ?? it.donationId ?? it.volunteerId ?? it.id ?? it.postId ?? it.projectId,
      title: it.title ?? it.name ?? `${type} 프로젝트`,
      image: toImageUrl(it.imagePath ?? it.thumbnailUrl ?? it.imageUrl),
      type,
    });
    return [
      ...(fundingList || []).map((x) => norm(x, '펀딩')),
      ...(donationList || []).map((x) => norm(x, '기부')),
      ...(volunteerList || []).map((x) => norm(x, '봉사')),
    ];
  }, [fundingList, donationList, volunteerList]);

  const recommendItems = useMemo(() => {
    const src = recTab === '전체' ? combinedRecommend : combinedRecommend.filter((x) => x.type === recTab);
    return src.slice(0, 10);
  }, [combinedRecommend, recTab]);

  // 긴급배너 닫기(사용자 로컬 기억)
  const handleCloseEmg = () => {
    const until = emg?.endAt ? new Date(emg.endAt).getTime() : Date.now() + 12 * 60 * 60 * 1000; // 12시간
    sessionStorage.setItem('ignis:hideEmgUntil', String(until));
    setEmg(null);
  };

  return (
    <Layout>
      <div className="page home-layout">
        {/* 메인 컬럼 */}
        <div className="main-content">

          {/* ✅ 긴급 배너 우선, 없으면 기본 배너 */}
          {!emgLoading && emg ? (
            <EmergencyBanner
              ribbon={emg.ribbon}
              severity={emg.severity}
              title={emg.title}
              subtitle={emg.subtitle}
              bgImage={emg.bgImage}
              ctaText={emg.ctaText}
              endAt={emg.endAt}
              onClickCta={() => navigate('/emergency')}
              onClose={handleCloseEmg}
            />
          ) : (
            <Banner
              title="세상에 불을 밝히는 작은 불꽃, IGNIS"
              subtitle="당신의 작은 선택이 세상을 바꿉니다."
              subNote="작은 참여가 큰 희망을 만듭니다"
            />
          )}

          {/* 카테고리 진입 카드 */}
          <div className="category-buttons">
            <Card hoverable className="category-card donation" onClick={() => navigate('/donation-list')}>
              <HeartTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 32 }} />
              <p className="category-label">기부</p>
            </Card>
            <Card hoverable className="category-card volunteer" onClick={() => navigate('/volunteer')}>
              <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 32 }} />
              <p className="category-label">봉사</p>
            </Card>
            <Card hoverable className="category-card funding" onClick={() => navigate('/funding')}>
              <GiftTwoTone twoToneColor="#722ed1" style={{ fontSize: 32 }} />
              <p className="category-label">펀딩</p>
            </Card>
          </div>

          {/* 그리드 섹션 */}
          <HomeGridSection
            title="기부"
            type="기부"
            items={donationList}
            onMore={() => navigate('/donation-list')}
            onClickItem={(id) => navigate(`/donation-detail/${id}`)}
          />
          <HomeGridSection
            title="봉사"
            type="봉사"
            items={volunteerList}
            onMore={() => navigate('/volunteer')}
            onClickItem={(id) => navigate(`/volunteer/${id}`)}
          />
          <HomeGridSection
            title="펀딩"
            type="펀딩"
            items={fundingList}
            onMore={() => navigate('/funding')}
            onClickItem={(id) => navigate(`/funding/${id}`)}
          />
        </div>

        {/* 사이드바 */}
        <aside className="home-sidebar">
          <div className="login-static">
            <LoginWidget me={me} onUserChange={setMe} loading={meLoading} />
          </div>
          <div className="recommend-sticky">
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

            <DailyQuoteCard />
          </div>
        </aside>
      </div>
    </Layout>
  );
}
