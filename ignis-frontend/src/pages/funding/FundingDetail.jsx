import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress,
  Button, Tabs, Divider, message, Spin, List, Input, Tooltip
} from 'antd';
import {
  CalendarOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import Layout from '../../components/Layout';
import { Carousel } from 'antd';
import '../../styles/funding/FundingDetail.css';
import testImage from '../../assets/testImage.png';
// import RewardSelector from "../funding/RewardSelector";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

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

// 날짜+시간 포맷 (yyyy-mm-dd hh:mm)
const fmtDateTime = (iso) => {
  if (!iso) return '';
  return iso.replace('T', ' ').substring(0, 16);
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

  // 상태
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
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

  // 댓글 불러오기
  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      setCommentLoading(true);
      const res = await fetch(`/comment/list?contentType=funding&contentId=${contentId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`);
      }
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('댓글 불러오기 실패:', e);
      message.error('댓글을 불러오지 못했어요.');
    } finally {
      setCommentLoading(false);
    }
  }, [contentId, navigate]);

  // 댓글 작성
  const submitComment = async () => {
    const content = commentInput.trim();
    if (!content) return message.warning('댓글 내용을 입력해줘.');
    try {
      setCommentLoading(true);
      const res = await fetch('/comment/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ contentType: 'funding', contentId, content, parentId: null }),
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`);
      }
      const result = await res.json();
      if (result?.result === 'success') {
        setCommentInput('');
        message.success('댓글이 등록되었습니다.');
        await loadComments();
      } else {
        message.error(result?.errorMessage || '댓글 등록에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      message.error('댓글 등록 중 오류가 발생했어요.');
    } finally {
      setCommentLoading(false);
    }
  };

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

  // 로딩/없음 처리
  if (loading) {
    return (
      <Layout>
        <div className="funding-content" style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </Layout>
    );
  }
  if (!item) {
    return (
      <Layout>
        <div className="funding-content" style={{ padding: 24 }}>
          <Paragraph>해당 프로젝트를 찾을 수 없습니다.</Paragraph>
        </div>
      </Layout>
    );
  }

  // 렌더
  return (
    <Layout>
      <div className="funding-content">
        <Row gutter={[24, 24]}>
          {/* 메인 상세 */}
          <Col xs={24} md={16}>
            <Card bordered={false} className="thumbnail-card">
              <Carousel autoplay autoplaySpeed={3000} pauseOnHover={false} dots>
                {imagesForCarousel.map((src, idx) => (
                  <div key={idx}>
                    <img
                      src={src || testImage}
                      alt={`이미지-${idx}`}
                      className="thumbnail-image"
                      style={{ height: 300 }}
                      onError={(e) => { e.currentTarget.src = testImage; }}
                    />
                  </div>
                ))}
              </Carousel>
            </Card>

            <Tabs
              defaultActiveKey="1"
              className="custom-tabs"
              onChange={(key) => { if (key === '3') loadComments(); }}
            >
              <TabPane tab="상세내용" key="1">
                <Title level={4}>{item?.title || '펀딩 상세'}</Title>
                <Card className="content-card" bordered={false}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {item?.description || '프로젝트 설명이 등록되지 않았습니다.'}
                  </Paragraph>
                </Card>
              </TabPane>
              <TabPane tab="안내사항" key="2">
                <Paragraph>
                  - 본 프로젝트는 <strong>모금형 펀딩</strong>이며, 목표 금액 달성도에 따라 보상이 달라질 수 있습니다.<br />
                  - 결제·환불 정책은 프로젝트별로 상이할 수 있으니 반드시 확인해주세요.<br />
                  - 허위 정보 기재 및 부정 참여는 사전 고지 없이 제한될 수 있습니다.<br />
                  - 문의는 댓글 또는 고객센터를 이용해주세요.
                </Paragraph>
              </TabPane>
              <TabPane tab="댓글" key="3">
                <Card bordered={false} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <TextArea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="댓글을 입력하세요"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Button type="primary" htmlType="button" onClick={submitComment} loading={commentLoading}>
                        발송
                      </Button>
                    </div>
                  </div>
                </Card>
                <List
                  loading={commentLoading}
                  locale={{ emptyText: '아직 댓글이 없습니다.' }}
                  dataSource={comments}
                  renderItem={(c) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ fontWeight: 'bold' }}>{c?.userName || '익명 사용자'}</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{c?.content}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {fmtDateTime(c?.createdAt || '')}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Col>

          {/* 사이드 정보 */}
          <Col xs={24} md={8}>
            <Card className="info-card" variant="borderless">
              <Title level={5}>{item?.title || '펀딩 상세'}</Title>
              <div className="project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>{start}{end ? ` ~ ${end}` : ''}</Text>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Text className="progress-text">{progressText}% 달성</Text>
              <Progress percent={progressForBar} showInfo={false} status="active" />
              <div className="stats stats-v2">
                <div className="current-amount">
                  <span className="amount">
                    {Number(item?.currentPrice || 0).toLocaleString()}원
                  </span>
                  <span className="amount-label"> 달성</span>
                </div>

                <div className="goal-pill">
                  {Number(item?.maxPrice || 0).toLocaleString()}원 목표금액
                </div>
              </div>
              {/* 하단 액션 */}
              <div className="action-row">
                <div className="icon-group">
                  <Tooltip title={liked ? '좋아요 취소' : '좋아요'}>
                    <button
                      type="button"
                      className={`icon-btn ${liked ? 'active' : ''}`}
                      aria-label="좋아요"
                      onClick={toggleLike}
                    >
                      {liked ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                  </Tooltip>
                  <Tooltip title="공유하기">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="공유하기"
                      onClick={share}
                    >
                      <ShareAltOutlined />
                    </button>
                  </Tooltip>
                </div>
                <Button type="primary" size="large" className="cta-btn" onClick={goPayment}>
                  펀딩하기
                </Button>
              </div>
            </Card>
            {/* <RewardSelector
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
