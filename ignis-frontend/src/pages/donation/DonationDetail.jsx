import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Progress, Button, Tabs, Divider, message, Tooltip } from 'antd';
import {
  CalendarOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
} from '@ant-design/icons';
import "../../styles/donation/DonationDetail.css";
import Layout from '../../components/Layout';
import testImage from '../../assets/testImage.png';
import { Carousel } from 'antd';
import { Modal, Form, Input as AntInput } from 'antd';
import Comments from '../common/Comments.jsx';
import useViewOnce from '../../hooks/useViewOnce'; // ✅ 조회수 훅

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

// 이미지 후보 필드에서 URL 뽑아오기
const pickImageFields = (obj) => {
  if (!obj) return [];
  const candidates = [
    obj.url, obj.path, obj.imagePath, obj.image_url, obj.image, obj.thumbnailUrl,
    obj.thumbnail_path, obj.thumbnailPath, obj.mainImage, obj.coverImage
  ].filter(Boolean);

  // 문자열이 아니라 {url: "..."} 형태가 섞였을 가능성 처리
  const flat = candidates.map((c) => (typeof c === 'string' ? c : c?.url || c?.path || c?.imagePath)).filter(Boolean);

  // 로컬 파일 경로가 내려오는 경우(예: C:\...)는 프론트에서 못 씀 → 그대로 두되 서버가 /uploads/** 로 매핑되면 표시됨
  return flat;
};

// 배열 형태 images에서 URL 뽑기
const extractFromImagesArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((it) => (typeof it === 'string' ? it : pickImageFields(it)[0]))
    .filter(Boolean);
};

// Donation 응답에서 이미지 후보 추출
const extractDonationImages = (don) => {
  if (!don) return [];
  // 선호 순서: images[] → 대표 이미지 필드들
  const list = [
    ...extractFromImagesArray(don.images),
    ...pickImageFields(don),
  ].filter(Boolean);
  // 중복 제거
  return Array.from(new Set(list));
};

