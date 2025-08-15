package com.Ignis.post;

import com.Ignis.post.bo.PostBO;
import com.Ignis.post.domain.Post;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostRestController {

    private final PostBO postBO;

    @PostMapping("/create")
    public Map<String, Object> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        Long userIdLong = (Long) session.getAttribute("userId");

        if (userIdLong == null) {
            result.put("code", "401");
            result.put("error", "로그인 필요");
            return result;
        }
        int userId = userIdLong.intValue();

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setUserId(userId);

        postBO.createPost(post);
        result.put("result", "성공");
        return result;
    }

    @PostMapping("/update")
    public Map<String, Object> updatePost(@RequestBody Post post) {
        Map<String, Object> result = new HashMap<>();
        postBO.updatePost(post);
        result.put("result", "성공");
        return result;
    }

    // ===== 여기부터 React 전용 =====

    // 목록: FreeList.jsx가 기대하는 { postList: [...] }
    @GetMapping("/react/list")
    public Map<String, Object> listForReact() {
        Map<String, Object> res = new HashMap<>();
        // 기존 BO에 있는 메서드로 사용
        List<Post> list = postBO.getPostList();
        res.put("postList", list);
        return res;
    }

    // 상세: FreeDetail.jsx / FreeEdit.jsx 로딩용
    @GetMapping("/react/detail/{id}")
    public Map<String, Object> detailForReact(@PathVariable("id") int postId) {
        Map<String, Object> res = new HashMap<>();
        Post post = postBO.getPostById(postId);
        res.put("post", post);
        return res;
    }

    // 생성: FreeCreate.jsx (x-www-form-urlencoded)
    @PostMapping(value = "/react/create", consumes = "application/x-www-form-urlencoded")
    public Map<String, Object> createForReact(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long userIdLong = (Long) session.getAttribute("userId");
            if (userIdLong == null) {
                res.put("result", "실패");
                res.put("error", "로그인이 필요합니다(user_id 누락).");
                return res;
            }
            int userId = userIdLong.intValue();

            Post p = new Post();
            p.setUserId(userId);
            p.setTitle(title);
            p.setContent(content);

            // createPost가 void 반환이라 try/catch로 성공/실패 판정
            postBO.createPost(p);

            res.put("result", "성공");
            // 생성된 키를 BO/Mapper에서 채운다면 같이 내려줄 수 있음
            // res.put("postId", p.getPostId());
        } catch (Exception e) {
            res.put("result", "실패");
            res.put("error", "DB 오류: " + e.getMessage());
        }
        return res;
    }

    // 수정: FreeEdit.jsx (x-www-form-urlencoded)
    @PostMapping(value = "/react/edit/{id}", consumes = "application/x-www-form-urlencoded")
    public Map<String, Object> editForReact(
            @PathVariable("id") int postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content) {
        Map<String, Object> res = new HashMap<>();
        try {
            Post p = new Post();
            p.setPostId(postId);
            p.setTitle(title);
            p.setContent(content);
            postBO.updatePost(p);
            res.put("result", "성공");
        } catch (Exception e) {
            res.put("result", "실패");
            res.put("error", "DB 오류: " + e.getMessage());
        }
        return res;
    }
    
}
