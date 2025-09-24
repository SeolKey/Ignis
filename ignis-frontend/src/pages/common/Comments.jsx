import React, { useEffect, useState, useCallback } from 'react';
import { Card, List, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');

  const fmtDateTime = (iso) => (iso ? iso.replace('T', ' ').substring(0, 16) : '');

  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/comment/list?contentType=${contentType}&contentId=${contentId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 401) {
        // 목록(GET)은 비로그인도 보게 하거나, 최소한 튕기지 않게 처리
        message.warning('댓글 목록을 불러오지 못했어요. (로그인이 필요할 수 있어요)');
        setComments([]); // 비워두고 화면은 유지
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      message.error('댓글을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId, navigate]);

  const submitComment = async () => {
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
          parentId: null,
        }),
      });
      if (res.status === 401) {
        message.warning('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result?.result === 'success') {
        setDraft('');
        message.success('댓글이 등록되었습니다.');
        await loadComments();
      } else {
        message.error(result?.errorMessage || '댓글 등록에 실패했습니다.');
      }
    } catch {
      message.error('댓글 등록 중 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lazy) loadComments();
  }, [lazy, loadComments]);

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
        renderItem={(c) => (
          <List.Item>
            <div className="comment-item-inner">
              <div className="comment-author">{c?.userName || '익명 사용자'}</div>
              <div className="comment-content">{c?.content}</div>
              <div className="comment-time">{fmtDateTime(c?.createdAt || '')}</div>
            </div>
          </List.Item>
        )}
      />
    </>
  );
}
