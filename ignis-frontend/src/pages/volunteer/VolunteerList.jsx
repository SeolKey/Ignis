import React, { useEffect, useMemo, useState } from 'react';
import { Button, Typography, Empty, Carousel, Segmented, Space, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerList.css';
import testImage from '../../assets/testImage.png';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

// 숫자/타임스탬프 보조
const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const pickTs = (o) => {
  if (!o) return 0;
  const s = o.createdAt ?? o.created_at ?? o.created ?? o.startTime ?? o.start_time ?? o.date ?? o.updatedAt ?? o.updated_at;
  return s ? new Date(s).getTime() : 0;
};
const pickArray = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.volunteerList)) return d.volunteerList;
  if (Array.isArray(d?.postList)) return d.postList;
  return [];
};

export default function VolunteerList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 기부 리스트와 동일한 컨트롤
  const [sort, setSort] = useState('latest'); // latest | views
  const [page, setPage] = useState(0);
  const size = 20;

  // ✅ 쿼리스트링 (DonationList와 동일)
  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('sort', sort);
    q.set('page', String(page));
    q.set('size', String(size));
    return `?${q.toString()}`;
  }, [sort, page, size]);

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
        // ✅ DonationList와 동일한 후보 + 쿼리 포함
        const candidates = [
          `/volunteer/react/list${query}`,
          `/api/volunteer/list${query}`,
          '/volunteer/react/list',
        ];

        for (const url of candidates) {
          try {
            const arr = await tryFetch(url);

            // ✅ 프론트 정렬 fallback (서버가 sort 무시해도 즉시 반응)
            let sorted = [...arr];
            if (sort === 'views') {
              sorted.sort(
                (a, b) =>
                  num(b.viewCount ?? b.views ?? b.view ?? 0) -
                  num(a.viewCount ?? a.views ?? a.view ?? 0)
              );
            } else {
              // 최신순: 시간 ↓, 없으면 id ↓
              sorted.sort((a, b) => {
                const dt = pickTs(b) - pickTs(a);
                if (dt !== 0) return dt;
                return num(b.volunteerId ?? b.id ?? 0) - num(a.volunteerId ?? a.id ?? 0);
              });
            }

            if (mounted) {
              setList(sorted);
              return;
            }
          } catch {
            // 다음 후보 시도
          }
        }

        if (mounted) setList([]);
      } catch (e) {
        if (mounted) {
          console.error('봉사 리스트 로드 실패:', e);
          message.error('봉사 리스트를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [query]); // ✅ 정렬/페이지 변경 시 재요청

  // 광고형 배너 (기존 그대로)
  const adBanners = [
    { img: '/assets/vol_ad1.jpg', title: '작은 시간으로 큰 나눔', desc: '당신의 손길이 누군가에겐 희망입니다.' },
    { img: '/assets/vol_ad2.jpg', title: '함께하는 봉사', desc: '지역사회를 따뜻하게 바꾸는 첫 걸음.' },
  ].map((b) => ({ ...b, img: toImageUrl(b.img) }));

  return (
    <Layout>
      <div className="vol-list-page">
        {/* ===== 상단 광고형 배너 ===== */}
        <div className="vol-ad-wrap">
          <Carousel autoplay dots className="vol-ad-carousel" arrows>
            {adBanners.map((b, i) => (
              <div key={i}>
                <div
                  className="ad-slide ad-vol"

                  onClick={() => b.href && navigate(b.href)}
                  role="button"
                >
                  <div className="ad-overlay">
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
        <div className="vol-headline">
          <Title level={1} className="vol-h1">봉사 도와주러 가기</Title>
          <Paragraph className="vol-sub">함께할수록 더 따뜻해집니다 🤝</Paragraph>
        </div>

        {/* ===== 컨트롤 (최신/조회순 + 생성) ===== */}
        <div className="vol-controls">
          <Space>
            <Segmented
              options={[
                { label: '최신순', value: 'latest' },
                { label: '조회순', value: 'views' },
              ]}
              value={sort}
              onChange={(v) => { setPage(0); setSort(v); }}
            />
            <Button type="primary" onClick={() => navigate('/volunteer/create')}>
              봉사 생성
            </Button>
          </Space>
        </div>

        {/* ===== 리스트 ===== */}
        {loading ? (
          <div className="vol-list-empty" style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
        ) : list.length === 0 ? (
          <Empty description="등록된 봉사가 없습니다." className="vol-list-empty" />
        ) : (
          <div className="vol-grid">
            {list.map((item) => {
              const id = item.volunteerId ?? item.id;
              const views = num(item.viewCount ?? item.views ?? item.view ?? 0);

              return (
                <article
                  key={id}
                  className="ignis-card vol-card"
                  onClick={() => navigate(`/volunteer/${id}`)}
                >
                  <img
                    src={toImageUrl(item.imagePath)}
                    alt={item.title || '봉사 이미지'}
                    className="ignis-thumb"
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes(testImage)) e.currentTarget.src = testImage;
                    }}
                  />
                  <div className="ignis-body">
                    <h3 className="ignis-title">{item.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <EyeOutlined />
                      <span style={{ color: 'rgba(0,0,0,.45)' }}>{views.toLocaleString()}회</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 페이지 버튼 */}
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
}
