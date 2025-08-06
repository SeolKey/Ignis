package com.Ignis.comment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.Ignis.comment.bo.CommentBO;
import com.Ignis.comment.domain.Comment;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentRestController {

    private final CommentBO commentBO;

    // 댓글 작성
    @PostMapping("/create")
    public Map<String, Object> createComment(@RequestBody Comment comment, HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            result.put("code", 401);
            result.put("errorMessage", "로그인이 필요합니다.");
            return result;
        }

        comment.setUserId(userId);

        int rowCount = commentBO.addComment(comment);
        if (rowCount > 0) {
            result.put("result", "success");
        } else {
            result.put("code", 500);
            result.put("errorMessage", "댓글 작성 실패");
        }

        return result;
    }

    // 댓글 목록 조회
    @GetMapping("/list")
    public List<Comment> getCommentList(@RequestParam("contentType") String contentType,
                                        @RequestParam("contentId") Long contentId) {
        return commentBO.getCommentList(contentType, contentId);
    }

    // 대댓글 목록 조회
    @GetMapping("/replies")
    public List<Comment> getReplyList(@RequestParam("parentId") Long parentId) {
        return commentBO.getReplyList(parentId);
    }

    // 댓글 삭제
    @DeleteMapping("/delete")
    public Map<String, Object> deleteComment(@RequestParam("commentId") Long commentId,
                                             HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            result.put("code", 401);
            result.put("errorMessage", "로그인이 필요합니다.");
            return result;
        }

        // 실제로는 댓글의 작성자와 userId가 일치하는지 체크하는 게 더 안전함

        int rowCount = commentBO.deleteComment(commentId);
        if (rowCount > 0) {
            result.put("result", "success");
        } else {
            result.put("code", 500);
            result.put("errorMessage", "댓글 삭제 실패");
        }

        return result;
    }
}
