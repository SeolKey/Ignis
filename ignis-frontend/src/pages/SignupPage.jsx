import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Space, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/SignupPage.css';

const { Title, Text } = Typography;

const SignupPage = () => {
  const [form] = Form.useForm();
  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailCodeField, setShowEmailCodeField] = useState(false);

  const [termsModal, setTermsModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const navigate = useNavigate();

    const handleCheckUsername = async () => {
        const username = form.getFieldValue("username");

        if (!username) {
            alert("아이디를 입력해주세요.");
            return;
        }

        try {
            const res = await fetch(`/user/check-login-id?loginId=${encodeURIComponent(username)}`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await res.json();

            if (data.available) {
                alert("사용 가능한 아이디입니다.");
            } else {
                alert(data.message || "이미 사용 중인 아이디입니다.");
            }
        } catch (err) {
            console.error(err);
            alert("중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 이메일 인증 요청
  const handleSendEmailCode = async () => {
    const email = form.getFieldValue('email');
    if (!email) return alert('이메일을 입력해주세요.');
    try {
      const res = await fetch('/user/email-auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });
      if (res.ok) {
        alert('인증코드가 이메일로 전송되었습니다. 3분 내에 입력해주세요.');
        setShowEmailCodeField(true);
      } else {
        alert('인증코드 전송 실패');
      }
    } catch (err) {
      console.error(err);
      alert('이메일 인증 요청 중 오류가 발생했습니다.');
    }
  };

  // 이메일 인증 확인
  const handleVerifyEmailCode = async () => {
    const email = form.getFieldValue('email');
    const code = form.getFieldValue('emailCode');
    if (!code) return alert('인증코드를 입력해주세요.');
    try {
      const res = await fetch('/user/email-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, code }),
      });
      const data = await res.json();
      if (data.result === '인증 성공') {
        setEmailVerified(true);
        alert('이메일 인증이 완료되었습니다.');
      } else {
        alert(data.error_message || '인증 실패');
      }
    } catch (err) {
      console.error(err);
      alert('이메일 인증 확인 중 오류가 발생했습니다.');
    }
  };

  // 회원가입 제출
  const onFinish = async (values) => {
    const { username, password, confirm, name, phone, email, agreeTerms, agreePrivacy, agreeMarketing } = values;

    if (!emailVerified) return alert('이메일 인증을 완료해주세요.');
    if (password !== confirm) return alert('비밀번호가 일치하지 않습니다.');
    if (!agreeTerms || !agreePrivacy) return alert('필수 약관에 동의해주세요.');

    try {
      const res = await fetch('/user/do-sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLoginId: username,
          password,
          name,
          phoneNumber: phone,
          email,
          agreeMarketing: !!agreeMarketing,
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn('응답이 JSON 형식이 아닙니다:', text, err);
      }

      if (data.result === '회원가입 성공') {
        alert('회원가입 성공!');
        navigate('/login', { replace: true }); // 뒤로가기 눌러도 제출 화면 안 돌아오게
      }
      else {
        alert(data.error_message || '회원가입 실패');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <Layout>
      <div className="signup-container">
        <div className="signup-box">
          <Title level={3}>회원가입</Title>
          <Text type="secondary">필수 정보를 입력하여 회원가입을 완료해 주세요.</Text>

          <Form layout="vertical" form={form} onFinish={onFinish} className="signup-form">
            {/* 아이디 */}
            <Form.Item label="아이디" name="username" rules={[{ required: true, message: '아이디를 입력해 주세요.' }]}>
              <div className="username-row">
                <Input placeholder="영문, 숫자 5~20자" />
                  <Button onClick={handleCheckUsername}>중복확인</Button>
              </div>
            </Form.Item>

            {/* 비밀번호 */}
            <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}>
              <Input.Password placeholder="영문, 숫자, 특수문자 조합 8~20자" />
            </Form.Item>

            {/* 비밀번호 확인 */}
            <Form.Item
              label="비밀번호 확인"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: '비밀번호를 다시 입력해 주세요.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="비밀번호를 다시 입력하세요" />
            </Form.Item>

            {/* 이름 */}
            <Form.Item label="이름" name="name" rules={[{ required: true, message: '이름을 입력해 주세요.' }]}>
              <Input placeholder="이름을 입력하세요" />
            </Form.Item>

            {/* 전화번호 */}
            <Form.Item label="전화번호" name="phone" rules={[{ required: true, message: '전화번호를 입력해 주세요.' }]}>
              <Input placeholder="'-' 없이 숫자만 입력하세요" />
            </Form.Item>

            {/* 이메일 */}
            <Form.Item label="이메일" name="email" rules={[{ required: true, type: 'email', message: '유효한 이메일 주소를 입력해 주세요.' }]}>
              <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="example@email.com" />
                <Button onClick={handleSendEmailCode}>인증요청</Button>
              </Space.Compact>
            </Form.Item>

            {/* 이메일 인증 코드 */}
            {showEmailCodeField && (
              <Form.Item label="인증 코드" name="emailCode">
                <Space.Compact style={{ width: '100%' }}>
                  <Input placeholder="인증코드를 입력하세요" />
                  <Button onClick={handleVerifyEmailCode}>인증확인</Button>
                </Space.Compact>
              </Form.Item>
            )}

            {/* 약관 동의 */}
            <Form.Item label="개인정보 및 약관 동의" style={{ marginTop: 24 }}>
              <Space direction="vertical">
                <Form.Item name="agreeTerms" valuePropName="checked" noStyle rules={[{ required: true, message: '서비스 이용 약관에 동의해주세요.' }]}>
                  <Checkbox>
                    <a onClick={() => setTermsModal(true)}>서비스 이용 약관 동의</a> (필수)
                  </Checkbox>
                </Form.Item>

                <Form.Item name="agreePrivacy" valuePropName="checked" noStyle rules={[{ required: true, message: '개인정보 수집 및 이용에 동의해주세요.' }]}>
                  <Checkbox>
                    <a onClick={() => setPrivacyModal(true)}>개인정보 수집 및 이용 동의</a> (필수)
                  </Checkbox>
                </Form.Item>

                <Form.Item name="agreeMarketing" valuePropName="checked" noStyle>
                  <Checkbox>마케팅 정보 수신 동의 (선택)</Checkbox>
                </Form.Item>
              </Space>
            </Form.Item>

            {/* 제출 버튼 */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                회원가입
              </Button>
            </Form.Item>
          </Form>

          {/* 약관 모달 */}
          {/* 서비스 이용 약관 모달 */}
          <Modal
            title="서비스 이용 약관"
            open={termsModal}
            onCancel={() => setTermsModal(false)}
            footer={<Button onClick={() => setTermsModal(false)}>닫기</Button>}
            width={600}
          >
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 8 }}>
              <p>본 서비스(이하 "서비스")를 이용함에 있어 회원과 서비스 제공자 간의 권리·의무 및 책임 사항을 규정합니다.</p>

              <h4>제1조 (목적)</h4>
              <p>이 약관은 회원이 서비스 이용과 관련하여 준수해야 할 사항과 서비스 제공자가 준수할 사항을 명확히 함으로써 원활한 서비스 이용을 목적으로 합니다.</p>

              <h4>제2조 (회원가입 및 계정)</h4>
              <p>
                1. 회원은 정확한 정보를 제공해야 하며, 허위 정보 제공 시 서비스 이용이 제한될 수 있습니다.<br />
                2. 계정 및 비밀번호 관리에 대한 책임은 회원에게 있습니다.<br />
                3. 계정 양도, 대여, 공유는 금지됩니다.
              </p>

              <h4>제3조 (서비스 제공)</h4>
              <p>
                1. 서비스는 회사가 정한 조건에 따라 제공됩니다.<br />
                2. 서비스 내용은 사전 공지 후 변경될 수 있습니다.
              </p>

              <h4>제4조 (회원의 의무)</h4>
              <p>
                1. 회원은 관련 법령 및 약관을 준수해야 합니다.<br />
                2. 타인의 권리를 침해하거나 서비스를 방해하는 행위를 해서는 안 됩니다.<br />
                3. 부정 이용 시 서비스 이용 제한 또는 계정 삭제가 가능합니다.
              </p>

              <h4>제5조 (서비스 이용 제한)</h4>
              <p>회원이 약관을 위반하거나 부정한 목적으로 이용할 경우, 서비스 제공자는 사전 통지 없이 계정 이용을 정지 또는 삭제할 수 있습니다.</p>

              <h4>제6조 (책임의 한계)</h4>
              <p>서비스 제공자는 천재지변, 시스템 장애, 회원 귀책사유로 발생한 손해에 대해 책임을 지지 않습니다.</p>

              <h4>제7조 (분쟁 해결)</h4>
              <p>서비스 이용과 관련한 분쟁 발생 시, 당사자 간 협의 후 해결하며, 협의 실패 시 관할 법원에서 해결합니다.</p>
            </div>
          </Modal>

          {/* 개인정보 수집 및 이용 동의 모달 */}
          <Modal
            title="개인정보 수집 및 이용 동의"
            open={privacyModal}
            onCancel={() => setPrivacyModal(false)}
            footer={<Button onClick={() => setPrivacyModal(false)}>닫기</Button>}
            width={600}
          >
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 8 }}>
              <p>회사는 회원가입 및 서비스 제공을 위해 최소한의 개인정보를 수집·이용합니다.</p>

              <h4>1. 수집하는 개인정보 항목</h4>
              <ul>
                <li>필수: 이름, 이메일, 비밀번호, 전화번호</li>
                <li>선택: 마케팅 정보 수신 여부</li>
              </ul>

              <h4>2. 개인정보 수집·이용 목적</h4>
              <ul>
                <li>회원 식별 및 본인 인증</li>
                <li>서비스 제공 및 문의 응대</li>
                <li>서비스 개선 및 맞춤형 콘텐츠 제공</li>
                <li>이벤트, 마케팅 정보 안내 (선택 동의 시)</li>
              </ul>

              <h4>3. 개인정보 보유·이용 기간</h4>
              <p>회원 탈퇴 시 지체 없이 삭제하며, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 안전하게 보관합니다.</p>

              <h4>4. 개인정보 제3자 제공</h4>
              <p>회원의 개인정보는 법령에 따른 경우를 제외하고 제3자에게 제공되지 않으며, 필요한 경우 사전에 동의를 받습니다.</p>

              <h4>5. 개인정보 처리 위탁</h4>
              <p>서비스 운영을 위해 일부 개인정보 처리 업무를 외부 업체에 위탁할 수 있으며, 위탁 시 관련 내용을 회원에게 안내합니다.</p>

              <p>회원은 위 내용을 충분히 숙지하고 개인정보 수집·이용에 동의합니다.</p>
            </div>
          </Modal>


          <div className="login-text">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
