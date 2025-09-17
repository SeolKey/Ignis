// src/pages/volunteer/VolunteerDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Typography, Progress,
  Button, Tabs, Divider, message, Spin, Input,
  Carousel, Modal, Table
} from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ShareAltOutlined, TeamOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerDetail.css';
import testImage from '../../assets/testImage.png';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const participantCols = [
  { title: '이름', dataIndex: 'name', key: 'name', width: '30%' },
  { title: '전화번호', dataIndex: 'phone', key: 'phone', width: '30%' },
  { title: '이메일', dataIndex: 'email', key: 'email', width: '40%' },
];

const fmtDate = (v) => {
  if (!v) return '';
  try {
    const d = new Date(typeof v === 'string' ? v.replace(' ', 'T') : v);
    if (Number.isNaN(d.getTime())) return String(v);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch{
    return String(v);
  }
};

const toImageUrl = (p) => {
  if (!p || String(p).trim() === '' || String(p).toLowerCase() === 'null') return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  return `/${encodeURI(String(p).replace(/^\.?\/?/, ''))}`;
};

export default function VolunteerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [vol, setVol] = useState(null);
  const [joined, setJoined] = useState(false);

  // ✅ 참여자 모달 상태들 추가
  const [openParticipants, setOpenParticipants] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);

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

        // 참여여부 체크
        if (!ignore && payload?.volunteerId) {
          const check = await fetch(`/volunteer/${payload.volunteerId}/join/me`, { credentials: 'include' });
          if (check.ok) {
            const result = await check.json();
            setJoined(!!result.joined);
          }
        }
      } catch  {
        message.error('봉사 상세 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const progress = useMemo(() => {
    const cur = Number(vol?.currentPeople || 0);
    const max = Number(vol?.maxParticipants || 0);
    if (!max) return 0;
    return Math.max(0, Math.min(100, Math.floor((cur * 100) / max)));
  }, [vol]);

  const imagesForCarousel = useMemo(() => {
    const one = toImageUrl(vol?.imagePath);
    return [one, one, one];
  }, [vol]);

  const toggleJoin = async () => {
    if (!vol?.volunteerId) return;
    try {
      const url = `/volunteer/${vol.volunteerId}/join`;
      const method = joined ? 'DELETE' : 'POST';
      const res = await fetch(url, { method, credentials: 'include' });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = { ...vol };
      if (joined) {
        updated.currentPeople = Math.max(0, (updated.currentPeople || 1) - 1);
      } else {
        updated.currentPeople = (updated.currentPeople || 0) + 1;
      }
      setVol(updated);
      setJoined(!joined);
      message.success(joined ? '봉사 참여가 취소되었습니다.' : '봉사에 참여했습니다.');
    } catch {
      message.error('처리 중 오류가 발생했습니다.');
    }
  };

  // ✅ 컴포넌트 내부로 이동(훅/상태 접근)
  const fetchParticipants = async () => {
    if (!vol?.volunteerId) return;
    try {
      setLoadingParticipants(true);
      const res = await fetch(`/volunteer/${vol.volunteerId}/participants`, { credentials: 'include' });
      if (res.status === 403) {
        message.warning('권한이 없습니다. (작성자/관리자만 조회 가능)');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      setParticipants(Array.isArray(list) ? list : []);
    } catch  {
      message.error('참여자 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openParticipantsModal = async () => {
    setOpenParticipants(true);
    setParticipants([]);
    await fetchParticipants();
  };

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

  const startStr = fmtDate(vol?.startTime);
  const endStr = fmtDate(vol?.endTime);
  const loc = vol?.location || '장소 미정';
  const title = vol?.title || '봉사 상세';

  return (
    <Layout>
      <div className="volunteer-content">
        <Row gutter={[24, 24]}>
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

            <Tabs defaultActiveKey="1" className="custom-tabs">
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

              <TabPane tab="안내사항" key="2">
                <Paragraph>본 봉사 활동은 사전 안내 사항을 숙지한 후 참여해주세요.</Paragraph>
              </TabPane>

              <TabPane tab="댓글" key="3">
                {/* 댓글 구현부 생략 */}
              </TabPane>
            </Tabs>
          </Col>

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

              <Button
                type={joined ? 'default' : 'primary'}
                danger={joined}
                block
                style={{ marginBottom: 12 }}
                onClick={toggleJoin}
              >
                {joined ? '참여 취소하기' : '봉사 참여하기'}
              </Button>

              <Button
                icon={<ShareAltOutlined />}
                block
                style={{ marginTop: 12 }}
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href).then(() => message.success('링크 복사됨'))
                }
              >
                공유하기
              </Button>

              {/* 작성자/관리자만 노출하려면 아래 조건 추가: vol.canViewParticipantList && */}
              <Button block onClick={openParticipantsModal} style={{ marginTop: 12 }}>
                참여 인원 목록
              </Button>

              <Modal
                title="참여 인원 목록"
                open={openParticipants}
                onCancel={() => setOpenParticipants(false)}
                footer={null}
                width={720}
                destroyOnClose
              >
                <Table
                  rowKey={(r, i) => i}
                  columns={participantCols}
                  dataSource={participants}
                  loading={loadingParticipants}
                  locale={{ emptyText: '참여 인원이 없습니다.' }}
                  pagination={{ pageSize: 10 }}
                />
              </Modal>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
