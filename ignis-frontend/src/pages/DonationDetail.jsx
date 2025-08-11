import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress,
  Button, Tabs, Divider, message, Spin
} from 'antd';
import { CalendarOutlined, ShareAltOutlined } from '@ant-design/icons';
import '../styles/DonationDetail.css';
import Layout from '../components/Layout';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${dd}`;
};

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // 백엔드 REST: GET /api/donation/{id}
        const res = await fetch(`/donation/api/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setDonation(data);
      } catch (e) {
        console.error(e);
        message.error('기부 상세 정보를 불러오지 못했어요.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const progress = useMemo(() => {
    const cur = Number(donation?.currentPrice || 0);
    const max = Number(donation?.maxPrice || 0);
    if (!max) return 0;
    return Math.max(0, Math.min(100, Math.floor((cur * 100) / max)));
  }, [donation]);

  const start = fmtDate(donation?.createdAt);
  const end = donation?.endAt ? fmtDate(donation.endAt) : ''; // 백엔드가 endAt 주면 사용

  const handleParticipate = () => navigate('/payment');
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: donation?.title || '기부', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('링크가 복사되었어요.');
      }
    } catch {/* 취소 등 무시 */}
  };

  if (loading) {
    return (
      <Layout>
        <div className="donation-content" style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </Layout>
    );
  }

  if (!donation) {
    return (
      <Layout>
        <div className="donation-content" style={{ padding: 24 }}>
          <Paragraph>해당 프로젝트를 찾을 수 없습니다.</Paragraph>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="donation-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card bordered={false} className="thumbnail-card">
              <img
                src={donation.imagePath || '/default-image.png'}
                alt="대표 이미지"
                style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8, background: '#f0f0f0' }}
              />
            </Card>

            <Tabs defaultActiveKey="1" className="custom-tabs">
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

              <TabPane tab="안내사항" key="2">
                <Paragraph>
                  - 본 프로젝트는 실제 기부를 기반으로 하는 서비스입니다.<br />
                  - 기부 완료 후 환불은 불가하니 신중히 참여해주세요.
                </Paragraph>
              </TabPane>

              <TabPane tab="댓글" key="3">
                <Paragraph>댓글 기능은 준비 중입니다.</Paragraph>
              </TabPane>
            </Tabs>
          </Col>

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
    </Layout>
  );
}
