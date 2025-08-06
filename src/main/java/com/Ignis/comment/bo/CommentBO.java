package com.Ignis.comment.bo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.Ignis.comment.domain.Comment;
import com.Ignis.comment.mapper.CommentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentBO {

    private final CommentMapper commentMapper;

    // 댓글 작성
    public int addComment(Comment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return commentMapper.insertComment(comment);
    }

    // 특정 컨텐츠에 달린 댓글 목록 조회 (부모 댓글만)
    public List<Comment> getCommentList(String contentType, Long contentId) {
        return commentMapper.selectCommentList(contentType, contentId);
    }

    // 대댓글 목록 조회
    public List<Comment> getReplyList(Long parentId) {
        return commentMapper.selectReplyList(parentId);
    }

    // 댓글 단건 조회 (예: 수정 등)
    public Comment getCommentById(Long commentId) {
        return commentMapper.selectCommentById(commentId);
    }

    // 댓글 삭제
    public int deleteComment(Long commentId) {
        return commentMapper.deleteComment(commentId);
    }
}
