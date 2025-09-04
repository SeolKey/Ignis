import React, { useState } from "react";
import { Form, Input, Button, Card, Upload, Typography, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/funding/FundingCreate.css";

const { Title } = Typography;
const { Dragger } = Upload;

const FundingCreate = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (info) => {
        // 최신 항목 1개만 보관
        const f = info?.fileList?.[0]?.originFileObj ?? null;
        setFile(f);
    };

    const onFinish = async (values) => {
        // 이미지 필수 가드
        if (!file) {
            message.error("이미지를 첨부해줘.");
            return;
        }

        // 숫자 정규화
        const mp = String(values.maxPrice ?? "").replace(/[^0-9]/g, "");
        if (!mp) {
            message.error("목표 금액을 입력해줘.");
            return;
        }

        const formData = new FormData();
        formData.append("title", values.title ?? "");
        formData.append("description", values.description ?? "");
        formData.append("maxPrice", mp);
        formData.append("file", file);

        // 디버깅 로그
        console.log("[debug] to-send:", {
            title: values.title,
            description: values.description,
            maxPrice: mp,
            hasFile: !!file,
        });

        try {
            setSubmitting(true);
            const res = await fetch("/funding/create", {
                method: "POST",
                body: formData,
                credentials: "include", // 세션 쿠키 포함
            });

            let json = {};
            try {
                json = await res.json();
            } catch (err) {
                console.warn("⚠️ 응답 JSON 파싱 실패:", err);
            }

            console.log("[funding/create] status=", res.status, "json=", json);

            if (res.status === 401) {
                message.warning("로그인 후 이용 가능해.");
                navigate("/login");
                return;
            }

            if (res.ok && json?.result === "success") {
                message.success("펀딩 등록 완료!");
                navigate("/funding");
            } else {
                message.error(json?.error || `등록 실패 (HTTP ${res.status})`);
            }
        } catch (err) {
            console.error("업로드 실패:", err);
            message.error("펀딩 등록 중 오류가 발생했어.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="funding-create">
                <Card className="funding-create-card" bordered>
                    <Title level={3}>펀딩 생성</Title>

                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label="제목"
                            name="title"
                            rules={[{ required: true, message: "제목을 입력해줘." }]}
                        >
                            <Input placeholder="펀딩 제목을 입력하세요" />
                        </Form.Item>

                        <Form.Item
                            label="설명"
                            name="description"
                            rules={[{ required: true, message: "설명을 입력해줘." }]}
                        >
                            <Input.TextArea rows={4} placeholder="펀딩 설명을 입력하세요" />
                        </Form.Item>

                        <Form.Item
                            label="목표 금액"
                            name="maxPrice"
                            rules={[{ required: true, message: "목표 금액을 입력해줘." }]}
                        >
                            <Input inputMode="numeric" placeholder="숫자만 입력하세요" />
                        </Form.Item>

                        <Form.Item label="이미지 업로드" required>
                            <Dragger
                                beforeUpload={() => false} // 자동 업로드 막고, FormData로 함께 전송
                                onChange={handleFileChange}
                                maxCount={1}
                                accept="image/*"
                                multiple={false}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">클릭하거나 이미지를 이곳에 드래그하세요</p>
                                <p className="ant-upload-hint">한 번에 1개 이미지만 업로드할 수 있어요</p>
                            </Dragger>
                        </Form.Item>

                        <div className="form-actions">
                            <Button onClick={() => navigate(-1)}>취소</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={!file || submitting}
                                loading={submitting}
                            >
                                생성하기
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </Layout>
    );
};

export default FundingCreate;
