import React, { useMemo, useState } from 'react';
import {
  Form, Input, Button, Card, Space, Upload, Typography,
  DatePicker, Row, Col, message, Tooltip, Alert, Checkbox, Modal, Divider
} from 'antd';
import {
  InboxOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import "../../styles/donation/DonationCreate.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const AGREEMENT_TEXT = `
본 ‘기부 프로젝트 생성’은 관리자 승인 후에만 공개됩니다. 제출 이후에는
승인 심사 과정의 일관성과 기록 보존을 위해 ‘내용 수정/삭제가 제한’될 수 있습니다.
따라서 모든 텍스트(제목/상세/계좌), 이미지, 목표금액을 충분히 검토한 뒤 제출해 주세요.
허위·과장 기재 및 저작권 침해 이미지 사용 시 반려/삭제될 수 있습니다.
`;

const DonationCreate = () => {
  const [form] = Form.useForm();
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [goalAmount, setGoalAmount] = useState('');
  const [agree, setAgree] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const navigate = useNavigate();

  // 숫자만 허용하고 천 단위로 쉼표 추가
  const handleChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setGoalAmount(value);
  };

  const handleImageChange = (info) => {
    const file = info?.file?.originFileObj || info?.file;
    if (!file || !(file instanceof File)) {
      console.warn('⚠️ 이미지 파일이 없습니다.', info);
      return;
    }
    setImageName(file.name);
    setImageFile(file);
  };

  const handleSubmit = async (values) => {
    const mp = parseInt(String(goalAmount).replace(/,/g, ''), 10) || 0;

    const accountInfo = [
      values.bankName ? `[${values.bankName}]` : '',
      values.accountNumber || '',
      values.accountHolder ? `(${values.accountHolder})` : ''
    ].filter(Boolean).join(' ').trim();

    const formData = new FormData();
    formData.append('title', values.title || '');
    formData.append('description', values.description || '');
    formData.append('accountInfo', accountInfo);
    formData.append('maxPrice', String(mp));
    formData.append('currentPrice', '0');
    formData.append('rejectReason', '');
    if (imageFile) formData.append('file', imageFile);

    try {
      const res = await fetch('/donation/react/create', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (res.status === 401) {
        message.warning('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      if (res.ok) {
        try { await res.json(); } catch { /* noop: 일부 서버 JSON 미응답 대비 */ }
        message.success('기부 프로젝트 등록 완료! (관리자 승인 후 공개됩니다)');
        navigate('/');
        return;
      }

      if (res.status === 500) {
        message.success('등록은 완료된 것으로 보여요. (서버 응답 오류) 홈으로 이동합니다.');
        navigate('/');
        return;
      }

      message.error(`등록 실패 (HTTP ${res.status}) 홈으로 이동합니다.`);
      navigate('/');
    } catch (err) {
      console.error('업로드 실패:', err);
      message.error('기부 프로젝트 등록 실패! 홈으로 이동합니다.');
      navigate('/');
    }
  };

  // 버튼 비활성 시 안내 문구
  const submitTooltip = useMemo(() => {
    if (!agree) return '제출 전 동의 체크가 필요합니다.';
    return '관리자 승인 후 공개됩니다.';
  }, [agree]);

  return (
    <Layout>
      <div className="donation-content-create">
        {/* 상단 안내 배너 */}
        <div className="create-banner">
          <Alert
            type="info"
            showIcon
            message={
              <div className="banner-row">
                <span>
                  관리자 승인형 기부 생성입니다.
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    승인 완료 전까지는 비공개 상태예요.
                  </Text>
                </span>
                <Tooltip title="심사 기준 요약: 사실성, 공익성, 저작권 준수, 계좌 표기 적정성">
                  <InfoCircleOutlined className="banner-help" />
                </Tooltip>
              </div>
            }
          />
        </div>

        <Card className="form-card modern">
          <div className="form-header">
            <Title level={3} style={{ margin: 0 }}>
              새 기부 프로젝트 등록
            </Title>
            <Tooltip title="수정/삭제가 어려우니 신중히 작성해 주세요. 제출 전 반드시 동의 체크!">
              <ExclamationCircleOutlined className="header-tip" />
            </Tooltip>
          </div>

          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="title"
              label="프로젝트 제목"
              rules={[{ required: true, message: '제목을 입력하세요' }]}
            >
              <Input placeholder="예: 지역 아동센터 교육 지원 프로젝트" />
            </Form.Item>

            <Form.Item
              name="description"
              label="프로젝트 상세 내용"
              rules={[{ required: true, message: '내용을 입력하세요' }]}
              extra="목적/대상/사용계획을 명확히 작성하면 승인에 도움이 됩니다."
            >
              <TextArea rows={8} placeholder="프로젝트 소개를 자세히 작성해 주세요" />
            </Form.Item>

            <Card className="sub-card" title="기부 정보">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="goalAmount"
                    label="목표 금액"
                    rules={[{ required: true, message: '목표 금액을 입력하세요' }]}
                    tooltip="심사 후 변경이 어려워요. 신중히 입력!"
                  >
                    <Input
                      addonAfter="원"
                      value={goalAmount}
                      onChange={handleChange}
                      placeholder="예: 1,000,000"
                      inputMode="numeric"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="period"
                    label="기부 기간"
                    rules={[{ required: true, message: '기간을 선택하세요' }]}
                    tooltip="기간 역시 변경이 제한될 수 있어요."
                  >
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                {/* 계좌 정보 */}
                <Col xs={24} md={8}>
                  <Form.Item
                    name="bankName"
                    label="은행명"
                    rules={[{ required: true, message: '은행명을 입력하세요' }]}
                  >
                    <Input placeholder="예: 국민은행" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="accountNumber"
                    label="계좌번호"
                    rules={[{ required: true, message: '계좌번호를 입력하세요' }]}
                  >
                    <Input placeholder="예: 123-456-789" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="accountHolder"
                    label="예금주"
                    rules={[{ required: true, message: '예금주를 입력하세요' }]}
                  >
                    <Input placeholder="예: 홍길동" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item
              name="image"
              label="대표 이미지 업로드"
              rules={[{ required: true, message: '대표 이미지를 업로드하세요' }]}
              tooltip="권장 1200×600px. 저작권 침해 이미지 사용 금지"
            >
              <Dragger
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                accept="image/*"
                maxCount={1}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">대표 이미지 업로드 (권장: 1200×600px)</p>
                {imageName && (
                  <p className="upload-name">업로드된 파일: {imageName}</p>
                )}
              </Dragger>
            </Form.Item>

            {/* 동의 영역 */}
            <Card className="agreement-card" bodyStyle={{ padding: 16 }}>
              <div className="agreement-head">
                <Text strong>제출 전 필수 확인</Text>
                <Button size="small" type="text" onClick={() => setShowAgreement(true)}>
                  전체 동의문 보기
                </Button>
              </div>
              <Paragraph className="agreement-brief" type="secondary">
                제출 후에는 <Text strong>수정/삭제가 어렵습니다.</Text> 내용과 이미지를
                충분히 검토했는지 확인해 주세요.
              </Paragraph>
              <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                위 안내를 이해했으며 신중히 작성했음을 <Text strong>동의</Text>합니다.
              </Checkbox>
            </Card>

            <Divider />

            <Space className="form-actions" style={{ marginTop: 8, width: '100%', justifyContent: 'space-between' }}>
              <Button htmlType="reset">초기화</Button>
              <Tooltip title={submitTooltip}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!agree}
                >
                  기부 생성 (관리자 승인 후 공개)
                </Button>
              </Tooltip>
            </Space>
          </Form>
        </Card>

        {/* 동의 전문 모달 */}
        <Modal
          title="기부 생성 동의 안내"
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
};

export default DonationCreate;
