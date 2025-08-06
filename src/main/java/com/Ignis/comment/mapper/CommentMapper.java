package com.Ignis.comment.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.Ignis.comment.domain.Comment;

@Mapper
public interface CommentMapper {

    int insertComment(Comment comment);

    // 특정 콘텐츠의 댓글 목록 조회
    List<Comment> selectCommentList(
        @Param("contentType") String contentType,
        @Param("contentId") Long contentId
    );

    // 대댓글 목록 조회
    List<Comment> selectReplyList(@Param("parentId") Long parentId);

    // 댓글 단건 조회
    Comment selectCommentById(@Param("commentId") Long commentId);

    // 댓글 삭제
    int deleteComment(@Param("commentId") Long commentId);
}
