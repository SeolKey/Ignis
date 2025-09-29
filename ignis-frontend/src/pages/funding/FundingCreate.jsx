import React, { useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Upload,
  Typography,
  message,
  Tooltip,
  Alert,
  Checkbox,
  Modal,
  Divider,
} from "antd";
import { InboxOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/funding/FundingCreate.css";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const AGREEMENT_TEXT = `
본 ‘펀딩 생성’은 관리자 승인 후에만 공개됩니다. 제출 이후에는
심사 공정성과 기록 보존을 위해 ‘내용 수정/삭제가 제한’될 수 있습니다.
제목/상세, 목표 금액, 대표 이미지, 계좌 정보를 충분히 확인하신 뒤 제출해 주시기 바랍니다.
허위·과장 표시 및 저작권 침해 이미지는 반려 사유가 될 수 있습니다.
`;

const FundingCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 대표 이미지(단일)
  const [file, setFile] = useState(null);
  // 상세 이미지(다중)
  const [detailFiles, setDetailFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const handleFileChange = (info) => {
    const f = info?.fileList?.[0]?.originFileObj ?? null;
    setFile(f);
  };

  const handleDetailChange = ({ fileList }) => {
    // 이미지 파일만, 최대 10장 권장
    const sanitized = (fileList || [])
      .slice(0, 10)
      .filter((f) => {
        const ok = (f.type || "").startsWith("image/");
        if (!ok) message.warning("이미지 파일만 업로드할 수 있습니다.");
        return ok;
      })
      .map((f) => f.originFileObj || f);
    setDetailFiles(sanitized);
  };

  const onFinish = async (values) => {
    if (!file) {
      message.error("대표 이미지를 첨부해 주십시오.");
      return;
    }
    const mp = String(values.maxPrice ?? "").replace(/[^0-9]/g, "");
    if (!mp) {
      message.error("목표 금액을 숫자로 입력해 주십시오.");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title ?? "");
    formData.append("description", values.description ?? "");
    formData.append("maxPrice", mp);
    formData.append("accountNumber", values.accountNumber ?? "");
    formData.append("file", file); // 대표 이미지

    // 상세 이미지(여러 장) — Donation과 동일한 키로 전송
    detailFiles.forEach((df, idx) => {
      if (df) formData.append(`detailFiles[${idx}]`, df, df.name || `detail_${idx}.jpg`);
    });

    try {
      setSubmitting(true);
      const res = await fetch("/funding/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      let json = {};
      try {
        json = await res.json();
      } catch {
        // JSON 없이 200 OK일 수 있음
      }

      if (res.status === 401) {
        message.warning("로그인 후 이용해 주십시오.");
        navigate("/login");
        return;
      }

      if (res.ok && (json?.result === "success" || Object.keys(json).length === 0)) {
        message.success("펀딩 등록이 완료되었습니다! (관리자 승인 후 공개됩니다)");
        navigate("/funding");
      } else {
        message.error(json?.error || `등록 실패 (HTTP ${res.status})`);
      }
    } catch (err) {
      console.error("업로드 실패:", err);
      message.error("펀딩 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTooltip = useMemo(() => {
    if (!agree) return "제출 전 동의가 필요합니다.";
    if (!file) return "대표 이미지를 첨부해 주십시오.";
    return "관리자 승인 후 공개됩니다.";
  }, [agree, file]);

  return (
    <Layout>
      <div className="funding-create">
        {/* 상단 승인 안내 배너 */}
        <div className="funding-create-banner">
          <Alert
            type="info"
            showIcon
            message={
              <div className="funding-banner-row">
                <span>
                  펀딩은 <b>관리자 승인</b>을 거쳐 공개됩니다.
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    승인 완료 전까지는 비공개 상태입니다.
                  </Text>
                </span>
                <Tooltip title="심사 기준: 사실성·공익성·저작권 준수·계좌 표기 적정성">
                  <InfoCircleOutlined className="funding-banner-help" />
                </Tooltip>
              </div>
            }
          />
        </div>

        <Card className="funding-create-card modern" bordered>
          <div className="funding-form-header">
            <Title level={3} style={{ margin: 0 }}>
              새 펀딩 등록
            </Title>
            <Tooltip title="제출 이후에는 수정/삭제가 어려우므로 반드시 신중히 작성해 주십시오.">
              <ExclamationCircleOutlined className="funding-header-tip" />
            </Tooltip>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="제목"
              name="title"
              rules={[{ required: true, message: "제목을 입력해 주십시오." }]}
            >
              <Input placeholder="예: 지역 아동센터 악기 지원 펀딩" />
            </Form.Item>

            <Form.Item
              label="설명"
              name="description"
              rules={[{ required: true, message: "설명을 입력해 주십시오." }]}
              extra="목적·대상·리워드(있다면)와 사용계획을 명확히 작성해 주시면 승인에 유리합니다."
            >
              <Input.TextArea rows={8} placeholder="펀딩 내용을 자세히 작성해 주십시오." />
            </Form.Item>

            <Card className="funding-sub-card" title="펀딩 정보">
              <Form.Item
                label="계좌번호"
                name="accountNumber"
                rules={[{ required: true, message: "계좌번호를 입력해 주십시오." }]}
                tooltip="계좌 정보는 심사 후 변경이 어렵습니다."
              >
                <Input placeholder="예: 123-456-789012" />
              </Form.Item>

              <Form.Item
                label="목표 금액"
                name="maxPrice"
                rules={[{ required: true, message: "목표 금액을 입력해 주십시오." }]}
                tooltip="목표 금액도 변경이 제한될 수 있으니 신중히 입력해 주십시오."
              >
                <Input inputMode="numeric" placeholder="숫자만 입력 (예: 1000000)" addonAfter="원" />
              </Form.Item>
            </Card>

            {/* 대표 이미지 */}
            <Form.Item
              label="대표 이미지 업로드"
              required
              tooltip="권장 1200×600px. 저작권 침해 이미지는 반려될 수 있습니다."
            >
              <Dragger
                beforeUpload={() => false}
                onChange={handleFileChange}
                maxCount={1}
                accept="image/*"
                multiple={false}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">클릭하거나 이미지를 이곳에 드래그하여 업로드해 주십시오.</p>
                <p className="ant-upload-hint">한 번에 1개 이미지만 업로드 가능합니다.</p>
                {file?.name && <p className="funding-upload-name">업로드된 파일: {file.name}</p>}
              </Dragger>
            </Form.Item>

            {/* 상세 이미지 (여러 장) */}
            <Card
              className="funding-detail-card"
              title="상세 내용 이미지 (선택)"
              extra={<Text type="secondary">권장 1200×800px · 최대 10장</Text>}
            >
              <Form.Item name="detailFiles" tooltip="이미지 순서는 업로드 순서대로 저장됩니다.">
                <Dragger
                  multiple
                  accept="image/*"
                  beforeUpload={() => false}
                  onChange={handleDetailChange}
                  listType="picture"
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">클릭하거나 이미지를 이곳에 드래그하여 업로드해 주십시오.</p>
                  <p className="ant-upload-hint">최대 10장 · 이미지 파일만 가능</p>
                </Dragger>
              </Form.Item>
              {detailFiles?.length > 0 && (
                <Paragraph type="secondary">업로드된 파일: {detailFiles.length}개 (순서: 위 → 아래)</Paragraph>
              )}
            </Card>

            {/* 동의영역 */}
            <Card className="funding-agreement-card" bodyStyle={{ padding: 16 }}>
              <div className="funding-agreement-head">
                <Text strong>제출 전 필수 확인</Text>
                <Button size="small" type="text" onClick={() => setShowAgreement(true)}>
                  전체 동의문 보기
                </Button>
              </div>
              <Paragraph className="funding-agreement-brief" type="secondary">
                제출 후에는 <Text strong>수정/삭제가 어렵습니다.</Text> 모든 내용을 충분히 검토하셨는지 확인해 주십시오.
              </Paragraph>
              <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                위 안내를 이해하였으며 신중히 작성하였음을 <Text strong>동의</Text>합니다.
              </Checkbox>
            </Card>

            <Divider />

            <div className="funding-form-actions">
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Tooltip title={submitTooltip}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!agree || !file || submitting}
                  loading={submitting}
                >
                  펀딩 생성 (관리자 승인 후 공개)
                </Button>
              </Tooltip>
            </div>
          </Form>
        </Card>

        {/* 동의 전문 모달 */}
        <Modal
          title="펀딩 생성 동의 안내"
          open={showAgreement}
          onOk={() => setShowAgreement(false)}
          onCancel={() => setShowAgreement(false)}
          okText="확인"
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Alert
            type="warning"
            showIcon
            message="수정/삭제 제한 안내"
            style={{ marginBottom: 12 }}
          />
          <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
            {AGREEMENT_TEXT}
          </Paragraph>
        </Modal>
      </div>
    </Layout>
  );
};

export default FundingCreate;
