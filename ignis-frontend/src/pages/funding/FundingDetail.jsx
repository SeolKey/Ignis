import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Progress, Button, Tabs, Divider, message, Spin, Tooltip } from 'antd';
import { CalendarOutlined, ShareAltOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import Layout from '../../components/Layout';
import { Carousel } from 'antd';
import '../../styles/funding/FundingDetail.css';
import testImage from '../../assets/testImage.png';
import Comments from '../common/Comments';
// import RewardSelector from "../funding/RewardSelector";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 날짜 포맷 (yyyy.mm.dd)
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${dd}`;
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
  const toggleLike = () => setLiked((v) => !v);

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
    return () => { ignore = true; };
  }, [id]);

  const contentId = item?.fundingId ?? item?.id ?? Number(id);

  // 진행률
  const { progressText, progressForBar } = useMemo(() => {
    const cur = Number(item?.currentPrice ?? 0);
    const max = Number(item?.maxPrice ?? 0);
    if (!max) return { progressText: 0, progressForBar: 0 };
    const raw = (cur * 100) / max;
    const text = Math.floor(raw);
    const bar = Math.max(0, Math.min(100, raw));
    return { progressText: text, progressForBar: bar };
  }, [item]);

  // 캐러셀 이미지
  const imagesForCarousel = useMemo(() => {
    const arr = Array.isArray(item?.images)
      ? item.images
        .map((it) => (typeof it === 'string' ? it : it?.url || it?.path || it?.imagePath))
        .filter(Boolean)
      : [];
    if (arr.length >= 2) return arr.map(toImageUrl);
    const one = toImageUrl(item?.imagePath);
    return [one, one, one];
  }, [item]);

  const start = fmtDate(item?.createdAt);
  const end = item?.endAt ? fmtDate(item.endAt) : '';

  // 공유
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: item?.title || '펀딩', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch (e) {
      console.warn('공유 취소/실패:', e);
    }
  };

  // 결제 이동
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
      <div className="funding-content">
        <Row gutter={[24, 24]}>
          {/* 메인 상세 */}
          <Col xs={24} md={16}>
            <Card bordered={false} className="funding-thumbnail-card">
              <Carousel autoplay autoplaySpeed={3000} pauseOnHover={false} dots>
                {imagesForCarousel.map((src, idx) => (
                  <div key={idx}>
                    <img
                      src={src || testImage}
                      alt={`이미지-${idx}`}
                      className="funding-thumbnail-image"
                      onError={(e) => { e.currentTarget.src = testImage; }}
                    />
                  </div>
                ))}
              </Carousel>
            </Card>

            <Tabs defaultActiveKey="1" className="funding-custom-tabs">
              <TabPane tab="상세내용" key="1">
                <Title level={4} className="funding-detail-title">{item?.title || '펀딩 상세'}</Title>
                <Card className="funding-content-card" bordered={false}>
                  <Paragraph className="funding-detail-paragraph" style={{ whiteSpace: 'pre-wrap' }}>
                    {item?.description || '프로젝트 설명이 등록되지 않았습니다.'}
                  </Paragraph>
                </Card>
              </TabPane>
              <TabPane tab="안내사항" key="2">
                <Paragraph className="funding-detail-paragraph">
                  - 본 프로젝트는 <strong>모금형 펀딩</strong>이며, 목표 금액 달성도에 따라 보상이 달라질 수 있습니다.<br />
                  - 결제·환불 정책은 프로젝트별로 상이할 수 있으니 반드시 확인해주세요.<br />
                  - 허위 정보 기재 및 부정 참여는 사전 고지 없이 제한될 수 있습니다.<br />
                  - 문의는 댓글 또는 고객센터를 이용해주세요.
                </Paragraph>
              </TabPane>
              <TabPane tab="댓글" key="3">
                <Comments contentType="funding" contentId={contentId} />
              </TabPane>
            </Tabs>
          </Col>

          {/* 사이드 정보 */}
          <Col xs={24} md={8}>
            <Card className="funding-info-card" variant="borderless">
              <Title level={5} className="funding-side-title">{item?.title || '펀딩 상세'}</Title>

              <div className="funding-project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>{start}{end ? ` ~ ${end}` : ''}</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Text className="funding-progress-text">{progressText}% 달성</Text>
              <Progress percent={progressForBar} showInfo={false} status="active" />

              <div className="funding-stats-v2">
                <div className="funding-current-amount">
                  <span className="funding-amount">
                    {Number(item?.currentPrice || 0).toLocaleString()}원
                  </span>
                  <span className="funding-amount-label"> 달성</span>
                </div>

                <div className="funding-goal-pill">
                  {Number(item?.maxPrice || 0).toLocaleString()}원 목표금액
                </div>
              </div>

              {/* 하단 액션 */}
              <div className="funding-action-row">
                <div className="funding-icon-group">
                  <Tooltip title={liked ? '좋아요 취소' : '좋아요'}>
                    <button
                      type="button"
                      className={`funding-icon-btn ${liked ? 'active' : ''}`}
                      aria-label="좋아요"
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

            {/* 리워드 선택 영역 (옵션)
            <RewardSelector
              title="리워드 선택"
              periodText={`${start} ~ ${end || "진행중"}`}
              rewards={item?.rewards}
              onSelect={(r) => { console.log("선택된 리워드:", r); }}
              onShare={share}
              onClickFund={(r) => {
                navigate(`/payment?type=funding&id=${contentId}&rewardId=${r.id}&amount=${r.price}`);
              }}
              className="sticky"
            /> */}
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
