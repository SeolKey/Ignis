// src/pages/DonationList.jsx
import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/DonationList.css';
import fallback from '../assets/testImage.png';
import { Button } from 'antd';

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

  useEffect(() => {
    let mounted = true;

    const pickArray = (d) => {
      if (Array.isArray(d)) return d;
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
        // ✅ 1) 전용 리스트 엔드포인트를 먼저 시도 (전체 목록 기대)
        const candidates = [
          '/donation/react/list',
          '/api/donation/list',
          '/donation/list',
        ];
        for (const url of candidates) {
          try {
            const arr = await tryFetch(url);
            if (mounted && arr.length > 0) {
              setList(arr);
              return;
            }
          } catch { /* 다음 후보로 */ }
        }

        // ✅ 2) 전부 실패하면 홈 API(보통 4개만)로 폴백
        try {
          const arr = await tryFetch('/api/home');
          if (mounted) setList(arr);   // 홈이 4개만 줘도 일단 표시
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
  }, []);

  return (
    <Layout>
      <div className="donation-list-page">
        <div className="donation-list-header">
          <h1 className="donation-list-title">지금 도움이 필요한 모금함</h1>
          <Button
            type="primary"
            onClick={() => navigate('/donation-create')}
          >
            기부 생성
          </Button>
        </div>

        {loading ? (
          <div>불러오는 중…</div>
        ) : list.length === 0 ? (
          <div>표시할 모금함이 없습니다.</div>
        ) : (
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
        )}
      </div>
    </Layout>
  );
}
