import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Empty, Spin, Tag } from 'antd';
import Layout from '../../components/Layout';
import '../../styles/home/Home.css'; // 카드 그리드 재사용
import testImage from '../../assets/testImage.png';

// 절대 URL 보정
const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const backendBase = window.location.origin.includes(':5173')
    ? 'http://localhost'
    : window.location.origin;
  const path = String(p).startsWith('/') ? p : `/${p}`;
  return `${backendBase}${encodeURI(path)}`;
};

// 다수 후보 키 중 먼저 존재하는 값을 뽑는 유틸
const pick = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
};

// 긴급 여부 판정(숫자/불린/문자 다양한 경우 커버)
const isEmergency = (it) => {
  const raw = pick(it, [
    // 가장 흔한 케이스
    'isEmergency', 'is_emergency', 'emergency', 'emergencyYn', 'emergency_yn',
    // 플래그/상태류
    'emergencyFlag', 'emergency_flag', 'emergencyYN', 'EmergencyYn',
    // 상태값에서 주는 경우
    'status', 'Status'
  ]);

  if (typeof raw === 'number') return raw === 1;
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    // 1/true/yes/y/emergency/urgent/EMERGENCY 같은 값들
    return ['1', 'y', 'yes', 'true', 't', 'emergency', 'urgent'].includes(s);
  }
  return false;
};

// id/title/image 정규화
const normItem = (it, type) => {
  const id = pick(it, [
    'fundingId', 'donationId', 'volunteerId', 'id', 'postId',
    'funding_id', 'donation_id', 'volunteer_id'
  ]);

  const title = pick(it, ['title', 'name', 'subject']) ?? `${type} 항목`;

  const image = pick(it, ['imagePath', 'thumbnailUrl', 'imageUrl', 'thumbnail', 'img']);
  return {
    id,
    title,
    image: toImageUrl(image),
    type,
    _raw: it,
  };
};

export default function EmergencyHub() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [fundings, setFundings] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch('/donation/react/list',  { credentials: 'include' }).then(r => r.json()),
      fetch('/volunteer/react/list', { credentials: 'include' }).then(r => r.json()),
      fetch('/funding/react/list',   { credentials: 'include' }).then(r => r.json()),
    ])
    .then(([d, v, f]) => {
      const getArr = (x) =>
        x?.value?.postList ??
        x?.value?.donationList ??
        x?.value?.volunteerList ??
        x?.value?.fundingList ??
        (Array.isArray(x?.value) ? x.value : []);

      const onlyEmergency = (arr) => (arr || []).filter(isEmergency);

      const dArr = onlyEmergency(getArr(d)).map((it) => normItem(it, '기부'));
      const vArr = onlyEmergency(getArr(v)).map((it) => normItem(it, '봉사'));
      const fArr = onlyEmergency(getArr(f)).map((it) => normItem(it, '펀딩'));

      // 디버깅 참고용 (긴급이 안 잡히면 첫 샘플 찍어보기)
      if (dArr.length + vArr.length + fArr.length === 0) {
        const sample = (getArr(d)[0] || getArr(v)[0] || getArr(f)[0]) ?? null;
        // eslint-disable-next-line no-console
        console.log('[EmergencyHub] 응답 샘플(긴급 미탐지 시 참고):', sample);
      }

      setDonations(dArr);
      setVolunteers(vArr);
      setFundings(fArr);
    })
    .finally(() => setLoading(false));
  }, []);

  const totalCount = (donations?.length || 0) + (volunteers?.length || 0) + (fundings?.length || 0);

  const Grid = ({ items, type }) => {
    if (!items || items.length === 0) return <Empty description="긴급 항목이 없습니다" />;
    return (
      <div className="category-buttons" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
        {items.map((it) => {
          const id = it.id ?? '';
          const go = () => {
            if (!id) return;
            if (type === '펀딩') navigate(`/funding/${id}`);
            else if (type === '기부') navigate(`/donation-detail/${id}`);
            else if (type === '봉사') navigate(`/volunteer/${id}`);
          };
          return (
            <Card
              key={`${type}-${id}`}
              hoverable
              onClick={go}
              cover={
                <div
                  style={{
                    height: 140,
                    background: `url(${it.image}) center/cover`,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
              }
            >
              <Card.Meta
                title={<span style={{ fontWeight: 700 }}>{it.title}</span>}
                description={
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Tag color="red">긴급</Tag>
                    <Tag>{type}</Tag>
                  </div>
                }
              />
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="page" style={{ padding: 16 }}>
        {/* 상단 안내 배너 */}
        <div
          className="emg-banner"
          style={{
            background:
              'radial-gradient(1200px 400px at -10% -40%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%),' +
              'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.78) 60%, rgba(0,0,0,0.72) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '28px 22px',
            color: '#fff',
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>긴급 도움이 필요합니다</h2>
          <p style={{ margin: '6px 0 0', opacity: 0.92 }}>
            지금 시급한 기부·봉사·펀딩을 한 곳에서 확인하고 참여해 보세요.
          </p>
          {totalCount > 0 && (
            <p style={{ margin: '8px 0 0', fontWeight: 700 }}>{totalCount}건 진행 중</p>
          )}
        </div>

        {loading ? (
          <Spin size="large" />
        ) : (
          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: 'all',
                label: '전체',
                children: (
                  <Grid
                    items={[...fundings, ...donations, ...volunteers]}
                    type="전체"
                  />
                ),
              },
              { key: 'donation', label: '기부', children: <Grid items={donations} type="기부" /> },
              { key: 'volunteer', label: '봉사', children: <Grid items={volunteers} type="봉사" /> },
              { key: 'funding', label: '펀딩', children: <Grid items={fundings} type="펀딩" /> },
            ]}
          />
        )}
      </div>
    </Layout>
  );
}
