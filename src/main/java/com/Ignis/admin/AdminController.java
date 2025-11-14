package com.Ignis.admin;

import java.util.List;

import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.volunteer.bo.VolunteerBO;
import com.Ignis.home.volunteer.domain.Volunteer;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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

    /** 🔥 공통: 관리자 권한 체크 */
    private boolean isAdmin(HttpSession session) {
        String role = (String) session.getAttribute("role");
        return role != null && role.equalsIgnoreCase("admin");
    }

    @GetMapping("/main")
    public String adminMainPage(HttpSession session) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        return "admin/adminMain";
    }

    @GetMapping("/user-list-view")
    public String userListView(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        List<UserEntity> userList = userRepository.findAll();
        model.addAttribute("userList", userList);
        return "admin/userList";
    }

    @GetMapping("/post-list-view")
    public String postListView(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        List<Post> postList = postBO.getPostList();
        model.addAttribute("postList", postList);
        return "admin/postList";
    }

    @GetMapping("/post-detail-view/{id}")
    public String postDetailView(@PathVariable int id, HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        Post post = postBO.getPostById(id);
        model.addAttribute("post", post);
        return "admin/postDetail";
    }

    @GetMapping("/donation-list-view")
    public String donationListView(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        List<Donation> donationList = donationBO.getPendingDonationList();
        model.addAttribute("donationList", donationList);
        return "admin/adminDonationList";
    }

    @GetMapping("/donation-detail-view/{id}")
    public String donationDetailView(@PathVariable("id") Long id, HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        Donation donation = donationBO.getDonationById(id);
        model.addAttribute("donation", donation);
        return "admin/adminDonationDetail";
    }

    @GetMapping("/funding-list-view")
    public String fundingListView(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        List<Funding> fundingList = fundingBO.getPendingFundingList();
        model.addAttribute("fundingList", fundingList);
        return "admin/adminFundingList";
    }

    @GetMapping("/funding-detail-view/{id}")
    public String fundingDetailView(@PathVariable("id") Long id, HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        Funding funding = fundingBO.getFundingById(id);
        model.addAttribute("funding", funding);
        return "admin/adminFundingDetail";
    }

    @GetMapping("/volunteer-list-view")
    public String volunteerListView(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        List<Volunteer> volunteerList = volunteerBO.getAllVolunteersForAdmin();
        model.addAttribute("volunteerList", volunteerList);
        return "admin/adminVolunteerList";
    }

    @GetMapping("/volunteer-detail-view/{id}")
    public String volunteerDetailView(@PathVariable("id") Long id, HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        Volunteer volunteer = volunteerBO.getVolunteerById(id);
        model.addAttribute("volunteer", volunteer);
        return "admin/adminVolunteerDetail";
    }

    @GetMapping("/emergency-manage")
    public String emergencyManage(HttpSession session, Model model) {
        if (!isAdmin(session)) return "redirect:/?error=not_admin";
        model.addAttribute("approvedDonations", donationBO.getDonationList());
        model.addAttribute("approvedFundings", fundingBO.getFundingList());
        model.addAttribute("approvedVolunteers", volunteerBO.getVolunteerList());
        return "admin/adminEmergencyManage";
    }
}
