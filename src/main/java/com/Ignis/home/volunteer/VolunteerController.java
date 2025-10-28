package com.Ignis.home.volunteer;

import java.util.List;
import jakarta.servlet.http.HttpSession;
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

    // ✅ 봉사 목록 페이지
    @GetMapping("/volunteer-list-view")
    public String showVolunteerList(
            @RequestParam(name = "sort", defaultValue = "latest") String sort,
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

    // ✅ 봉사 등록 페이지
    @GetMapping("/volunteer-create-view")
    public String showCreatePage() {
        return "volunteer/volunteerCreate";
    }

    // ✅ 상세 페이지: 작성자 또는 관리자만 참여자 목록 버튼 노출
    @GetMapping("/volunteer-detail-view")
    public String showVolunteerDetail(
            @RequestParam("volunteerId") Long volunteerId,
            Model model,
            HttpSession session) {

        // 조회수 증가
        volunteerBO.increaseViewCount(volunteerId);

        // 봉사 데이터 조회
        Volunteer volunteer = volunteerBO.getVolunteerById(volunteerId);
        model.addAttribute("volunteer", volunteer);

        // 로그인 정보 확인
        Long me = (Long) session.getAttribute("userId"); // 세션의 키 이름은 프로젝트에 맞게 수정
        String role = (String) session.getAttribute("role");

        boolean isOwner = (me != null) && me.equals(volunteer.getUserId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);

        // 작성자 또는 관리자만 참여자 목록 버튼 보이기
        model.addAttribute("canViewParticipantList", isOwner || isAdmin);

        // 좋아요 상태 및 개수
        model.addAttribute("liked", volunteerBO.isLiked(volunteerId, me));
        model.addAttribute("likeCount", volunteerBO.likeCount(volunteerId));

        return "volunteer/volunteerDetail";
    }
}
