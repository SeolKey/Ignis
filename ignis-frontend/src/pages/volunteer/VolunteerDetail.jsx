import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress, Button, Tabs, Divider, message, Spin, Modal, Table
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ShareAltOutlined,
  TeamOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerDetail.css';
import testImage from '../../assets/testImage.png';
import Comments from '../common/Comments.jsx';
import useViewOnce from '../../hooks/useViewOnce.js';
import VolunteerSideMiniGrid from './VolunteerSideMiniGrid.jsx';

const { Title, Text, Paragraph } = Typography;


// 🔐 마스킹 유틸
const maskName = (name) => {
  if (!name) return '';
  const s = String(name).trim();
  // 공백 포함(영문 이름 등) 처리: 각 토큰별로 마스킹
  return s.split(/\s+/).map(tok => {
    if (tok.length <= 1) return '*';
    if (tok.length === 2) return tok[0] + '*';
    return tok[0] + '*'.repeat(tok.length - 2) + tok[tok.length - 1];
  }).join(' ');
};

const maskPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  // 3-4-4 패턴 우선 (010 등)
  if (digits.length >= 10) {
    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    return `${head}-****-${tail}`;
  }
  // 그 외: 앞 2/뒤 2만 남기고 가운데 마스킹
  const head = digits.slice(0, 2);
  const tail = digits.slice(-2);
  const midLen = Math.max(1, digits.length - head.length - tail.length);
  return `${head}${'*'.repeat(midLen)}${tail}`;
};

const maskEmail = (email) => {
  if (!email) return '';
  const s = String(email).trim();
  const at = s.indexOf('@');
  if (at <= 0) return s.replace(/.(?=..)/g, '*'); // 구조 불명: 대충 마스킹
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);
  const keep = Math.min(2, local.length); // 트렌드: 로컬 앞 2글자만 살리고 나머지 *
  const maskedLocal = local.slice(0, keep) + '*'.repeat(Math.max(1, local.length - keep));
  return `${maskedLocal}@${domain}`;
};


const participantCols = [
  { title: '이름', dataIndex: 'name', key: 'name', width: '30%', render: (v) => maskName(v) },
  { title: '전화번호', dataIndex: 'phone', key: 'phone', width: '30%', render: (v) => maskPhone(v) },
  { title: '이메일', dataIndex: 'email', key: 'email', width: '40%', render: (v) => maskEmail(v) },
];


