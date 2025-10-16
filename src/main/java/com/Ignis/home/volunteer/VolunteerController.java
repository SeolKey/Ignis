package com.Ignis.home.volunteer;

import java.util.List;

import jakarta.servlet.http.HttpSession; // ✅ 추가

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.Ignis.home.volunteer.bo.VolunteerBO;
import com.Ignis.home.volunteer.domain.Volunteer;

@Controller
@RequestMapping("/volunteer")
public class VolunteerController {

    @Autowired
    private VolunteerBO volunteerBO;

    @GetMapping("/volunteer-list-view")
    public String showVolunteerList(@RequestParam(name = "sort", defaultValue = "latest") String sort,
                                    @RequestParam(name = "limit", defaultValue = "1000") int limit,
                                    Model model) {
        List<Volunteer> volunteerList;
        if ("views".equalsIgnoreCase(sort)) {
            volunteerList = volunteerBO.getMostViewedVolunteerList(limit);
        } else {
            sort = "latest";
            volunteerList = volunteerBO.getVolunteerList();
        }
        model.addAttribute("volunteerList", volunteerList);
        model.addAttribute("sort", sort);
        return "volunteer/volunteerList";
    }

    @GetMapping("/volunteer-create-view")
    public String showCreatePage() {
        return "volunteer/volunteerCreate";
    }

    // ✅ 상세 페이지: 작성자 or 관리자만 참여자 목록 버튼 노출
    @GetMapping("/volunteer-detail-view")
    public String showVolunteerDetail(@RequestParam("volunteerId") Long volunteerId,
                                      Model model,
                                      HttpSession session) { // ✅ 세션 받기
        volunteerBO.increaseViewCount(volunteerId);
        Volunteer volunteer = volunteerBO.getVolunteerById(volunteerId);
        model.addAttribute("volunteer", volunteer);

        // ✅ 세션에서 로그인 사용자 식별
        Long me = (Long) session.getAttribute("userId");      // 너희 프로젝트에서 쓰는 키 이름에 맞춰주세요
        String role = (String) session.getAttribute("role");  // 없다면 null일 수 있음

        boolean isOwner = (me != null) && me.equals(volunteer.getUserId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);     // 프로젝트의 권한 문자열에 맞춰 변경 가능

        model.addAttribute("canViewParticipantList", isOwner || isAdmin); // ✅ 이게 있어야 버튼이 보임
        model.addAttribute("liked", volunteerBO.isLiked(volunteerId, me));
        model.addAttribute("likeCount", volunteerBO.likeCount(volunteerId));
        return "volunteer/volunteerDetail";
    }
}