// Funding 응답에서 이미지 후보 추출
const extractFundingImages = (fund) => {
  if (!fund) return [];
  const list = [
    ...extractFromImagesArray(fund.images),
    ...pickImageFields(fund),
  ].filter(Boolean);
  return Array.from(new Set(list));
};

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [imageUrls, setImageUrls] = useState([]); // ✅ 캐러셀에 쓸 최종 이미지들
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);

  //  좋아요 상태
  const [liked, setLiked] = useState(false);

  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;

  // 기부 상세 데이터 불러오기 (+ 이미지 폴백: 펀딩)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`/donation/api/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (ignore) return;

        setDonation(data);

        // 1) Donation에서 이미지 추출
        let images = extractDonationImages(data);

        // 2) 이미지가 없거나 너무 적다면 → Funding에서 폴백
        if (!images || images.length === 0) {
          // 매칭용 키: donation.fundingId 가 있으면 우선, 없으면 동일 id로 시도
          const fundingKey = data?.fundingId ?? id;
          try {
            const fres = await fetch(`/funding/api/${fundingKey}`, { credentials: 'include' });
            if (fres.ok) {
              const fdata = await fres.json();
              const fimgs = extractFundingImages(fdata);
              if (fimgs.length > 0) {
                images = fimgs;
              }
            }
          } catch {
            // 펀딩 폴백 실패는 무시하고 아래로 진행
          }
        }

        setImageUrls(images);
      } catch {
        message.error('기부 상세 정보를 불러오지 못했어요.');
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const contentId = donation?.donationId ?? donation?.id ?? Number(id);

  // ✅ 조회수 훅: 최초 진입 1회만 증가 (6시간 쿨다운)
  useViewOnce({
    id,
    type: 'donation',
    endpoints: [`/donation/api/${id}/view`], // 컨트롤러 분리형 엔드포인트
    onUpdated: (views) => {
      // 서버가 최신 viewCount를 내려줬다면 UI에 반영
      setDonation((prev) => (prev ? { ...prev, viewCount: views, views } : prev));
    },
  });

  // 진행률 계산
  const progress = useMemo(() => {
    const cur = Number(donation?.currentPrice || 0);
    const max = Number(donation?.maxPrice || 0);
    if (!max) return 0;
    return Math.max(0, Math.min(100, Math.floor((cur * 100) / max)));
  }, [donation]);

  // 캐러셀 이미지 세팅 (없으면 테스트 이미지 3장)
  const imagesForCarousel = useMemo(() => {
    if (imageUrls && imageUrls.length >= 1) return imageUrls;
    return [testImage, testImage, testImage];
  }, [imageUrls]);

  const start = fmtDate(donation?.createdAt);
  const end = donation?.endAt ? fmtDate(donation.endAt) : '';

  // 참여하기 버튼
  const handleParticipate = async () => {
    try {
      const res = await fetch('/user/me/phone', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      const isJson = (res.headers.get('content-type') || '').includes('application/json');
      const data = isJson ? await res.json() : null;
      const phoneRaw =
        data?.phone || data?.phoneNumber || data?.user?.phone || '';
      const digits = (phoneRaw || '').replace(/\D/g, '');
      const isUnset = digits.length === 0 || /^0+$/.test(digits);
      if (isUnset) {
        setPhoneInput(phoneRaw || '');
        setPhoneModalOpen(true);
      } else {
        message.success('연락처 확인 완료! 결제 페이지로 이동합니다.');
        navigate(`/donation-payment?id=${id}&amount=${donation?.minPrice || 0}`);
      }
    } catch {
      message.error('전화번호 확인 중 오류가 발생했어.');
    }
  };

  // 공유하기
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: donation?.title || '기부', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch (e) {
      console.warn('공유 처리 중 중단/실패:', e);
    }
  };

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      // await fetch(`/like/toggle?contentType=donation&contentId=${contentId}`, { method: 'POST', credentials: 'include' });
      setLiked((v) => !v);
    } catch {
      message.error('좋아요 처리 중 오류가 발생했어요.');
    }
  };

  return (
    <Layout>
      <div className="donation-detail-content">
        <Row gutter={[24, 24]}>
          {/* 메인 상세 영역 */}
          <Col xs={24} md={16}>
            <Card bordered={false} className="donation-thumbnail-card">
              <Carousel autoplay autoplaySpeed={3000} pauseOnHover={false} dots>
                {imagesForCarousel.map((src, idx) => (
                  <div key={idx}>
                    <img
                      className="donation-thumbnail-image"
                      src={src || testImage}
                      alt={`이미지-${idx}`}
                      onError={(e) => { e.currentTarget.src = testImage; }}
                    />
                  </div>
                ))}
              </Carousel>
            </Card>

            <Tabs defaultActiveKey="1" className="donation-custom-tabs">
              {/* 상세내용 */}
              <TabPane tab="상세내용" key="1">
                <Title level={4}>{donation?.title}</Title>
                <Card className="donation-content-card" bordered={false}>
                  <Paragraph>{donation?.description || '기부 설명이 등록되지 않았습니다.'}</Paragraph>
                </Card>
              </TabPane>

              {/* 안내사항 */}
              <TabPane tab="안내사항" key="2">
                <Paragraph>
                  - 본 프로젝트는 <strong>실제 기부금 전달</strong>을 기반으로 운영됩니다.<br />
                  - 모든 기부금은 투명한 절차를 거쳐 수혜자에게 전달됩니다.<br />
                  - 기부 참여 전, <strong>내용·목적·기부처</strong>를 반드시 확인해주세요.<br />
                  - 기부 완료 후에는 <strong>환불 불가</strong>이니 신중히 결정해주세요.<br />
                  - 내역과 사용 결과는 마이페이지 및 상세 페이지에서 확인 가능합니다.<br />
                </Paragraph>
              </TabPane>

              {/* 댓글 */}
              <TabPane tab="댓글" key="3">
                <Comments contentType="donation" contentId={contentId} />
              </TabPane>
            </Tabs>
          </Col>

          {/* 사이드 정보 영역 */}
          <Col xs={24} md={8}>
            <Card className="donation-info-card" variant="borderless">
              <Title level={5}>{donation?.title}</Title>
              <div className="donation-project-period">
                <CalendarOutlined className="donation-calendar-icon" />
                <Text>{start}{end ? ` ~ ${end}` : ''}</Text>
              </div>

              <Divider className="donation-divider-tight" />

              <Text strong>{progress}% 달성</Text>
              <Progress percent={progress} showInfo={false} status="active" />
              {end && <Text type="secondary" className="donation-end-text">{end} 종료</Text>}

              <div className="donation-stats">
                <Paragraph>
                  <Text>목표 금액</Text><br />
                  <Text>{Number(donation?.maxPrice || 0).toLocaleString()}원</Text>
                </Paragraph>
                <Paragraph>
                  <Text>현재 금액</Text><br />
                  <Text>{Number(donation?.currentPrice || 0).toLocaleString()}원</Text>
                </Paragraph>
                <Paragraph style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EyeOutlined />
                  <Text type="secondary">
                    {Number(donation?.viewCount ?? donation?.views ?? 0).toLocaleString()}회 조회
                  </Text>
                </Paragraph>
              </div>

              {/* 하단 액션 */}
              <div className="donation-action-row">
                <div className="donation-icon-group">
                  <Tooltip title={liked ? '좋아요 취소' : '좋아요'}>
                    <button
                      type="button"
                      className={`donation-icon-btn ${liked ? 'active' : ''}`}
                      aria-label="좋아요"
                      onClick={toggleLike}
                    >
                      {liked ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                  </Tooltip>
                  <Tooltip title="공유하기">
                    <button
                      type="button"
                      className="donation-icon-btn"
                      aria-label="공유하기"
                      onClick={share}
                    >
                      <ShareAltOutlined />
                    </button>
                  </Tooltip>
                </div>
                <Button type="primary" size="large" className="donation-cta-btn" onClick={handleParticipate}>
                  기부하기
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 전화번호 입력 모달 */}
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
              message.success('감사합니다! 결제 페이지로 이동합니다.');
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
