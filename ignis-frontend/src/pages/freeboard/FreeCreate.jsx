import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../styles/Board.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const MAX_SIZE_MB = 5;

const FreeCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);

  const beforeUpload = (file) => {
    const isImage =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/webp' ||
      file.type === 'image/gif';
    if (!isImage) {
      message.error('이미지 파일만 업로드할 수 있어요 (jpg, png, webp, gif).');
      return Upload.LIST_IGNORE;
    }
    const isLt = file.size / 1024 / 1024 < MAX_SIZE_MB;
    if (!isLt) {
      message.error(`파일이 너무 커요. ${MAX_SIZE_MB}MB 이하만 가능해요.`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const onChangeUpload = ({ fileList: newList }) => {
    setFileList(newList.slice(-1)); // 최신 1장만 유지 (원하면 여러 장으로 바꿀 수 있음)
  };

  const onFinish = async (values) => {
    try {
      const fd = new FormData();
      fd.append('title', values.title);
      fd.append('content', values.content);
      if (fileList[0]?.originFileObj) {
        // 백엔드 @RequestParam("file") MultipartFile file
        fd.append('file', fileList[0].originFileObj);
      }

      const res = await fetch('/post/react/create', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });

      // 디버깅
      console.log('[create] status=', res.status, 'redirected=', res.redirected);
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        const preview = await res.clone().text().catch(() => '');
        console.warn('[create] non-OK body:', preview.slice(0, 200));
        message.error(`등록 실패(${res.status})`);
        return;
      }

      if (!ct.includes('application/json')) {
        const preview = await res.clone().text().catch(() => '');
        console.warn('[create] non-JSON body:', preview.slice(0, 200));
        message.error('JSON이 아닌 응답(리다이렉트/로그인 만료 가능)');
        return;
      }

      const data = await res.json().catch((e) => {
        console.error('[create] JSON parse error:', e);
        return null;
      });
      console.log('[create] json=', data);

      const ok =
        data &&
        (data.result === '성공' ||
          data.success === true ||
          data.status === 'ok' ||
          !!data.postId ||
          !!data.id);

      if (ok) {
        message.success('등록 완료');
        navigate('/board/free', { replace: true });
      } else {
        const hint = data?.error || data?.message || JSON.stringify(data);
        message.error(`등록 실패. ${hint ? `사유: ${String(hint).slice(0, 120)}` : '사유 불명'}`);
      }
    } catch (err) {
      console.error('[create] fetch error:', err);
      message.error('서버 오류로 등록 실패');
    }
  };

  return (
    <Layout>
      <div className="board-wrap">
        <Card style={{ marginBottom: 12 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3} style={{ margin: 0 }}>새 글 작성</Title>
            <Button onClick={() => navigate('/board/free')}>목록</Button>
          </Space>
        </Card>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="title"
              label="제목"
              rules={[{ required: true, message: '제목을 입력해주세요' }]}
            >
              <Input placeholder="제목을 입력하세요" />
            </Form.Item>

            <Form.Item
              name="content"
              label="내용"
              rules={[{ required: true, message: '내용을 입력해주세요' }]}
            >
              <TextArea rows={10} placeholder="내용을 입력하세요" />
            </Form.Item>

            <Form.Item label="이미지(선택)">
              <Dragger
                accept="image/*"
                multiple={false}
                beforeUpload={beforeUpload}
                onChange={onChangeUpload}
                fileList={fileList}
                maxCount={1}
                listType="picture"
                showUploadList={{ showPreviewIcon: false }}
                customRequest={({ onSuccess }) => {
                  // 드래거 기본 업로드 막고 form submit에서 같이 보냄
                  setTimeout(() => onSuccess && onSuccess('ok'), 0);
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">이미지를 드래그하거나 클릭해서 업로드</p>
                <p className="ant-upload-hint">최대 {MAX_SIZE_MB}MB, 1장</p>
              </Dragger>
            </Form.Item>

            <Space>
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Button type="primary" htmlType="submit">등록</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default FreeCreate;
