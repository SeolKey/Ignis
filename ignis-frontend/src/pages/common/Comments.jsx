// src/pages/common/Comments.jsx
import React, { useEffect, useState, useCallback} from 'react';
import { Card, List, Input, Button, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Comment as AntdComment } from '@ant-design/compatible';
import '../../styles/common/comments.css';

const { TextArea } = Input;

/**
 * 범용 댓글 컴포넌트
 * @param {"donation"|"funding"|"volunteer"} contentType
 * @param {number|string} contentId
 * @param {boolean} [lazy=false]  // true면 mount 시엔 안 불러오고 외부에서 onOpen 시 load
 * @param {boolean} [autoFocus=false]
 */
export default function Comments({ contentType, contentId, lazy = false, autoFocus = false }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);      // 상위 댓글 목록
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');            // 상위 댓글 입력
  const [replyOpenMap, setReplyOpenMap] = useState({}); // { [commentId]: boolean }
  const [replyDraftMap, setReplyDraftMap] = useState({}); // { [commentId]: string }
  const [repliesMap, setRepliesMap] = useState({});  // { [commentId]: array }
  const [repliesLoading, setRepliesLoading] = useState({}); // { [commentId]: boolean }

  const fmtDateTime = (iso) => (iso ? iso.replace('T', ' ').substring(0, 16) : '');

  // ===== 상위 댓글 목록 로드 =====
  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/comment/list?contentType=${contentType}&contentId=${contentId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 401) {
        // 비로그인도 목록은 보이게 유지(HTML 테스트와 동일한 UX)
        message.warning('댓글 목록을 불러오지 못했어. (로그인이 필요할 수도 있어)');
        setComments([]);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      message.error('댓글을 불러오는 중 문제가 생겼어.');
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId]);

  // ===== 대댓글 로드 (특정 부모) =====
  const loadReplies = useCallback(async (parentId) => {
    if (!parentId) return;
    try {
      setRepliesLoading((m) => ({ ...m, [parentId]: true }));
      const res = await fetch(`/comment/replies?parentId=${parentId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRepliesMap((m) => ({ ...m, [parentId]: Array.isArray(data) ? data : [] }));
    } catch {
      message.error('대댓글을 불러오지 못했어.');
    } finally {
      setRepliesLoading((m) => ({ ...m, [parentId]: false }));
    }
  }, []);

  // ===== 상위 댓글 등록 =====
  const submitComment = useCallback(async () => {
    const content = draft.trim();
    if (!content) return message.warning('댓글 내용을 입력해줘.');
    try {
      setLoading(true);
      const res = await fetch('/comment/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          content,
          parentId: null, // 상위 댓글
        }),
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능해.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result?.result === 'success') {
        setDraft('');
        message.success('댓글 등록 완료!');
        await loadComments();
      } else {
        message.error(result?.errorMessage || '댓글 등록에 실패했어.');
      }
    } catch {
      message.error('댓글 등록 중 오류가 발생했어.');
    } finally {
      setLoading(false);
    }
  }, [draft, contentType, contentId, navigate, loadComments]);

  // ===== 대댓글 등록 =====
  const submitReply = useCallback(async (parentId) => {
    const content = (replyDraftMap[parentId] || '').trim();
    if (!content) return message.warning('답글 내용을 입력해줘.');
    try {
      setRepliesLoading((m) => ({ ...m, [parentId]: true }));
      const res = await fetch('/comment/reply', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          content,
          parentId, // 대댓글
        }),
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능해.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result?.result === 'success') {
        setReplyDraftMap((m) => ({ ...m, [parentId]: '' }));
        message.success('답글 등록 완료!');
        // 최신 상태 반영: 해당 parent의 대댓글만 새로 고침
        await loadReplies(parentId);
      } else {
        message.error(result?.errorMessage || '대댓글 등록에 실패했어.');
      }
    } catch {
      message.error('대댓글 등록 중 오류가 발생했어.');
    } finally {
      setRepliesLoading((m) => ({ ...m, [parentId]: false }));
    }
  }, [replyDraftMap, contentId, contentType, navigate, loadReplies]);

  // ===== 답글 토글 =====
  const toggleReply = useCallback((parentId) => {
    setReplyOpenMap((m) => {
      const next = !m[parentId];
      // 펼칠 때만 해당 parent의 대댓글 로드
      if (next && !repliesMap[parentId]) {
        loadReplies(parentId);
      }
      return { ...m, [parentId]: next };
    });
  }, [repliesMap, loadReplies]);

  useEffect(() => {
    if (!lazy) loadComments();
  }, [lazy, loadComments]);

  // ===== 렌더 =====
  return (
    <>
      <Card bordered={false} className="comment-editor-card">
        <div className="comment-editor">
          <TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="댓글을 입력하세요"
            autoFocus={autoFocus}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
          <div className="comment-actions">
            <Button type="primary" htmlType="button" onClick={submitComment} loading={loading}>
              발송
            </Button>
          </div>
        </div>
      </Card>

      <List
        loading={loading}
        locale={{ emptyText: '아직 댓글이 없습니다.' }}
        dataSource={comments}
        renderItem={(c) => {
          const parentId = c?.commentId;
          const replies = repliesMap[parentId] || [];
          const isOpen = !!replyOpenMap[parentId];
          const isRLoading = !!repliesLoading[parentId];

          return (
            <List.Item key={parentId}>
              <div className="comment-item-inner" style={{ width: '100%' }}>
                <AntdComment
                  author={<span className="comment-author">{c?.userName || '익명 사용자'}</span>}
                  content={<div className="comment-content">{c?.content}</div>}
                  datetime={<span className="comment-time">{fmtDateTime(c?.createdAt || '')}</span>}
                  actions={[
                    <Button
                      size="small"
                      type="default"
                      key="reply-toggle"
                      onClick={() => toggleReply(parentId)}
                    >
                      {isOpen ? '답글 닫기' : '답글 쓰기'}
                    </Button>,
                  ]}
                />

                {isOpen && (
                  <div className="reply-area" style={{ marginLeft: 40 }}>
                    {/* 대댓글 입력 */}
                    <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
                      <Input
                        placeholder="답글을 입력하세요"
                        value={replyDraftMap[parentId] || ''}
                        onChange={(e) =>
                          setReplyDraftMap((m) => ({ ...m, [parentId]: e.target.value }))
                        }
                        onPressEnter={() => submitReply(parentId)}
                      />
                      <Button
                        type="primary"
                        loading={isRLoading}
                        onClick={() => submitReply(parentId)}
                      >
                        등록
                      </Button>
                    </Space.Compact>

                    {/* 대댓글 목록 */}
                    <List
                      loading={isRLoading}
                      size="small"
                      dataSource={replies}
                      locale={{ emptyText: '아직 대댓글이 없습니다.' }}
                      renderItem={(r) => (
                        <List.Item key={r.commentId} className="reply-item">
                          <div className="reply-item-inner">
                            <div className="reply-author">{r?.userName || '익명 사용자'}</div>
                            <div className="reply-content">{r?.content}</div>
                            <div className="reply-time">{fmtDateTime(r?.createdAt || '')}</div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </div>
            </List.Item>
          );
        }}
      />
    </>
  );
}
