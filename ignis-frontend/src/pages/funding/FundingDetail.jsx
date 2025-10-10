import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress, Button, Tabs, Divider, Tooltip, message, Spin
} from 'antd';
import {
  CalendarOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
} from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/funding/FundingDetail.css';
import Comments from '../common/Comments';
import useViewOnce from '../../hooks/useViewOnce';
import FundingSideMiniGrid from './FundingSideMiniGrid';
import testImage from '../../assets/testImage.png';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 날짜 포맷 (yyyy.mm.dd)
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

// 이미지 경로 정규화
const toImageUrl = (p) => {
  if (!p || String(p).trim() === '' || String(p).toLowerCase() === 'null') return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

export default function FundingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [liked, setLiked] = useState(false);
  const [relatedFundings, setRelatedFundings] = useState([]);

  // 상세 불러오기
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/funding/react/detail/${id}`, { credentials: 'include' });
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
        if (!res.ok || data?.result === 'fail') {
          message.error(data?.error || `상세 조회 실패 (HTTP ${res.status})`);
          if (!ignore) setItem(null);
          return;
        }
        if (!ignore) setItem(data?.funding ?? data ?? null);
      } catch (e) {
        console.error(e);
        message.error('펀딩 상세 불러오기 실패');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    // 함께 보는 펀딩 (관련 → 인기순 → 최신순 폴백)
    (async () => {
      try {
        const candidates = [
          `/funding/react/related?fundingId=${encodeURIComponent(id)}&limit=6`,
          `/funding/react/list?sort=views&page=0&size=6`,
          `/funding/react/list?page=0&size=6`,
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
                  : (Array.isArray(data?.fundingList) ? data.fundingList : []));
            const sorted = [...arr].sort(
              (a, b) => Number(b.viewCount ?? b.views ?? 0) - Number(a.viewCount ?? a.views ?? 0)
            );
            setRelatedFundings(sorted.slice(0, 6));
            return;
          } catch { /* try next */ }
        }
        setRelatedFundings([]);
      } catch {/* ignore */}
    })();

    return () => { ignore = true; };
  }, [id]);

  const contentId = item?.fundingId ?? item?.id ?? Number(id);

  // 조회수 1회 증가 (쿨다운은 훅 내부)
  useViewOnce({
    id,
    type: 'funding',
    endpoints: [`/funding/api/${id}/view`, `/funding/${id}/view`],
    onUpdated: (views) => {
      setItem((prev) => (prev ? { ...prev, viewCount: views, views } : prev));
    },
  });

  // 진행률
  const current = Number(item?.currentPrice || 0);
  const target  = Number(item?.maxPrice || 0);
  const progress = useMemo(
    () => (target ? Math.min(100, Math.floor((current * 100) / target)) : 0),
    [current, target]
  );

  const start = fmtDate(item?.createdAt);
  const end   = item?.endAt ? fmtDate(item.endAt) : '';

  // D-day
  const dDay = (() => {
    if (!item?.endAt) return null;
    const rest = Math.ceil((new Date(item.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return rest >= 0 ? `D-${rest}` : '종료';
  })();

  // Hero 이미지(여러 장이면 첫 장)
  const heroImage = useMemo(() => {
    const arr = Array.isArray(item?.images)
      ? item.images
          .map((it) => (typeof it === 'string' ? it : it?.url || it?.path || it?.imagePath))
          .filter(Boolean)
      : [];
    const pick = arr[0] || item?.imagePath;
    return toImageUrl(pick);
  }, [item]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: item?.title || '펀딩', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch { /* noop */ }
  };

  const toggleLike = () => setLiked((v) => !v);

  const goPayment = () => {
    const amount = Number(item?.maxPrice || 0);
    navigate(`/payment?type=funding&id=${contentId}&amount=${amount}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="funding-content" style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ───────── Hero (기부 상세 스타일과 동일) ───────── */}
      <section className="funding-hero">
        <div className="funding-hero-container">
          <img
            src={heroImage || testImage}
            alt="hero"
            onError={(e) => (e.currentTarget.src = testImage)}
          />
          <div className="funding-hero-overlay" />
          <div className="funding-hero-inner">
            {dDay && <span className={`funding-dtag ${dDay === '종료' ? 'ended' : ''}`}>{dDay}</span>}
            <h1 className="funding-hero-title">{item?.title || '펀딩 프로젝트'}</h1>
            <div className="funding-hero-progress">
              <Progress percent={progress} showInfo={false} status="active" />
              <div className="funding-hero-progress-meta">
                <span>{progress}%</span>
                <span>{current.toLocaleString()}원 / {target.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 본문 (폭 Hero와 맞춤) ───────── */}
      <div className="funding-main-section">
        <Row gutter={[24, 24]}>
          {/* 좌측: 내용 */}
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="detail" className="funding-custom-tabs">
              <TabPane tab="프로젝트 소개" key="detail">
                <Card className="funding-content-card" bordered={false}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {item?.description || '프로젝트 설명이 등록되지 않았습니다.'}
                  </Paragraph>
                </Card>

                {/* 안내/주의 카드 */}
                <Card className="funding-warning-card" bordered={false}>
                  <Title level={5} className="funding-warning-title">펀딩 전 꼭 확인해주세요</Title>
                  <ul className="funding-warning-list">
                    <li>본 프로젝트는 목표 금액 및 일정에 따라 보상이 달라질 수 있습니다.</li>
                    <li>결제·환불 정책은 프로젝트별로 상이할 수 있으니 반드시 확인해주세요.</li>
                    <li>허위 정보 기재 및 부정 참여는 제한될 수 있습니다.</li>
                    <li>문의는 댓글 또는 고객센터를 이용해주세요.</li>
                  </ul>
                </Card>
              </TabPane>

              <TabPane tab="댓글" key="comment">
                <Comments contentType="funding" contentId={contentId} />
              </TabPane>
            </Tabs>
          </Col>

          {/* 우측: 정보 위젯 + 함께 보는 펀딩 */}
          <Col xs={24} md={8}>
            <Card className="funding-info-card" bordered>
              <Title level={5}>{item?.title || '펀딩 상세'}</Title>

              <div className="funding-project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>{start}{end ? ` ~ ${end}` : ''}</Text>
              </div>

              <Divider />

              <div className="funding-stacked-metrics">
                <div className="funding-metric">
                  <Text type="secondary">목표 금액</Text><Text strong>{target.toLocaleString()}원</Text>
                </div>
                <div className="funding-metric">
                  <Text type="secondary">현재 금액</Text><Text strong>{current.toLocaleString()}원</Text>
                </div>
                <div className="funding-metric">
                  <Text type="secondary">달성률</Text><Text strong className="funding-accent">{progress}%</Text>
                </div>
                <div className="funding-metric">
                  <EyeOutlined />
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    {Number(item?.viewCount ?? item?.views ?? 0).toLocaleString()}회 조회
                  </Text>
                </div>
              </div>

              <Progress percent={progress} showInfo={false} status="active" />

              <div className="funding-action-row">
                <div className="funding-icon-group">
                  <Tooltip title={liked ? '좋아요 취소' : '좋아요'}>
                    <button
                      type="button"
                      className={`funding-icon-btn ${liked ? 'active' : ''}`}
                      aria-label={liked ? '좋아요 취소' : '좋아요'}
                      onClick={toggleLike}
                    >
                      {liked ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                  </Tooltip>

                  <Tooltip title="공유하기">
                    <button
                      type="button"
                      className="funding-icon-btn"
                      aria-label="공유하기"
                      onClick={share}
                    >
                      <ShareAltOutlined />
                    </button>
                  </Tooltip>
                </div>

                <Button type="primary" size="large" className="funding-cta-btn" onClick={goPayment}>
                  펀딩하기
                </Button>
              </div>
            </Card>

            {/* 함께 보는 펀딩 (2열) */}
            <FundingSideMiniGrid
              title="함께 보는"
              items={relatedFundings}
              onMore={() => navigate('/funding')}
              onClickItem={(fid) => navigate(`/funding/${fid}`)}
            />
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
