package com.Ignis.post;

import org.springframework.ui.Model;
import com.Ignis.post.bo.PostBO;
import com.Ignis.post.domain.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostController {

    private final PostBO postBO;

    @GetMapping("/post-list-view")
    public String postList(@RequestParam(name = "sort", defaultValue = "latest") String sort, Model model) {
        List<Post> postList = "views".equalsIgnoreCase(sort)
                ? postBO.getPostListByViews()
                : postBO.getPostList();

        model.addAttribute("postList", postList);
        model.addAttribute("sort", sort);
        return "post/postList";
    }

    @GetMapping("/post-create-view")
    public String postCreateView(Model model) {
        model.addAttribute("post", new Post());
        return "post/postCreate";
    }

    @GetMapping("/post-update-view/{id}")
    public String postUpdateView(Model model, @PathVariable("id") int id) {
        Post post = postBO.getPostById(id);
        model.addAttribute("post", post);
        return "post/postEdit";
    }

    @GetMapping("/post-detail-view/{id}")
    public String postDetailView(Model model, @PathVariable("id") int id) {
        postBO.increaseViewCount(id);
        Post post = postBO.getPostById(id);
        model.addAttribute("post", post);
        return "post/postDetail";
    }
}
