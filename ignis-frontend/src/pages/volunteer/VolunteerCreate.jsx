// src/pages/volunteer/VolunteerCreate.jsx
import React from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  DatePicker,
  InputNumber,
  message,
  Row, Col,
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/volunteer/VolunteerCreate.css';

const { Title } = Typography;
const { TextArea } = Input;

// DB image_path가 NOT NULL이라 기본 경로를 전송
const DEFAULT_IMAGE_PATH = '/images/default-volunteer.png';

// 날짜 포맷터 (백엔드가 yyyy-MM-dd HH:mm:ss로 받도록 해줘)
const fmt = (d) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm:ss') : '');

export default function VolunteerCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const validateEndAfterStart = (_, value) => {
    const start = form.getFieldValue('startTime');
    if (!start || !value) return Promise.resolve();
    return dayjs(value).isAfter(dayjs(start))
      ? Promise.resolve()
      : Promise.reject(new Error('종료 시각은 시작 시각 이후여야 해.'));
  };

  const onFinish = async (values) => {
    // 파일 없이 텍스트만 전송 → x-www-form-urlencoded 사용
    const params = new URLSearchParams();
    params.set('title', values.title ?? '');
    params.set('description', values.description ?? '');
    params.set('location', values.location ?? '');

    // DB는 datetime NOT NULL → 문자열로 전달
    params.set('startTime', fmt(values.startTime));
    params.set('endTime', fmt(values.endTime));

    // DB는 int NOT NULL
    params.set('maxParticipants', String(values.maxParticipants ?? ''));
    params.set('currentPeople', String(values.currentPeople ?? 0)); // 기본 0

    // DB는 image_path NOT NULL → placeholder 전달
    params.set('imagePath', values.imagePath ?? DEFAULT_IMAGE_PATH);

    try {
      const res = await fetch('/volunteer/react/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString(),
        credentials: 'include', // 세션 쿠키 포함
      });

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
      console.log('[volunteer/create] status=', res.status, 'data=', data);

      if (res.status === 401) {
        message.warning('로그인 후 이용 가능해.');
        navigate('/login');
        return;
      }
      if (!res.ok || data?.result === '실패' || data?.result === 'fail') {
        message.error(data?.error || `등록 실패 (HTTP ${res.status})`);
        return;
      }

      message.success('봉사 등록 완료');
      navigate('/volunteer');
    } catch (err) {
      console.error('봉사 등록 실패:', err);
      message.error('봉사 등록 중 오류가 발생했어.');
    }
  };

  return (
    <Layout>
      <div className="volunteer-create-page">
        <Title level={3}>봉사 생성</Title>
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              imagePath: DEFAULT_IMAGE_PATH, // hidden 필드
              currentPeople: 0,              // hidden 필드
            }}
          >
            <Form.Item
              label="제목"
              name="title"
              rules={[{ required: true, message: '제목을 입력하세요.' }]}
            >
              <Input placeholder="예) 독거 어르신 반찬 봉사 모집" />
            </Form.Item>

            <Form.Item
              label="설명"
              name="description"
              rules={[{ required: true, message: '설명을 입력하세요.' }]}
            >
              <TextArea rows={6} placeholder="봉사 내용, 세부 일정, 주의사항 등을 입력하세요." />
            </Form.Item>

            {/* DB NOT NULL: location */}
            <Card className="sub-card" title="봉사 정보">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="장소"
                    name="location"
                    rules={[{ required: true, message: '장소를 입력하세요.' }]}
                  >
                    <Input placeholder="예) 마포구청 자원봉사센터 3층" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="모집 인원"
                    name="maxParticipants"
                    rules={[{ required: true, message: '모집 인원을 입력하세요.' }]}
                  >
                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="예) 10" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="시작 시각"
                    name="startTime"
                    rules={[{ required: true, message: '시작 시각을 선택하세요.' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} placeholder="시작 일시 선택" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="종료 시각"
                    name="endTime"
                    rules={[
                      { required: true, message: '종료 시각을 선택하세요.' },
                      { validator: validateEndAfterStart },
                    ]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} placeholder="종료 일시 선택" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>


            {/* 숨김/기본값 필드들: DB 제약 충족용 */}
            <Form.Item name="imagePath" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="currentPeople" hidden>
              <InputNumber />
            </Form.Item>

            <Form.Item>
              <div className="form-actions">
                <Button type="primary" htmlType="submit">등록</Button>
                <Button onClick={() => navigate(-1)}>취소</Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
