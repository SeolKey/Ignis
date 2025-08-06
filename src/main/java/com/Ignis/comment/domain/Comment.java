package com.Ignis.comment.domain;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class Comment {
    private Long commentId;       // 댓글 ID (PK)
    private String contentType;   // 'post', 'donation', 'volunteer', 'funding'
    private Long contentId;       // 댓글이 달린 대상의 ID
    private Long userId;          // 작성자 ID
    private String content;       // 댓글 내용
    private Long parentId;        // 대댓글인 경우 부모 댓글 ID (null 가능)
    private LocalDateTime createdAt;  // 작성일
    private LocalDateTime updatedAt;  // 수정일 (null 가능)
    private String userName;
}
