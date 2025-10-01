// src/pages/funding/FundingList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { message, Button, Carousel, Typography, Spin, Segmented, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/funding/FundingList.css';
import fallback from '../../assets/testImage.png';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const toImageUrl = (p) => {
  if (!p) return fallback;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

// 숫자/타임스탬프/배열 보조 (봉사/기부와 동일 패턴)
const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const pickTs = (o) => {
  if (!o) return 0;
  const s =
    o.createdAt ?? o.created_at ?? o.created ??
    o.startTime ?? o.start_time ?? o.date ??
    o.updatedAt ?? o.updated_at;
  return s ? new Date(s).getTime() : 0;
};
const pickArray = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.fundingList)) return d.fundingList;
  if (Array.isArray(d?.postList)) return d.postList;
  return [];
};

const FundingList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 기부/봉사와 동일 컨트롤
  const [sort, setSort] = useState('latest'); // latest | views
  const [page, setPage] = useState(0);
  const size = 20;

  // ✅ 쿼리스트링 (서버 지원 시 사용)
  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('sort', sort);
    q.set('page', String(page));
    q.set('size', String(size));
    return `?${q.toString()}`;
  }, [sort, page, size]);

  // 데이터 로딩
  useEffect(() => {
    let mounted = true;

    const tryFetch = async (url) => {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      const data = await res.json();
      return pickArray(data);
    };

    (async () => {
      setLoading(true);
      try {
        const candidates = [
          `/funding/react/list${query}`,
          `/api/funding/list${query}`,
          '/funding/list',
        ];

        for (const url of candidates) {
          try {
            const arr = await tryFetch(url);

            // ✅ 프론트 정렬 fallback: 서버가 sort 무시해도 즉시 반응
            let sorted = [...arr];
            if (sort === 'views') {
              sorted.sort(
                (a, b) =>
                  num(b.viewCount ?? b.views ?? b.view ?? 0) -
                  num(a.viewCount ?? a.views ?? a.view ?? 0)
              );
            } else {
              sorted.sort((a, b) => {
                const dt = pickTs(b) - pickTs(a);
                if (dt !== 0) return dt;
                return num(b.fundingId ?? b.id ?? 0) - num(a.fundingId ?? a.id ?? 0);
              });
            }

            if (mounted) {
              setList(sorted);
              return;
            }
          } catch {
            /* 다음 후보 시도 */
          }
        }

        if (mounted) setList([]);
      } catch (e) {
        if (mounted) {
          console.error('펀딩 리스트 로드 실패:', e);
          message.error('펀딩 리스트를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [query]);

  // 광고형 배너
  const adBanners = [
    {
      img: '/assets/fund_ad1.jpg',
      title: '당신의 아이디어가 현실로',
      desc: '펀딩을 통해 새로운 프로젝트를 시작하세요.',
    },
    {
      img: '/assets/fund_ad2.jpg',
      title: '함께 만드는 성공',
      desc: '많은 사람들의 참여로 목표를 달성해요.',
    },
  ].map((b) => ({ ...b, img: toImageUrl(b.img) }));

  return (
    <Layout>
      <div className="funding-list-page">
        {/* ===== 광고형 배너 ===== */}
        <div className="funding-ad-wrap">
          <Carousel autoplay dots className="funding-ad-carousel" arrows>
            {adBanners.map((b, i) => (
              <div key={i}>
                <div
                  className="ad-slide"
                  style={{ backgroundImage: `url(${b.img})` }}
                  onClick={() => b.href && navigate(b.href)}
                  role="button"
                >
                  <div className="ad-overlay">
                    <div className="ad-badge">AD</div>
                    <div className="ad-text">
                      <h3 className="ad-title">{b.title}</h3>
                      <p className="ad-desc">{b.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* ===== 가운데 문구 ===== */}
        <div className="funding-headline">
          <Title level={1} className="funding-h1">펀딩 프로젝트</Title>
          <Paragraph className="funding-sub">아이디어와 열정이 모여 성공을 만듭니다 🚀</Paragraph>
        </div>

        {/* ===== 컨트롤 (최신/조회순 + 생성 버튼) ===== */}
        <div className="funding-controls">
          <Space>
            <Segmented
              options={[
                { label: '최신순', value: 'latest' },
                { label: '조회순', value: 'views' },
              ]}
              value={sort}
              onChange={(v) => { setPage(0); setSort(v); }}
            />
            <Button type="primary" onClick={() => navigate('/funding/create')}>
              펀딩 생성
            </Button>
          </Space>
        </div>

        {/* ===== 리스트 ===== */}
        {loading ? (
          <div className="funding-loading-center"><Spin /></div>
        ) : list.length === 0 ? (
          <div className="funding-empty">등록된 펀딩이 없습니다.</div>
        ) : (
          <div className="funding-grid">
            {list.map((item) => {
              const id = item.fundingId ?? item.id;

              const current = num(item.currentPrice ?? item.currentAmount ?? item.collected ?? item.raised ?? 0);
              const max = num(item.maxPrice ?? item.goal ?? item.target ?? 0);
              const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

              const views = num(item.viewCount ?? item.views ?? item.view ?? 0);

              return (
                <article
                  key={id}
                  className="funding-card"
                  onClick={() => navigate(`/funding/${id}`)}
                >
                  <img
                    className="funding-thumb"
                    src={toImageUrl(item.imagePath)}
                    alt={item.title || '펀딩 이미지'}
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes(fallback)) e.currentTarget.src = fallback;
                    }}
                  />

                  <div className="funding-body">
                    <h3 className="funding-title">{item.title}</h3>

                    <div className="funding-foot">
                      {/* ✅ 항상 진행바 표시 (0% 포함) */}
                      <div className="funding-progress" style={{ ['--pct']: `${percent}%` }}>
                        <span />
                      </div>
                      <span className="funding-stats">{percent}%</span>
                      <span className="funding-views"><EyeOutlined /> {views.toLocaleString()}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 간단 페이지 버튼 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '24px 0' }}>
          <Button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            이전
          </Button>
          <Button onClick={() => setPage((p) => p + 1)}>
            다음
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default FundingList;
