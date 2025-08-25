// src/pages/funding/FundingList.jsx
import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/funding/FundingList.css';   // 새 CSS 파일
import fallback from '../../assets/testImage.png';

const toImageUrl = (p) => {
  if (!p) return fallback;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

const FundingList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/funding/react/list', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => setList(json?.fundingList ?? []))
      .catch(() => message.error('펀딩 목록 불러오기 실패'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="funding-list-page">
        <div className="funding-list-header">
          <h1 className="funding-list-title">펀딩 프로젝트</h1>
          <Button type="primary" onClick={() => navigate('/funding/create')}>
            펀딩 생성
          </Button>
        </div>

        {loading ? (
          <div>불러오는 중…</div>
        ) : list.length === 0 ? (
          <div>등록된 펀딩이 없습니다.</div>
        ) : (
          <div className="funding-grid">
            {list.map((item) => {
              const id = item.fundingId ?? item.id;
              const current = Number(item.currentPrice ?? 0);
              const max = Number(item.maxPrice ?? 0);
              const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

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
                    {max > 0 && (
                      <div className="funding-foot">
                        <div className="funding-progress" style={{ ['--pct']: `${percent}%` }}>
                          <span />
                        </div>
                        <span className="funding-stats">{percent}%</span>
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
};

export default FundingList;
