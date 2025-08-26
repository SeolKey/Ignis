package com.Ignis.home.volunteer;

import java.util.List;

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

    // 리스트 페이지
    @GetMapping("/volunteer-list-view")
    public String showVolunteerList(@RequestParam(name = "sort", defaultValue = "latest") String sort, @RequestParam(name = "limit", defaultValue = "1000") int limit, Model model) {
        List<Volunteer> volunteerList;
        if("views".equalsIgnoreCase(sort)){
            volunteerList = volunteerBO.getMostViewedVolunteerList(limit);
        } else {
            sort = "latest";
            volunteerList = volunteerBO.getVolunteerList();
        }
        model.addAttribute("volunteerList", volunteerList);
        model.addAttribute("sort", sort);
        return "volunteer/volunteerList";
    }


    // 작성 페이지
    @GetMapping("/volunteer-create-view")
    public String showCreatePage() {
        return "volunteer/volunteerCreate";
    }

    // 상세 페이지 (volunteerId를 쿼리파라미터로 받음)
    @GetMapping("/volunteer-detail-view")
    public String showVolunteerDetail(@RequestParam("volunteerId") Long volunteerId, Model model) {
        volunteerBO.increaseViewCount(volunteerId);
        Volunteer volunteer = volunteerBO.getVolunteerById(volunteerId);
        model.addAttribute("volunteer", volunteer);
        return "volunteer/volunteerDetail";
    }
}
