package com.Ignis.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.volunteer.bo.VolunteerBO;
import com.Ignis.home.volunteer.domain.Volunteer;

@Controller
public class HomeController {

    @Autowired
    private DonationBO donationBO;

    @Autowired
    private VolunteerBO volunteerBO;

    @Autowired
    private FundingBO fundingBO;

    /** 기존 Thymeleaf 홈 페이지 (서버 렌더링) */
    @GetMapping("/")
    public String showHomePage(Model model, HttpSession session) {
        int limit = 4;
        List<Donation> donationList = donationBO.getMostViewedDonationList(limit);
        List<Volunteer> volunteerList = volunteerBO.getMostViewedVolunteerList(limit);
        List<Funding> fundingList = fundingBO.getMostViewedFundingList(limit);

        // 기본 데이터
        model.addAttribute("donationList", donationList);
        model.addAttribute("volunteerList", volunteerList);
        model.addAttribute("fundingList", fundingList);

        // 세션 정보 전달 (헤더에서 사용 가능)
        model.addAttribute("userName", session.getAttribute("userName"));
        model.addAttribute("role", session.getAttribute("role"));
        model.addAttribute("userId", session.getAttribute("userId"));

        return "home/home";
    }

    /** React용 JSON API (클라이언트에서 fetch('/api/home')) */
    @GetMapping("/api/home")
    @ResponseBody
    public Map<String, Object> getHomeData() {
        int limit = 4;

        List<Donation> donations = donationBO.getMostViewedDonationList(limit);
        List<Volunteer> volunteers = volunteerBO.getMostViewedVolunteerList(limit);
        List<Funding> fundings = fundingBO.getMostViewedFundingList(limit);

        List<Map<String, Object>> donationList = donations.stream()
                .map(d -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("donationId", d.getDonationId());
                    m.put("title", d.getTitle());
                    m.put("imagePath", d.getImagePath());
                    m.put("views", d.getViewCount());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> volunteerList = volunteers.stream()
                .map(v -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("volunteerId", v.getVolunteerId());
                    m.put("title", v.getTitle());
                    m.put("location", v.getLocation());
                    m.put("imagePath", v.getImagePath());
                    m.put("views", v.getViewCount());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> fundingList = fundings.stream()
                .map(f -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("fundingId", f.getFundingId());
                    m.put("title", f.getTitle());
                    m.put("imagePath", f.getImagePath());
                    m.put("maxPrice", f.getMaxPrice());
                    m.put("views", f.getViewCount());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("donationList", donationList);
        res.put("volunteerList", volunteerList);
        res.put("fundingList", fundingList);
        return res;
    }

    @GetMapping("/api/emergency/check")
    @ResponseBody
    public Map<String, Object> checkEmergency() {
        Map<String, Object> result = new HashMap<>();

        Donation emergencyDonation = donationBO.getEmergencyDonation();
        Funding emergencyFunding = fundingBO.getEmergencyFunding();
        Volunteer emergencyVolunteer = volunteerBO.getEmergencyVolunteer();

        List<Map<String, Object>> emergencies = new java.util.ArrayList<>();

        if (emergencyDonation != null) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "donation");
            map.put("id", emergencyDonation.getDonationId());
            map.put("title", emergencyDonation.getTitle());
            emergencies.add(map);
        }

        if (emergencyFunding != null) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "funding");
            map.put("id", emergencyFunding.getFundingId());
            map.put("title", emergencyFunding.getTitle());
            emergencies.add(map);
        }

        if (emergencyVolunteer != null) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "volunteer");
            map.put("id", emergencyVolunteer.getVolunteerId());
            map.put("title", emergencyVolunteer.getTitle());
            emergencies.add(map);
        }

        int total = emergencies.size();

        if (total == 0) {
            result.put("type", "none");
            result.put("count", 0);
            return result;
        }

        if (total == 1) {
            Map<String, Object> single = emergencies.get(0);
            result.put("type", single.get("type"));
            result.put("id", single.get("id"));
            result.put("title", single.get("title"));
            result.put("count", 1);
        } else {
            result.put("type", "multiple");
            result.put("count", total);
            result.put("title", "긴급 공지가 총 " + total + "개 있습니다.");
        }

        return result;
    }


}
