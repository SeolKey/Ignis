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

    // React 전용 API
    @GetMapping("/react/list")
    public List<Post> getPostListForReact() {
        return postBO.getPostList();
    }

    @GetMapping("/react/detail/{id}")
    public Post getPostDetailForReact(@PathVariable("id") int postId) {
        return postBO.getPostById(postId);
    }

    @PostMapping("/react/create")
    public Map<String, Object> createPostForReact(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            result.put("code", 401);
            result.put("error", "로그인 필요");
            return result;
        }

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setUserId(userId.intValue());

        postBO.createPost(post);
        result.put("result", "성공");
        return result;
    }

    @PostMapping("/react/edit/{id}")
    public Map<String, Object> updatePostForReact(
            @PathVariable("id") int postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content) {

        Map<String, Object> result = new HashMap<>();
        Post post = new Post();
        post.setPostId(postId);
        post.setTitle(title);
        post.setContent(content);

        postBO.updatePost(post);
        result.put("result", "성공");
        return result;
    }

}
