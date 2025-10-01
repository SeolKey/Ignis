import React, { useEffect, useState, useMemo } from 'react';
import {
  message,
  Segmented,
  Button,
  Progress,
  Tag,
  Space,
  Typography,
  Spin,
  Carousel,
  Divider,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import "../../styles/donation/DonationList.css";
import fallback from '../../assets/testImage.png';

const { Title, Text, Paragraph } = Typography;

const toImageUrl = (p) => {
  if (!p) return fallback;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

export default function DonationList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(0);
  const size = 20;

  // 광고형 배너(원하면 서버에서 내려받게 바꿔도 됨)
  const adBanners = [
    {
      img: '/assets/ad1.jpg',
      title: '작은 기부가 큰 변화를',
      desc: '지금, 도움이 필요한 곳에 함께해요.',
    },
    {
      img: '/assets/ad2.jpg',
      title: '당신의 마음이 모이면',
      desc: '누군가의 내일이 바뀝니다.',

    },
    {
      img: '/assets/ad3.jpg',
      title: '믿을 수 있는 기부 플랫폼',
      desc: '투명한 진행률과 안전한 결제.',
    },
  ].map(b => ({ ...b, img: toImageUrl(b.img) }));

  // 쿼리스트링
  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('sort', sort);
    q.set('page', String(page));
    q.set('size', String(size));
    return `?${q.toString()}`;
  }, [sort, page, size]);

  useEffect(() => {
    let mounted = true;

    const pickArray = (d) => {
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.items)) return d.items;
      if (Array.isArray(d?.donationList)) return d.donationList;
      if (Array.isArray(d?.postList)) return d.postList;
      return [];
    };

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
          `/donation/react/list${query}`,
          `/api/donation/list${query}`,
          '/donation/list',
        ];

        for (const url of candidates) {
          try {
            const arr = await tryFetch(url);
            if (mounted) {
              setList(arr);
              return;
            }
          } catch {
            //
          }
        }

        try {
          const arr = await tryFetch('/api/home');
          if (mounted) setList(arr);
        } catch {
          if (mounted) setList([]);
        }
      } catch (e) {
        if (mounted) {
          console.error('기부 리스트 로드 실패:', e);
          message.error('기부 리스트를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [query]);

  return (
    <Layout>
      <div className="donation-list-page">
        {/* ===== 상단 광고형 배너 캐러셀 ===== */}
        <div className="donation-ad-wrap">
          <Carousel autoplay dots className="donation-ad-carousel" arrows>
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

        {/* ===== 가운데 정렬 헤드라인 ===== */}
        <div className="donation-headline">
          <Title level={1} className="donation-h1">지금 도움이 필요한 모금함</Title>
          <Paragraph className="donation-sub">따뜻한 마음을 함께 나누어주세요 💙</Paragraph>
        </div>

        
        <div className="donation-controls">
          <Space>
            <Segmented
              options={[
                { label: '최신순', value: 'latest' },
                { label: '조회순', value: 'views' },
              ]}
              value={sort}
              onChange={(v) => { setPage(0); setSort(v); }}
            />
            <Button type="primary" onClick={() => navigate('/donation-create')}>
              기부 생성
            </Button>
          </Space>
        </div>


        {/* ===== 리스트 ===== */}
        {loading ? (
          <div className="donation-loading-center"><Spin /></div>
        ) : list.length === 0 ? (
          <div className="donation-empty">표시할 모금함이 없습니다.</div>
        ) : (
          <>
            <div className="donation-grid">
              {list.map((item) => {
                const id = item.donationId ?? item.id;
                const org = item.organization ?? item.orgName ?? item.writer ?? '';
                const current = Number(item.currentPrice ?? 0);
                const max = Number(item.maxPrice ?? 0);
                const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

                return (
                  <div
                    key={id}
                    className="ignis-card donation-card"
                    onClick={() => navigate(`/donation-detail/${id}`)}
                  >
                    <img
                      src={toImageUrl(item.imagePath)}
                      alt={item.title}
                      className="ignis-thumb"
                      loading="lazy"
                      onError={(e) => {
                        if (!e.currentTarget.src.includes(fallback)) e.currentTarget.src = fallback;
                      }}
                    />
                    <div className="ignis-body">
                      {org && <Tag color="blue" className="donation-org-tag">{org}</Tag>}
                      <p className="ignis-title">{item.title}</p>

                        <Progress percent={percent} size="small" status="active" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="donation-pagination">
              <Button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                이전
              </Button>
              <Button onClick={() => setPage((p) => p + 1)}>
                다음
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
