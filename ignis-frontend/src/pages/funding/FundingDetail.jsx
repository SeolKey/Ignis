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
  const [likeCount, setLikeCount] = useState(0);
  const [relatedFundings, setRelatedFundings] = useState([]);

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
          } catch {
            //
          }
        }
        setRelatedFundings([]);
      } catch {
        //
      }
    })();

    return () => { ignore = true; };
  }, [id]);

  const contentId = item?.fundingId ?? item?.id ?? Number(id);

  // 좋아요 상태
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/funding/api/${id}/like/state`, { credentials: 'include' });
        const out = await res.json().catch(() => ({}));
        if (out?.result === 'success') {
          setLiked(!!out.liked);
          setLikeCount(Number(out.likeCount || 0));
        } else if (typeof out?.likeCount !== 'undefined') {
          setLiked(!!out.liked);
          setLikeCount(Number(out.likeCount || 0));
        }
      } catch {
        //
      }
    })();
  }, [id]);

  useViewOnce({
    id,
    type: 'funding',
    endpoints: [`/funding/api/${id}/view`, `/funding/${id}/view`],
    onUpdated: (views) => {
      setItem((prev) => (prev ? { ...prev, viewCount: views, views } : prev));
    },
  });

  const current = Number(item?.currentPrice || 0);
  const target = Number(item?.maxPrice || 0);
  const progress = useMemo(
    () => (target ? Math.min(100, Math.floor((current * 100) / target)) : 0),
    [current, target]
  );

  const start = fmtDate(item?.createdAt);
  const end = item?.endAt ? fmtDate(item.endAt) : '';

  const dDay = (() => {
    if (!item?.endAt) return null;
    const rest = Math.ceil((new Date(item.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return rest >= 0 ? `D-${rest}` : '종료';
  })();

  const heroImage = useMemo(() => {
    const arr = Array.isArray(item?.images)
      ? item.images
          .map((it) => (typeof it === 'string' ? it : it?.url || it?.path || it?.imagePath))
          .filter(Boolean)
      : [];
    const pick = arr[0] || item?.imagePath;
    return toImageUrl(pick);
  }, [item]);

  const subImage = useMemo(() => toImageUrl(item?.subImagePath), [item]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: item?.title || '펀딩', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch {
      //
    }
  };

  const toggleLike = async () => {
    try {
      const res = await fetch(`/funding/api/${id}/like/toggle`, {
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
      <section className="funding-hero">
        <div className="funding-hero-container">
          <img src={heroImage || testImage} alt="hero" onError={(e) => (e.currentTarget.src = testImage)} />
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

      <div className="funding-main-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="detail" className="funding-custom-tabs">
              <TabPane tab="프로젝트 소개" key="detail">
                {/* ✅ 서브 이미지 추가 부분 */}
                {item?.subImagePath && (
                  <div className="funding-subimage-wrap">
                    <img
                      src={subImage}
                      alt="sub"
                      className="funding-subimage"
                      onError={(e) => (e.currentTarget.src = testImage)}
                    />
                    {item?.subImageDescription && (
                      <Paragraph className="funding-subimage-desc">
                        {item.subImageDescription}
                      </Paragraph>
                    )}
                  </div>
                )}

                <Card className="funding-content-card" bordered={false}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {item?.description || '프로젝트 설명이 등록되지 않았습니다.'}
                  </Paragraph>
                </Card>

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
                <div className="funding-metric">
                  {liked ? <HeartFilled /> : <HeartOutlined />}
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    {likeCount.toLocaleString()}명이 응원했어요
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
                      <span style={{ marginLeft: 6 }}>{likeCount.toLocaleString()}</span>
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
