import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  Space,
  Steps,
  Result,
} from 'antd';
import { MailOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import '../styles/FindPasswordPage.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const FindPasswordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: 입력, 1: 완료 화면

  const onFinish = (values) => {
    console.log('비밀번호 찾기 요청 값:', values);

    // 👉 실제로는 여기서 API 호출해서 비밀번호 재설정 메일 발송
    // 지금은 보여주기용이니까 바로 완료 스텝으로 전환
    setStep(1);
  };

  return (
    <Layout>
      <div className="findpw-page">
        <div className="findpw-gradient-bg" />

        <div className="findpw-content">
          <Card className="findpw-card" bordered={false}>
            <div className="findpw-header">
              <Title level={3} style={{ marginBottom: 4 }}>
                비밀번호 찾기
              </Title>
              <Text type="secondary">
                가입하신 아이디와 이메일을 입력해 주세요.
              </Text>
            </div>

            <Steps
              current={step}
              size="small"
              className="findpw-steps"
              items={[
                { title: '정보 입력' },
                { title: '메일 발송 완료' },
              ]}
            />

            {step === 0 && (
              <>
                <div className="findpw-description">
                  <Paragraph type="secondary">
                    입력해 주신 정보와 일치하는 계정을 찾은 후,
                    <br />
                    비밀번호 재설정 링크를 이메일로 보내드립니다.
                  </Paragraph>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={onFinish}
                  className="findpw-form"
                >
                  <Form.Item
                    label="아이디"
                    name="userLoginId"
                    rules={[
                      { required: true, message: '아이디를 입력해 주세요.' },
                      { min: 3, message: '아이디는 3자 이상 입력해 주세요.' },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined />}
                      placeholder="가입하신 아이디"
                      allowClear
                    />
                  </Form.Item>

                  <Form.Item
                    label="이메일"
                    name="email"
                    rules={[
                      { required: true, message: '이메일을 입력해 주세요.' },
                      { type: 'email', message: '유효한 이메일 주소를 입력해 주세요.' },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined />}
                      placeholder="example@email.com"
                      allowClear
                    />
                  </Form.Item>

                  <Space
                    direction="vertical"
                    style={{ width: '100%', marginTop: 8 }}
                    size={12}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                    >
                      비밀번호 재설정 메일 보내기
                    </Button>

                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate('/')}
                      block
                    >
                      로그인 화면으로 돌아가기
                    </Button>
                  </Space>
                </Form>
              </>
            )}

            {step === 1 && (
              <div className="findpw-result-wrapper">
                <Result
                  status="success"
                  title="비밀번호 재설정 메일을 발송했습니다."
                  subTitle={
                    <>
                      <div>
                        입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.
                      </div>
                      <div>메일함(스팸함 포함)을 확인해 주세요.</div>
                    </>
                  }
                />
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    로그인 화면으로 이동
                  </Button>
                  <Button
                    type="default"
                    block
                    onClick={() => {
                      setStep(0);
                      form.resetFields();
                    }}
                  >
                    다시 입력하기
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FindPasswordPage;
