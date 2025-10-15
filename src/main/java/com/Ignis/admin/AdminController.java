package com.Ignis.admin;

import java.util.List;

import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.volunteer.bo.VolunteerBO;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;
import com.Ignis.post.bo.PostBO;
import com.Ignis.post.domain.Post;
import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PostBO postBO;
    private final DonationBO donationBO;
    private final FundingBO fundingBO;
    private final VolunteerBO volunteerBO;

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
        List<Donation> donationList = donationBO.getPendingDonationList();
        model.addAttribute("donationList", donationList);
        return "admin/adminDonationList";
    }

    @GetMapping("/donation-detail-view/{id}")
    public String donationDetailView(@PathVariable("id") Long id, Model model) {
        Donation donation = donationBO.getDonationById(id);
        model.addAttribute("donation", donation);
        return "admin/adminDonationDetail";
    }

    @GetMapping("/funding-list-view")
    public String fundingListView(Model model) {
        List<Funding> fundingList = fundingBO.getPendingFundingList();
        model.addAttribute("fundingList", fundingList);
        return "admin/adminFundingList";
    }

    @GetMapping("/funding-detail-view/{id}")
    public String fundingDetailView(@PathVariable("id") Long id, Model model) {
        Funding funding = fundingBO.getFundingById(id);
        model.addAttribute("funding", funding);
        return "admin/adminFundingDetail";
    }

    @GetMapping("/emergency-manage")
    public String emergencyManage(Model model) {
        model.addAttribute("approvedDonations", donationBO.getDonationList());
        model.addAttribute("approvedFundings", fundingBO.getFundingList());
        model.addAttribute("approvedVolunteers", volunteerBO.getVolunteerList());
        return "admin/adminEmergencyManage";
    }
}
