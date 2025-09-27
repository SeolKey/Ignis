import React, { useEffect, useState, useMemo } from 'react';
import { message, Segmented, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import "../../styles/donation/DonationList.css";
import fallback from '../../assets/testImage.png';

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

  // ✅ 정렬/페이지 상태
  const [sort, setSort] = useState('latest'); // 'latest' | 'views'
  const [page, setPage] = useState(0);
  const size = 20;

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
      if (Array.isArray(d?.items)) return d.items;               // ← 새 JSON({items:[]}) 대응
      if (Array.isArray(d?.donationList)) return d.donationList; // ← 과거 키 대응
      if (Array.isArray(d?.postList)) return d.postList;         // ← 폴백
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
        // ✅ 1) 리액트/JSON 엔드포인트 우선 (정렬/페이지 파라미터 포함)
        const candidates = [
          `/donation/react/list${query}`,
          `/api/donation/list${query}`,
          '/donation/list', // 서버 렌더일 수 있어 실패 가능성 있음
        ];

        for (const url of candidates) {
          try {
            const arr = await tryFetch(url);
            if (mounted && arr.length >= 0) {
              setList(arr);
              return;
            }
          } catch {
            // 다음 후보로 넘어감
          }
        }

        // ✅ 2) 전부 실패하면 홈 API로 폴백(보통 소수개)
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
  }, [query]); // ← 정렬/페이지 바뀌면 재호출

  return (
    <Layout>
      <div className="donation-list-page">
        <div className="donation-list-header">
          <h1 className="donation-list-title">지금 도움이 필요한 모금함</h1>

          {/* 우측 액션: 생성 버튼 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 'auto' }}>
            {/* ✅ 정렬 토글 */}
            <Segmented
              options={[
                { label: '최신순', value: 'latest' },
                { label: '조회순', value: 'views' },
              ]}
              value={sort}
              onChange={(v) => {
                setPage(0);
                setSort(v);
              }}
            />
            <Button type="primary" onClick={() => navigate('/donation-create')}>
              기부 생성
            </Button>
          </div>
        </div>

        {loading ? (
          <div>불러오는 중…</div>
        ) : list.length === 0 ? (
          <div>표시할 모금함이 없습니다.</div>
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
                  <article
                    key={id}
                    className="donation-card"
                    onClick={() => navigate(`/donation-detail/${id}`)}
                  >
                    <img
                      className="donation-thumb"
                      src={toImageUrl(item.imagePath)}
                      alt={item.title || '기부 이미지'}
                      loading="lazy"
                      onError={(e) => {
                        if (!e.currentTarget.src.includes(fallback)) e.currentTarget.src = fallback;
                      }}
                    />

                    <div className="donation-body">
                      {org && <p className="donation-org">{org}</p>}
                      <h3 className="donation-title">{item.title}</h3>

                      {/* 진행률/통계 */}
                      {max > 0 && (
                        <div className="donation-foot">
                          <div className="donation-progress" style={{ ['--pct']: `${percent}%` }}>
                            <span />
                          </div>
                          <span className="donation-stats">{percent}%</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* (선택) 간단 페이지 이동: 다음/이전 */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
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
