import React, { useMemo, useState } from 'react';
import { Form, Input, Button, Card, Typography, DatePicker, InputNumber, message, Row, Col, Alert, Tooltip, Checkbox, Modal, Divider, Upload } from 'antd';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerCreate.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// DB image_path가 NOT NULL이라 기본 경로를 전송 (이미지 없을 때만 사용)
const DEFAULT_IMAGE_PATH = '/images/default-volunteer.png';

// 날짜 포맷터 (백엔드가 yyyy-MM-dd HH:mm:ss로 받도록 유지)
const fmt = (d) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm:ss') : '');

// 동의 전문
const AGREEMENT_TEXT = `
본 ‘봉사 생성’은 관리자 승인 후에만 공개됩니다. 제출 이후에는
심사 공정성과 기록 보존을 위해 ‘내용 수정/삭제가 제한’될 수 있습니다.
제목·설명·장소·모집 인원·일시 등 모든 정보를 충분히 확인하신 뒤 제출해 주시기 바랍니다.
허위·과장 기재 또는 저작권을 침해하는 자료 사용 시 반려될 수 있습니다.
`;

export default function VolunteerCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [agree, setAgree] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 상세 이미지 (여러 장)
  const [detailFiles, setDetailFiles] = useState([]); // File[] (originFileObj 기반)

  const validateEndAfterStart = (_, value) => {
    const start = form.getFieldValue('startTime');
    if (!start || !value) return Promise.resolve();
    return dayjs(value).isAfter(dayjs(start))
      ? Promise.resolve()
      : Promise.reject(new Error('종료 시각은 시작 시각 이후여야 합니다.'));
  };

  const onChangeDetailImages = ({ fileList }) => {
    // 최대 10장 제한, 이미지 파일만
    const sanitized = (fileList || [])
      .slice(0, 10)
      .filter(f => {
        const typeOk = (f.type || '').startsWith('image/');
        if (!typeOk) message.warning('이미지 파일만 업로드하실 수 있습니다.');
        return typeOk;
      });
    setDetailFiles(sanitized);
  };

  // 이미지가 있으면 multipart/form-data, 없으면 기존 x-www-form-urlencoded로 유지
  const onFinish = async (values) => {
    const hasImages = detailFiles.length > 0;

    try {
      setSubmitting(true);

      if (!hasImages) {
        // 기존: x-www-form-urlencoded (이미지 없을 때)
        const params = new URLSearchParams();
        params.set('title', values.title ?? '');
        params.set('description', values.description ?? '');
        params.set('location', values.location ?? '');
        params.set('startTime', fmt(values.startTime));
        params.set('endTime', fmt(values.endTime));
        params.set('maxParticipants', String(values.maxParticipants ?? ''));
        params.set('currentPeople', String(values.currentPeople ?? 0));
        // 서버가 기본 이미지를 자동 세팅하지 않는 경우 대비
        params.set('imagePath', values.imagePath ?? DEFAULT_IMAGE_PATH);

        const res = await fetch('/volunteer/react/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: params.toString(),
          credentials: 'include',
        });

        let data;
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = { raw: text }; }

        if (res.status === 401) {
          message.warning('로그인 후 이용해 주십시오.');
          navigate('/login');
          return;
        }
        if (!res.ok || data?.result === '실패' || data?.result === 'fail') {
          message.error(data?.error || `등록 실패 (HTTP ${res.status})`);
          return;
        }

        message.success('봉사 등록이 완료되었습니다! (관리자 승인 후 공개됩니다)');
        navigate('/volunteer');
        return;
      }

      // ✅ 새 방식: multipart/form-data (상세 이미지 포함)
      const fd = new FormData();
      fd.append('title', values.title ?? '');
      fd.append('description', values.description ?? '');
      fd.append('location', values.location ?? '');
      fd.append('startTime', fmt(values.startTime));
      fd.append('endTime', fmt(values.endTime));
      fd.append('maxParticipants', String(values.maxParticipants ?? ''));
      fd.append('currentPeople', String(values.currentPeople ?? 0));
      // ⛔️ multipart 분기에서는 imagePath를 보내지 않음 (서버가 file로 저장 경로 세팅하도록)
      // fd.append('imagePath', ...);  // 제거

      // ✅ 대표 이미지: 상세 이미지 중 첫 번째를 대표로 사용하여 'file' 필드로 전송
      const cover = detailFiles[0];
      const coverBlob = cover?.originFileObj ?? cover;
      if (coverBlob) {
        fd.append('file', coverBlob, coverBlob.name || 'cover.jpg');
      }

      // (옵션) 상세 이미지 여러 장 — 서버에서 detailImages[] 처리 시에만 사용
      detailFiles.forEach((f, idx) => {
        const file = f.originFileObj ?? f;
        if (file) fd.append('detailImages', file, file.name || `detail_${idx}.jpg`);
      });

      const res = await fetch('/volunteer/react/create', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });

      let data;
      const text = await res.text();
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (res.status === 401) {
        message.warning('로그인 후 이용해 주십시오.');
        navigate('/login');
        return;
      }
      if (!res.ok || data?.result === '실패' || data?.result === 'fail') {
        message.error(data?.error || `등록 실패 (HTTP ${res.status})`);
        return;
      }

      message.success('봉사 등록이 완료되었습니다! (관리자 승인 후 공개됩니다)');
      navigate('/volunteer');
    } catch (err) {
      console.error('봉사 등록 실패:', err);
      message.error('봉사 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitTooltip = useMemo(() => {
    if (!agree) return '제출 전 동의가 필요합니다.';
    return '관리자 승인 후 공개됩니다.';
  }, [agree]);

  return (
    <Layout>
      <div className="volunteer-create-page modern">
        {/* 상단 승인 안내 배너 */}
        <div className="volunteer-create-banner">
          <Alert
            type="info"
            showIcon
            message={
              <div className="banner-row">
                <span>
                  봉사 모집은 <b>관리자 승인</b>을 거쳐 공개됩니다.
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    승인 완료 전까지는 비공개 상태입니다.
                  </Text>
                </span>
                <Tooltip title="심사 기준: 사실성·공익성·저작권 준수·모집 정보의 적정성">
                  <InfoCircleOutlined className="banner-help" />
                </Tooltip>
              </div>
            }
          />
        </div>

        <Card className="form-card modern" bordered>
          <div className="form-header">
            <Title level={3} style={{ margin: 0 }}>새 봉사 등록</Title>
            <Tooltip title="제출 이후에는 수정/삭제가 어려우므로 반드시 신중히 작성해 주십시오.">
              <ExclamationCircleOutlined className="header-tip" />
            </Tooltip>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              imagePath: DEFAULT_IMAGE_PATH,
              currentPeople: 0,
            }}
          >
            <Form.Item
              label="제목"
              name="title"
              rules={[{ required: true, message: '제목을 입력해 주십시오.' }]}
            >
              <Input placeholder="예) 독거 어르신 반찬 봉사 모집" />
            </Form.Item>

            <Form.Item
              label="설명"
              name="description"
              rules={[{ required: true, message: '설명을 입력해 주십시오.' }]}
              extra="봉사 목적, 세부 일정, 역할, 준비물, 유의사항 등을 구체적으로 작성해 주시면 승인에 유리합니다."
            >
              <TextArea rows={6} placeholder="봉사 내용과 일정을 자세히 작성해 주십시오." />
            </Form.Item>

            <Card className="sub-card" title="봉사 정보">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="장소"
                    name="location"
                    rules={[{ required: true, message: '장소를 입력해 주십시오.' }]}
                  >
                    <Input placeholder="예) 마포구청 자원봉사센터 3층" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="모집 인원"
                    name="maxParticipants"
                    rules={[{ required: true, message: '모집 인원을 입력해 주십시오.' }]}
                    tooltip="모집 인원은 심사 후 변경이 어려울 수 있습니다."
                  >
                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="예) 10" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="시작 시각"
                    name="startTime"
                    rules={[{ required: true, message: '시작 시각을 선택해 주십시오.' }]}
                    tooltip="일정 정보 또한 변경이 제한될 수 있습니다."
                  >
                    <DatePicker showTime style={{ width: '100%' }} placeholder="시작 일시 선택" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="종료 시각"
                    name="endTime"
                    rules={[
                      { required: true, message: '종료 시각을 선택해 주십시오.' },
                      { validator: validateEndAfterStart },
                    ]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} placeholder="종료 일시 선택" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 상세 내용 이미지 업로드 섹션 (기존 UI 그대로) */}
            <Card
              className="detail-images-card"
              title="상세 내용 이미지 (선택)"
              extra={<Text type="secondary">권장 1200×800px · 최대 10장</Text>}
            >
              <Form.Item
                name="detailImages"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                tooltip="이미지 순서는 업로드 순서대로 저장됩니다."
              >
                <Dragger
                  multiple
                  accept="image/*"
                  beforeUpload={() => false}
                  onChange={onChangeDetailImages}
                  fileList={detailFiles}
                  listType="picture"
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">클릭하거나 이미지를 이곳에 드래그하여 업로드해 주십시오.</p>
                  <p className="ant-upload-hint">최대 10장 · 이미지 파일만 가능</p>
                </Dragger>
              </Form.Item>

              {detailFiles?.length > 0 && (
                <Paragraph className="detail-upload-note" type="secondary">
                  업로드된 파일: {detailFiles.length}개 (순서: 위 → 아래)
                </Paragraph>
              )}
            </Card>

            {/* 동의 영역 */}
            <Card className="agreement-card" bodyStyle={{ padding: 16 }}>
              <div className="agreement-head">
                <Text strong>제출 전 필수 확인</Text>
                <Button size="small" type="text" onClick={() => setShowAgreement(true)}>
                  전체 동의문 보기
                </Button>
              </div>
              <Paragraph className="agreement-brief" type="secondary">
                제출 후에는 <Text strong>수정/삭제가 어렵습니다.</Text> 모든 내용을 충분히 검토하셨는지 확인해 주십시오.
              </Paragraph>
              <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                위 안내를 이해하였으며 신중히 작성하였음을 <Text strong>동의</Text>합니다.
              </Checkbox>
            </Card>

            {/* 숨김/기본값 필드 (DB 제약 충족용) */}
            <Form.Item name="imagePath" hidden><Input /></Form.Item>
            <Form.Item name="currentPeople" hidden><InputNumber /></Form.Item>

            <Divider />

            <Form.Item>
              <div className="form-actions">
                <Button onClick={() => navigate(-1)}>취소</Button>
                <Tooltip title={submitTooltip}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!agree || submitting}
                    loading={submitting}
                  >
                    봉사 생성 (관리자 승인 후 공개)
                  </Button>
                </Tooltip>
              </div>
            </Form.Item>
          </Form>
        </Card>

        {/* 동의 전문 모달 */}
        <Modal
          title="봉사 생성 동의 안내"
          open={showAgreement}
          onOk={() => setShowAgreement(false)}
          onCancel={() => setShowAgreement(false)}
          okText="확인"
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <Alert
            type="warning"
            showIcon
            message="수정/삭제 제한 안내"
            style={{ marginBottom: 12 }}
          />
          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
            {AGREEMENT_TEXT}
          </Paragraph>
        </Modal>
      </div>
    </Layout>
  );
}
