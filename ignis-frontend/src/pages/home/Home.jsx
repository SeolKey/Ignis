import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/home/Home.css';
import testImage from '../../assets/testImage.png';
import HomeGridSection from './HomeGridSection';
import { Card, Segmented, Space, message } from 'antd';
import { HeartTwoTone, SmileTwoTone, GiftTwoTone } from "@ant-design/icons";

import Banner from './Banner';
import RecommendedProjects from './RecommendedProjects';
import LoginWidget from './LoginWidget';

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

  // 데이터
  const [donationList, setDonationList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [fundingList, setFundingList] = useState([]);

  // 추천 탭 상태
  const [recTab, setRecTab] = useState('전체');

  // 로그인 상태
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

  useEffect(() => {
    // 내 세션 정보
    fetch('/user/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setMe(u || null))
      .catch(() => { })
      .finally(() => setMeLoading(false));

    // 홈 데이터 로드
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
      .catch(() => message.error('홈 데이터를 불러오지 못했습니다.'));
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
    const src = recTab === '전체'
      ? combinedRecommend
      : combinedRecommend.filter((x) => x.type === recTab);
    return src.slice(0, 6);
  }, [combinedRecommend, recTab]);

  return (
    <Layout>
      <div className="page home-layout">
        {/* 메인 컬럼 */}
        <div className="main-content">
          {/* 배너 */}
          <Banner
            title="세상에 불을 밝히는 작은 불꽃, IGNIS"
            subtitle="당신의 작은 선택이 세상을 바꿉니다, IGNIS에서 시작하세요."
            subNote="작은 참여가 큰 희망을 만듭니다"
          />
          {/* 카테고리 버튼 */}
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
          {/* 기부 섹션 */}
          <HomeGridSection
            title="기부"
            type="기부"
            items={donationList}
            onMore={() => navigate('/donation-list')}
            onClickItem={(id) => navigate(`/donation-detail/${id}`)}
          />
          {/* 봉사 섹션 */}
          <HomeGridSection
            title="봉사"
            type="봉사"
            items={volunteerList}
            onMore={() => navigate('/volunteer')}
            onClickItem={(id) => navigate(`/volunteer/${id}`)}
          />
          {/* 펀딩 섹션 */}
          <HomeGridSection
            title="펀딩"
            type="펀딩"
            items={fundingList}
            onMore={() => navigate('/funding')}
            onClickItem={(id) => navigate(`/funding/${id}`)}
          />
        </div>
        {/* 사이드: 로그인 + 추천 */}
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
          </div>
        </aside>
      </div>
    </Layout>
  );
}
