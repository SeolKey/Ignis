import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress, Button, Tabs, Divider, message
} from 'antd';
import {
  CalendarOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
} from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/donation/DonationDetail.css';
import { Modal, Form, Input as AntInput } from 'antd';
import Comments from '../common/Comments.jsx';
import useViewOnce from '../../hooks/useViewOnce';
import testImage from '../../assets/testImage.png';
import SideMiniGrid from './SideMiniGrid.jsx';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 사이드 추천 데이터
  const [relatedDonations, setRelatedDonations] = useState([]);
  const [setHotFundings] = useState([]);

  // 전화번호 확인 모달
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;

  // 상세 로드
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/donation/api/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDonation(data);
      } catch {
        message.error('기부 상세 정보를 불러오지 못했어요.');
      }
    })();
  }, [id]);

  // ✅ 좋아요 초기 상태 로드
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/donation/api/${id}/like/state`, { credentials: 'include' });
        // state는 비로그인도 200
        const out = await res.json().catch(() => ({}));
        if (out?.result === 'success') {
          setLiked(!!out.liked);
          setLikeCount(Number(out.likeCount || 0));
        }
      } catch {
        // 조용히 무시
      }
    })();
  }, [id]);

  // 추천 섹션 로드 (엔드포인트 상황에 따라 2단계 폴백)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // 1) 관련 모금함
        let r = await fetch(`/donation/api/related?donationId=${id}&limit=6`, { credentials: 'include' });
        if (!r.ok) r = await fetch(`/donation/api/list?limit=6&sort=popular`, { credentials: 'include' });
        if (r.ok) {
          const arr = await r.json();
          if (!ignore) setRelatedDonations(Array.isArray(arr) ? arr.slice(0, 6) : []);
        }

        // 2) 인기 펀딩
        let f = await fetch(`/funding/api/list?limit=6&sort=hot`, { credentials: 'include' });
        if (!f.ok) f = await fetch(`/funding/api?limit=6`, { credentials: 'include' });
        if (f.ok) {
          const arr = await f.json();
          if (!ignore) setHotFundings(Array.isArray(arr) ? arr.slice(0, 6) : []);
        }
      } catch {
        // 조용히 폴백 무시
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  // 조회수 1회 증가
  useViewOnce({
    id,
    type: 'donation',
    endpoints: [`/donation/api/${id}/view`],
    onUpdated: (views) => setDonation((p) => (p ? { ...p, viewCount: views, views } : p)),
  });

  const contentId = donation?.donationId ?? Number(id);
  const current = Number(donation?.currentPrice || 0);
  const target = Number(donation?.maxPrice || 0);
  const progress = useMemo(() => (target ? Math.min(100, Math.floor((current * 100) / target)) : 0), [current, target]);

  const start = fmtDate(donation?.createdAt);
  const end = donation?.endAt ? fmtDate(donation.endAt) : '';

  // D-day
  const dDay = (() => {
    if (!donation?.endAt) return null;
    const rest = Math.ceil((new Date(donation.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return rest >= 0 ? `D-${rest}` : '종료';
  })();

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: donation?.title || '기부', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch {
      //
    }
  };

  // ✅ 좋아요 토글 (서버 연동)
  const toggleLike = async () => {
    try {
      const res = await fetch(`/donation/api/${id}/like/toggle`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
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

  const handleParticipate = async () => {
    try {
      const res = await fetch('/user/me/phone', { credentials: 'include', headers: { Accept: 'application/json' } });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      const isJson = (res.headers.get('content-type') || '').includes('application/json');
      const data = isJson ? await res.json() : null;
      const phoneRaw = data?.phone || data?.phoneNumber || data?.user?.phone || '';
      const digits = (phoneRaw || '').replace(/\D/g, '');
      const isUnset = digits.length === 0 || /^0+$/.test(digits);
      if (isUnset) {
        setPhoneInput(phoneRaw || '');
        setPhoneModalOpen(true);
      } else {
        navigate(`/donation-payment?id=${id}&amount=${donation?.minPrice || 0}`);
      }
    } catch {
      message.error('전화번호 확인 중 오류가 발생했어.');
    }
  };

  const goDonation = (did) => navigate(`/donation/${did}`);

  return (
    <Layout>
      {/* ───────── Hero ───────── */}
      <section className="donation-hero">
        <div className="donation-hero-container">
          <img
            src={donation?.imagePath || donation?.image_url || donation?.thumbnailPath || testImage}
            alt="hero"
            onError={(e) => (e.currentTarget.src = testImage)}
          />
          <div className="donation-hero-overlay" />
          <div className="donation-hero-inner">
            {dDay && <span className={`donation-dtag ${dDay === '종료' ? 'ended' : ''}`}>{dDay}</span>}
            <h1 className="donation-hero-title">{donation?.title || '기부 프로젝트'}</h1>
            <div className="donation-hero-progress">
              <Progress percent={progress} showInfo={false} status="active" />
              <div className="donation-hero-progress-meta">
                <span>{progress}%</span>
                <span>{current.toLocaleString()}원 / {target.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 본문 (폭 Hero와 맞춤) ───────── */}
      <div className="donation-main-section">
        <Row gutter={[24, 24]}>
          {/* 좌측: 내용 */}
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="intro" className="donation-custom-tabs">
              <TabPane tab="모금소개" key="intro">
                <Card className="donation-content-card" bordered={false}>
                  <Paragraph>{donation?.description || '기부 설명이 등록되지 않았습니다.'}</Paragraph>
                </Card>

                {/* ✅ 주의사항 카드 */}
                <Card className="donation-warning-card" bordered={false}>
                  <Title level={5} className="donation-warning-title">기부 전 꼭 확인해주세요</Title>
                  <ul className="donation-warning-list">
                    <li>기부금은 지정된 목적 외에는 사용되지 않습니다.</li>
                    <li>모금함 개설자의 사정으로 조기 종료되거나 변경될 수 있습니다.</li>
                    <li>기부는 신중하게 결정해 주시기 바라며, 완료된 기부는 취소나 환불이 어렵습니다.</li>
                    <li>기부 내역과 사용 결과는 모금 단체의 보고를 통해 확인하실 수 있습니다.</li>
                    <li>세제 혜택(기부금 영수증 발급 등)은 해당 모금 단체의 정책에 따라 달라질 수 있습니다.</li>
                  </ul>
                </Card>
              </TabPane>

              <TabPane tab="댓글" key="comment">
                <Comments contentType="donation" contentId={contentId} />
              </TabPane>
            </Tabs>
          </Col>

          {/* 우측: 기부 위젯 + 추천 섹션 */}
          <Col xs={24} md={8}>
            <Card className="donation-info-card" bordered>
              <Title level={5}>{donation?.title}</Title>
              <div className="donation-project-period">
                <CalendarOutlined className="donation-calendar-icon" />
                <Text>{start}{end ? ` ~ ${end}` : ''}</Text>
              </div>
              <Divider />
              <div className="donation-stacked-metrics">
                <div className="donation-metric"><Text type="secondary">목표 금액</Text><Text strong>{target.toLocaleString()}원</Text></div>
                <div className="donation-metric"><Text type="secondary">현재 금액</Text><Text strong>{current.toLocaleString()}원</Text></div>
                <div className="donation-metric"><Text type="secondary">달성률</Text><Text strong className="donation-accent">{progress}%</Text></div>
                <div className="donation-metric">
                  <EyeOutlined />
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    {(Number(donation?.viewCount ?? donation?.views ?? 0)).toLocaleString()}회 조회
                  </Text>
                </div>
                {/* ✅ 좋아요 수 표시 */}
                <div className="donation-metric">
                  {liked ? <HeartFilled /> : <HeartOutlined />}
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    {likeCount.toLocaleString()}명이 응원했어요
                  </Text>
                </div>
              </div>
              <Progress percent={progress} showInfo={false} status="active" />

              <div className="action-row">
                <div className="icon-group">
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
                    aria-label="공유하기"
                    onClick={share}
                  >
                    <ShareAltOutlined />
                  </button>
                </div>

                <Button
                  type="primary"
                  size="large"
                  className="cta-btn"
                  onClick={handleParticipate}
                >
                  기부하기
                </Button>
              </div>

            </Card>

            {/* 함께 보는 모금함 */}
            <SideMiniGrid
              title="함께 보는"
              type="기부"
              items={relatedDonations}
              onMore={() => navigate('/donation')}
              onClickItem={(did) => goDonation(did)}
            />
          </Col>
        </Row>
      </div>

      {/* 연락처 확인 모달 */}
      <Modal
        title="연락처 확인"
        open={phoneModalOpen}
        onCancel={() => setPhoneModalOpen(false)}
        onOk={async () => {
          const v = (phoneInput || '').trim();
          if (!phoneRegex.test(v)) {
            message.error('휴대폰 형식을 확인해줘. (예: 010-1234-5678)');
            return;
          }
          try {
            setPhoneSaving(true);
            const res = await fetch('/user/me/phone', {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ phone: v }),
            });
            const out = await res.json().catch(() => ({}));
            if (out?.result === 'success') {
              message.success('확인되었습니다. 결제 페이지로 이동합니다.');
              setPhoneModalOpen(false);
              navigate(`/donation-payment?id=${id}&amount=${donation?.minPrice || 0}`);
            } else {
              message.error(out?.error_message || '전화번호 저장에 실패했어.');
            }
          } catch {
            message.error('요청 처리 중 오류가 발생했어.');
          } finally {
            setPhoneSaving(false);
          }
        }}
        confirmLoading={phoneSaving}
        okText="확인"
        cancelText="취소"
      >
        <Form layout="vertical">
          <Form.Item label="전화번호 (하이픈 포함)">
            <AntInput
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="010-1234-5678"
              inputMode="numeric"
              maxLength={13}
            />
          </Form.Item>
          <div className="donation-phone-hint">예: 010-1234-5678</div>
        </Form>
      </Modal>
    </Layout>
  );
}
