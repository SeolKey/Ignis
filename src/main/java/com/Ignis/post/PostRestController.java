package com.Ignis.post;

import com.Ignis.post.bo.PostBO;
import com.Ignis.post.domain.Post;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

        if(userIdLong == null) {
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
}



