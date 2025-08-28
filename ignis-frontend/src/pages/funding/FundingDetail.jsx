import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Typography, Space, Button, Divider, Progress, message } from 'antd';
import { CalendarOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/funding/FundingDetail.css';

const { Title, Text, Paragraph } = Typography;

export default function FundingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
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
        if (!ignore) setItem(data?.funding ?? null); // 컨트롤러 응답 { funding: {...} }
      } catch (e) {
        console.error(e);
        message.error('펀딩 상세 불러오기 실패');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  // 진행률
  const progress = useMemo(() => {
    const cur = Number(item?.currentPrice || 0);
    const max = Number(item?.maxPrice || 0);
    if (!max) return 0;
    return Math.max(0, Math.min(100, Math.floor((cur * 100) / max)));
  }, [item]);

  // 기간 (createdAt을 시작일처럼 노출)
  const startDate = useMemo(() => {
    if (!item?.createdAt) return '';
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${dd}`;
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

  if (loading) {
    return (
      <Layout>
        <div className="funding-detail" style={{ padding: 24 }}>로딩 중…</div>
      </Layout>
    );
  }
  if (!item) {
    return (
      <Layout>
        <div className="funding-detail" style={{ padding: 24 }}>
          <Paragraph>해당 프로젝트를 찾을 수 없습니다.</Paragraph>
          <Button onClick={() => navigate('/funding')}>목록</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="funding-detail">
        {/* 상단: 제목/액션 바 */}
        <Card className="header-card" bordered={false}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>{item?.title ?? '펀딩 상세'}</Title>
              {startDate && (
                <Text type="secondary"><CalendarOutlined style={{ marginRight: 6 }} />{startDate} 시작</Text>
              )}
            </div>
            <Space>
              <Button onClick={() => navigate('/funding')}>목록</Button>
              <Button type="primary" onClick={() => navigate(`/funding/${id}/edit`)}>수정</Button>
            </Space>
          </Space>
        </Card>

        {/* 메인: 좌 이미지 / 우 정보 */}
        <Card bordered>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10}>
              <div className="image-box">
                {item?.imagePath ? (
                  <img src={item.imagePath} alt="대표 이미지" />
                ) : (
                  <div className="image-fallback">대표 이미지</div>
                )}
              </div>
            </Col>

            <Col xs={24} md={14}>
              <Text className="progress-label">{progress}% 달성</Text>
              <Progress percent={progress} showInfo={false} status="active" style={{ marginTop: 6 }} />

              <div className="funding-stats">
                <div>
                  <Text type="secondary">목표 금액</Text><br />
                  <Text strong>{Number(item?.maxPrice || 0).toLocaleString()}원</Text>
                </div>
                <div>
                  <Text type="secondary">현재 모금액</Text><br />
                  <Text strong>{Number(item?.currentPrice || 0).toLocaleString()}원</Text>
                </div>
              </div>

              <div className="action-buttons">
                <Button
                  type="primary"
                  style={{ minWidth: 180 }}
                  onClick={() => navigate('/payment')}
                >
                  프로젝트 참여하기
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={share}>
                  공유하기
                </Button>
              </div>

              <Divider />
              <div className="info-meta">
                프로젝트 기간: <span>{startDate} ~ (종료일 미정)</span>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 소개 섹션 */}
        <Card className="section-card" bordered>
          <Title level={4} style={{ marginTop: 0 }}>프로젝트 소개</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
            {item?.description || '프로젝트 설명이 등록되지 않았습니다.'}
          </Paragraph>
        </Card>

        {/* 관련 프로젝트 (샘플) */}
        <Card className="section-card" bordered>
          <Title level={5} style={{ marginTop: 0 }}>관련 프로젝트</Title>
          <div className="related-projects">
            <div className="related-item">
              <div className="thumb" />
              <div className="text">샘플 프로젝트 A<br /><small>— 준비 중 —</small></div>
            </div>
            <div className="related-item">
              <div className="thumb" />
              <div className="text">샘플 프로젝트 B<br /><small>— 준비 중 —</small></div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
