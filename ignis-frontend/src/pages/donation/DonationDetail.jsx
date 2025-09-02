import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress,
  Button, Tabs, Divider, message, Spin, List, Input
} from 'antd';
import { CalendarOutlined, ShareAltOutlined } from '@ant-design/icons';
import "../../styles/donation/DonationDetail.css";
import Layout from '../../components/Layout';
import testImage from '../../assets/testImage.png';
import { Carousel } from 'antd';
import { Modal, Form, Input as AntInput } from 'antd';

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

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태 정의
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);

  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;

  // 기부 상세 데이터 불러오기
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/donation/api/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setDonation(data);
      } catch {
        message.error('기부 상세 정보를 불러오지 못했어요.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const contentId = donation?.donationId ?? donation?.id ?? Number(id);

  // 댓글 불러오기
  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      setCommentLoading(true);
      const res = await fetch(`/comment/list?contentType=donation&contentId=${contentId}`, {
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
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          contentType: 'donation',
          contentId,
          content,
          parentId: null,
        }),
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

  // 진행률 계산
  const progress = useMemo(() => {
    const cur = Number(donation?.currentPrice || 0);
    const max = Number(donation?.maxPrice || 0);
    if (!max) return 0;
    return Math.max(0, Math.min(100, Math.floor((cur * 100) / max)));
  }, [donation]);

  // 캐러셀 이미지 세팅
  const imagesForCarousel = useMemo(() => {
    const raw = Array.isArray(donation?.images)
      ? donation.images
        .map((it) => (typeof it === 'string' ? it : it?.url || it?.path || it?.imagePath))
        .filter(Boolean)
      : [];
    if (raw.length < 2) return [testImage, testImage, testImage];
    return raw;
  }, [donation]);

  const start = fmtDate(donation?.createdAt);
  const end = donation?.endAt ? fmtDate(donation.endAt) : '';

  // 참여하기 버튼 (전화번호 확인 → 결제 이동)
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
      const digits = phoneRaw.replace(/\D/g, '');
      const isUnset = digits.length === 0 || /^0+$/.test(digits);
      if (isUnset) {
        setPhoneInput(phoneRaw);
        setPhoneModalOpen(true);
      } else {
        message.success('연락처 확인 완료! 결제 페이지로 이동합니다.');
        navigate('/payment');
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


  // 로딩 중
  if (loading) {
    return (
      <Layout>
        <div className="donation-content" style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </Layout>
    );
  }

  // 데이터 없음
  if (!donation) {
    return (
      <Layout>
        <div className="donation-content" style={{ padding: 24 }}>
          <Paragraph>해당 프로젝트를 찾을 수 없습니다.</Paragraph>
        </div>
      </Layout>
    );
  }

  // 화면 렌더링
  return (
    <Layout>
      <div className="donation-content">
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
                      style={{
                        width: '100%',
                        height: 300,
                        objectFit: 'cover',
                        borderRadius: 8,
                        background: '#f0f0f0'
                      }}
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
                <Title level={4}>{donation.title}</Title>
                <Card className="content-card" bordered={false}>
                  <Paragraph>{donation.description || '기부 설명이 등록되지 않았습니다.'}</Paragraph>
                </Card>
                <Paragraph style={{ marginTop: 24 }}>계좌 정보</Paragraph>
                <Card className="content-card" bordered={false}>
                  <Paragraph>{donation.accountInfo || '계좌 정보가 등록되지 않았습니다.'}</Paragraph>
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

          {/* 사이드 정보 영역 */}
          <Col xs={24} md={8}>
            <Card className="info-card" variant="borderless">
              <Title level={5}>{donation.title}</Title>
              <div className="project-period">
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text>{start}{end ? ` ~ ${end}` : ''}</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Text strong>{progress}% 달성</Text>
              <Progress percent={progress} showInfo={false} status="active" />
              {end && <Text type="secondary" style={{ float: 'right' }}>{end} 종료</Text>}

              <div className="stats">
                <Paragraph>
                  <Text>목표 금액</Text><br />
                  <Text>{Number(donation.maxPrice || 0).toLocaleString()}원</Text>
                </Paragraph>
                <Paragraph>
                  <Text>현재 금액</Text><br />
                  <Text>{Number(donation.currentPrice || 0).toLocaleString()}원</Text>
                </Paragraph>
              </div>

              <Button type="primary" block onClick={handleParticipate}>
                프로젝트 참여하기
              </Button>
              <Button icon={<ShareAltOutlined />} block style={{ marginTop: 12 }} onClick={share}>
                공유하기
              </Button>
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
              navigate('/payment');
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
          <div style={{ color: '#999' }}>예: 010-1234-5678</div>
        </Form>
      </Modal>
    </Layout>
  );
}