const fmtDateTime = (v) => {
  if (!v) return '';
  try {
    const d = new Date(typeof v === 'string' ? v.replace(' ', 'T') : v);
    if (Number.isNaN(d.getTime())) return String(v);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${HH}:${MM}`;
  } catch {
    return String(v);
  }
};

const toImageUrl = (p) => {
  if (!p || String(p).trim() === '' || String(p).toLowerCase() === 'null') return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  return `/${encodeURI(String(p).replace(/^\.?\/?/, ''))}`;
};

export default function VolunteerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [vol, setVol] = useState(null);
  const [joined, setJoined] = useState(false);

  // ✅ 좋아요 상태
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 참여자 모달
  const [openParticipants, setOpenParticipants] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);

  // 함께 보는 봉사
  const [relatedVols, setRelatedVols] = useState([]);

  // 상세 데이터 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/volunteer/react/detail/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => null);
        const payload = data?.data ?? data ?? null;
        if (!ignore) setVol(payload);

        // 참여여부 체크
        if (!ignore && payload?.volunteerId) {
          const check = await fetch(`/volunteer/${payload.volunteerId}/join/me`, { credentials: 'include' });
          if (check.ok) {
            const result = await check.json();
            setJoined(!!result?.joined);
          }
        }
      } catch {
        message.error('봉사 상세 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    // 함께 보는 봉사 로드
    (async () => {
      try {
        const candidates = [
          `/volunteer/react/related?volunteerId=${encodeURIComponent(id)}&limit=6`,
          `/volunteer/react/list?sort=views&page=0&size=6`,
          `/volunteer/react/list?page=0&size=6`,
        ];
        for (const url of candidates) {
          try {
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();
            const arr = Array.isArray(data)
              ? data
              : (Array.isArray(data?.items)
                  ? data.items
                  : (Array.isArray(data?.volunteerList) ? data.volunteerList : []));
            const sorted = [...arr].sort(
              (a, b) => Number(b.viewCount ?? b.views ?? 0) - Number(a.viewCount ?? a.views ?? 0)
            );
            setRelatedVols(sorted.slice(0, 6));
            return;
          } catch {
            // 다음 후보 시도
          }
        }
        setRelatedVols([]);
      } catch {
        // 조용히 폴백 무시
      }
    })();

    return () => { ignore = true; };
  }, [id]);

  // ✅ 좋아요 초기 상태 로드 (로그인 상관없이 호출)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/volunteer/api/${id}/like/state`, { credentials: 'include' });
        const out = await res.json().catch(() => ({}));
        if (out?.result === 'success') {
          setLiked(!!out.liked);
          setLikeCount(Number(out.likeCount || 0));
        } else if (typeof out?.likeCount !== 'undefined') {
          // 혹시 기존 엔드포인트 포맷일 때도 대응
          setLiked(!!out.liked);
          setLikeCount(Number(out.likeCount || 0));
        }
      } catch {
        // 조용히 무시
      }
    })();
  }, [id]);

  // 조회수 1회 증가
  useViewOnce({
    id,
    type: 'volunteer',
    endpoints: [`/volunteer/api/${id}/view`, `/volunteer/${id}/view`],
    onUpdated: (views) => setVol((p) => (p ? { ...p, viewCount: views, views } : p)),
  });

  const current = Number(vol?.currentPeople || 0);
  const target = Number(vol?.maxParticipants || 0);
  const progress = useMemo(
    () => (target ? Math.min(100, Math.floor((current * 100) / target)) : 0),
    [current, target]
  );

  const contentId = useMemo(() => (vol?.volunteerId ?? vol?.id ?? Number(id)), [vol, id]);

  const startStr = fmtDateTime(vol?.startTime);
  const endStr = fmtDateTime(vol?.endTime);
  const loc = vol?.location || '장소 미정';
  const title = vol?.title || '봉사 상세';
  const heroImage = toImageUrl(vol?.imagePath);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: vol?.title || '봉사', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch {
      //
    }
  };

  const toggleJoin = async () => {
    if (!vol?.volunteerId) return;
    try {
      const url = `/volunteer/${vol.volunteerId}/join`;
      const method = joined ? 'DELETE' : 'POST';
      const res = await fetch(url, { method, credentials: 'include' });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = { ...vol };
      updated.currentPeople = Math.max(0, (updated.currentPeople || 0) + (joined ? -1 : 1));
      setVol(updated);
      setJoined(!joined);
      message.success(joined ? '봉사 참여가 취소되었습니다.' : '봉사에 참여했습니다.');
    } catch {
      message.error('처리 중 오류가 발생했습니다.');
    }
  };

  // ✅ 좋아요 토글
  const toggleLike = async () => {
    try {
      const res = await fetch(`/volunteer/api/${id}/like/toggle`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      const out = await res.json().catch(() => ({}));
      if (out?.result === 'success') {
        setLiked(!!out.liked);
        setLikeCount(Number(out.likeCount || 0));
      } else {
        message.error(out?.error || '좋아요 처리에 실패했어요.');
      }
    } catch {
      message.error('좋아요 처리 중 오류가 발생했어요.');
    }
  };

  const fetchParticipants = async () => {
    if (!vol?.volunteerId) return;
    try {
      setLoadingParticipants(true);
      const res = await fetch(`/volunteer/${vol.volunteerId}/participants`, { credentials: 'include' });
      if (res.status === 403) {
        message.warning('권한이 없습니다. (작성자/관리자만 조회 가능)');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      setParticipants(Array.isArray(list) ? list : []);
    } catch {
      message.error('참여자 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openParticipantsModal = async () => {
    setOpenParticipants(true);
    setParticipants([]);
    await fetchParticipants();
  };

  const goVolunteer = (vid) => navigate(`/volunteer/${vid}`);

  if (loading) {
    return (
      <Layout>
        <div className="volunteer-main-section" style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </Layout>
    );
  }
  if (!vol) {
    return (
      <Layout>
        <div className="volunteer-main-section" style={{ padding: 24 }}>
          <Paragraph>해당 봉사를 찾을 수 없습니다.</Paragraph>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ───────── Hero ───────── */}
      <section className="volunteer-hero">
        <div className="volunteer-hero-container">
          <img
            src={heroImage || testImage}
            alt="hero"
            onError={(e) => (e.currentTarget.src = testImage)}
          />
          <div className="volunteer-hero-overlay" />
          <div className="volunteer-hero-inner">
            <h1 className="volunteer-hero-title">{title}</h1>
            <div className="volunteer-hero-progress">
              <Progress percent={progress} showInfo={false} status="active" />
              <div className="volunteer-hero-progress-meta">
                <span>{progress}%</span>
                <span>{current.toLocaleString()}명 / {target.toLocaleString()}명</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 본문 ───────── */}
      <div className="volunteer-main-section">
        <Row gutter={[24, 24]}>
          {/* 좌측: 내용 */}
          <Col xs={24} md={16}>
            <Tabs
              defaultActiveKey="intro"
              className="volunteer-custom-tabs"
              items={[
                {
                  key: 'intro',
                  label: '상세내용',
                  children: (
                    <>
                      <Card className="volunteer-content-card" variant="bordered">
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                          {vol?.description || '봉사 설명이 등록되지 않았습니다.'}
                        </Paragraph>
                      </Card>

                      {/* 장소 카드 */}
                      <Card className="volunteer-content-card" style={{ marginTop: 16 }} variant="bordered">
                        <Paragraph>
                          <EnvironmentOutlined style={{ marginRight: 8 }} />
                          <Text>{loc}</Text>
                        </Paragraph>
                      </Card>

                      {/* 주의사항 카드 */}
                      <Card className="volunteer-warning-card" variant="bordered">
                        <Title level={5} className="volunteer-warning-title">참여 전 꼭 확인해주세요</Title>
                        <ul className="volunteer-warning-list">
                          <li>신청 후 무단 불참은 다른 참여자에게 피해가 됩니다.</li>
                          <li>활동 장소·시간은 주최 측 사정으로 일부 변경될 수 있습니다.</li>
                          <li>개인정보는 참여 목적 외로 사용되지 않습니다.</li>
                          <li>봉사 인증서 발급 여부는 주최 측 정책에 따릅니다.</li>
                        </ul>
                      </Card>
                    </>
                  ),
                },
                {
                  key: 'comment',
                  label: '댓글',
                  children: (
                    <Comments contentType="volunteer" contentId={contentId} />
                  ),
                },
              ]}
            />
          </Col>

          {/* 우측: 위젯 + 함께 보는 봉사 */}
          <Col xs={24} md={8}>
            <Card className="volunteer-info-card" variant="bordered">
              <Title level={5}>{title}</Title>

              <div className="volunteer-project-period">
                <CalendarOutlined className="volunteer-calendar-icon" />
                <Text>{startStr}{endStr ? ` ~ ${endStr}` : ''}</Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <EnvironmentOutlined />
                <Text>{loc}</Text>
              </div>

              <Divider />

              <div className="volunteer-stacked-metrics">
                <div className="volunteer-metric">
                  <Text type="secondary">정원</Text>
                  <Text strong>{target.toLocaleString()}명</Text>
                </div>
                <div className="volunteer-metric">
                  <Text type="secondary">현재</Text>
                  <Text strong>{current.toLocaleString()}명</Text>
                </div>
                <div className="volunteer-metric">
                  <Text type="secondary">진행률</Text>
                  <Text strong className="volunteer-accent">{progress}%</Text>
                </div>
                <div className="volunteer-metric">
                  <EyeOutlined />
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    {Number(vol?.viewCount ?? vol?.views ?? 0).toLocaleString()}회 조회
                  </Text>
                </div>

                {/* ✅ 좋아요 수 */}
                <div className="volunteer-metric">
                  {liked ? <HeartFilled /> : <HeartOutlined />}
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    {likeCount.toLocaleString()}명이 응원했어요
                  </Text>
                </div>
              </div>

              <Progress percent={progress} showInfo={false} status="active" />

              {/* 액션 영역 */}
              <div className="action-row">
                <div className="icon-group">
                  {/* ✅ 좋아요 버튼 */}
                  <button
                    type="button"
                    className={`icon-btn like ${liked ? 'active' : ''}`}
                    aria-label={liked ? '좋아요 취소' : '좋아요'}
                    onClick={toggleLike}
                  >
                    {liked ? <HeartFilled /> : <HeartOutlined />}
                    <span style={{ marginLeft: 6 }}>{likeCount.toLocaleString()}</span>
                  </button>

                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="참여 인원 목록"
                    onClick={openParticipantsModal}
                  >
                    <TeamOutlined />
                  </button>

                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="공유하기"
                    onClick={share}
                  >
                    <ShareAltOutlined />
                  </button>
                </div>

                <Button
                  type={joined ? 'default' : 'primary'}
                  danger={joined}
                  size="large"
                  className="cta-btn"
                  onClick={toggleJoin}
                >
                  {joined ? '참여 취소하기' : '봉사 참여하기'}
                </Button>
              </div>

              {/* 참여자 모달 */}
              <Modal
                title="참여 인원 목록"
                open={openParticipants}
                onCancel={() => setOpenParticipants(false)}
                footer={null}
                width={720}
                destroyOnHidden
              >
                <Table
                  rowKey={(r, i) => i}
                  columns={participantCols}
                  dataSource={participants}
                  loading={loadingParticipants}
                  locale={{ emptyText: '참여 인원이 없습니다.' }}
                  pagination={{ pageSize: 10 }}
                />
              </Modal>
            </Card>

            {/* 함께 보는 봉사 */}
            <VolunteerSideMiniGrid
              title="함께 보는"
              items={relatedVols}
              onMore={() => navigate('/volunteer')}
              onClickItem={(vid) => goVolunteer(vid)}
            />
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
