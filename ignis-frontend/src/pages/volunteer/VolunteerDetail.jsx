import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress,
  Button, Tabs, Divider, message, Spin, List, Input
} from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ShareAltOutlined, TeamOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { Carousel } from 'antd';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerDetail.css';
import testImage from '../../assets/testImage.png';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 날짜 포맷 (yyyy.mm.dd hh:mm)
const fmtDate = (v) => {
  if (!v) return '';
  try {
    const d = new Date(typeof v === 'string' ? v.replace(' ', 'T') : v);
    if (Number.isNaN(d.getTime())) return String(v);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${dd} ${hh}:${mm}`;
  } catch {
    return String(v);
  }
};

// 이미지 경로 정규화
const toImageUrl = (p) => {
  if (!p || String(p).trim() === '' || String(p).toLowerCase() === 'null') return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\/?/, '');
  return `/${encodeURI(clean)}`;
};

export default function VolunteerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태
  const [loading, setLoading] = useState(true);
  const [vol, setVol] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  // 상세 불러오기
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
      } catch {
        message.error('봉사 상세 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  // 파생값
  const contentId = vol?.volunteerId ?? vol?.id ?? Number(id);
  const progress = useMemo(() => {
    const cur = Number(vol?.currentPeople || 0);
    const max = Number(vol?.maxParticipants || 0);
    if (!max) return 0;
    return Math.max(0, Math.min(100, Math.floor((cur * 100) / max)));
  }, [vol]);

  // 캐러셀 이미지 (대표 1장을 3장처럼 순환)
  const imagesForCarousel = useMemo(() => {
    const one = toImageUrl(vol?.imagePath);
    return [one, one, one];
  }, [vol]);

  // 댓글 목록
  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      setCommentLoading(true);
      const res = await fetch(`/comment/list?contentType=volunteer&contentId=${contentId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
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
        body: JSON.stringify({ contentType: 'volunteer', contentId, content, parentId: null }),
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result?.result === 'success') {
        setCommentInput('');
        message.success('댓글이 등록되었습니다.');
        await loadComments();
      } else {
        message.error(result?.errorMessage || '댓글 등록에 실패했습니다.');
      }
    } catch {
      message.error('댓글 등록 중 오류가 발생했어요.');
    } finally {
      setCommentLoading(false);
    }
  };

  // 공유
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: vol?.title || '봉사', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch (e) {
      console.warn('공유 취소/실패:', e);
    }
  };

  // 로딩/빈 상태
  if (loading) {
    return (
      <Layout>
        <div className="volunteer-content" style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </Layout>
    );
  }
  if (!vol) {
    return (
      <Layout>
        <div className="volunteer-content" style={{ padding: 24 }}>
          <Paragraph>해당 봉사를 찾을 수 없습니다.</Paragraph>
        </div>
      </Layout>
    );
  }

  // 렌더
  const startStr = fmtDate(vol?.startTime);
  const endStr = fmtDate(vol?.endTime);
  const loc = vol?.location || '장소 미정';
  const title = vol?.title || '봉사 상세';

  return (
    <Layout>
      <div className="volunteer-content">
        <Row gutter={[24, 24]}>
          {/* 메인 상세 영역 */}
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
              {/* 상세내용 */}
              <TabPane tab="상세내용" key="1">
                <Title level={4}>{title}</Title>

                <Card className="content-card" bordered={false}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {vol?.description || '봉사 설명이 등록되지 않았습니다.'}
                  </Paragraph>
                </Card>

                <Paragraph style={{ marginTop: 24 }}>장소</Paragraph>
                <Card className="content-card" bordered={false}>
                  <Paragraph>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    <Text>{loc}</Text>
                  </Paragraph>
                </Card>
              </TabPane>

              {/* 안내사항 */}
              <TabPane tab="안내사항" key="2">
                <Paragraph>
                  - 본 봉사 활동은 <strong>사전 안내 사항</strong>을 숙지한 후 참여해주세요.<br />
                  - 활동 일정은 상황에 따라 <strong>변경될 수</strong> 있습니다.<br />
                  - 현장에서의 <strong>안전 수칙</strong>을 반드시 따라주세요.<br />
                  - 무단 불참/지각이 반복되면 향후 참여가 제한될 수 있습니다.<br />
                  - 문의는 게시글 댓글 또는 고객센터를 이용해주세요.
                </Paragraph>
              </TabPane>

              {/* 댓글 */}
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
                          {(c?.createdAt || '').toString().replace('T', ' ').substring(0, 16)}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Col>

          {/* 사이드 정보 영역 */}
          <Col xs={24} md={8}>
            <Card className="info-card" variant="borderless">
              <Title level={5} style={{ marginBottom: 8 }}>{title}</Title>

              <div className="project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>{startStr}{endStr ? ` ~ ${endStr}` : ''}</Text>
              </div>

              {loc && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EnvironmentOutlined />
                  <Text>{loc}</Text>
                </div>
              )}

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>참여 현황</Text>
                <Text type="secondary">
                  <TeamOutlined style={{ marginRight: 6 }} />
                  {Number(vol?.currentPeople || 0)} / {Number(vol?.maxParticipants || 0)}
                </Text>
              </div>
              <Progress percent={progress} showInfo={false} status="active" />

              {vol?.status && (
                <div style={{ marginTop: 8 }}>
                  <CheckCircleTwoTone twoToneColor="#52c41a" style={{ marginRight: 6 }} />
                  <Text>상태: {vol.status}</Text>
                </div>
              )}

              <Button type="primary" block style={{ marginBottom: 12 }} >
                참여하기
              </Button>
              <Button icon={<ShareAltOutlined />} block style={{ marginTop: 12 }} onClick={share}>
                공유하기
              </Button>

            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
