package com.Ignis.admin;

import com.Ignis.donation.bo.DonationBO;
import com.Ignis.donation.domain.Donation;
import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;
import com.Ignis.post.domain.Post;
import com.Ignis.post.bo.PostBO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PostBO postBO;
    private final DonationBO donationBO;

    @GetMapping("/main")
    public String adminMainPage() {
        return "admin/adminMain";  // 파일명에 맞게 수정!
    }

    // 회원 리스트 보기
    @GetMapping("/user-list-view")
    public String userListView(Model model) {
        List<UserEntity> userList = userRepository.findAll();
        model.addAttribute("userList", userList);
        return "admin/userList";
    }

    // 게시글 리스트 보기
    @GetMapping("/post-list-view")
    public String postListView(Model model) {
        List<Post> postList = postBO.getPostList();
        model.addAttribute("postList", postList);
        return "admin/postList";
    }

    // 게시글 상세 보기
    @GetMapping("/post-detail-view/{id}")
    public String postDetailView(@PathVariable int id, Model model) {
        Post post = postBO.getPostById(id);
        model.addAttribute("post", post);
        return "admin/postDetail";
    }

    @GetMapping("/donation-list-view")
    public String donationListView(Model model) {
        List<Donation> donationList = donationBO.getDonationList();
        model.addAttribute("donationList", donationList);
        return "admin/adminDonationList";
    }

    @GetMapping("/donation-detail-view/{id}")
    public String donationDetailView(@PathVariable("id") int id, Model model) {
        Donation donation = donationBO.getDonationById(id);
        model.addAttribute("donation", donation);
        return "admin/adminDonationDetail";
    }

}
