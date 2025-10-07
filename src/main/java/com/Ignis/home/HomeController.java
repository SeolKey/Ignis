package com.Ignis.home;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    /**   기존 Thymeleaf 홈 페이지 (서버 렌더링) */
    @GetMapping("/")
    public String showHomePage(Model model) {
        int limit = 4;
        List<Donation> donationList = donationBO.getMostViewedDonationList(limit);
        List<Volunteer> volunteerList = volunteerBO.getMostViewedVolunteerList(limit);
        List<Funding> fundingList = fundingBO.getMostViewedFundingList(limit);

        model.addAttribute("donationList", donationList);
        model.addAttribute("volunteerList", volunteerList);
        model.addAttribute("fundingList", fundingList);

        return "home/home";
    }

    /**  React용 JSON API (클라이언트에서 fetch('/api/home')) */
    @GetMapping("/api/home")
    @ResponseBody
    public Map<String, Object> getHomeData() {
        int limit = 4;
        // 서비스(BO)에서 최신 4개씩 가져오기
        List<Donation> donations = donationBO.getMostViewedDonationList(limit);
        List<Volunteer> volunteers = volunteerBO.getMostViewedVolunteerList(limit);
        List<Funding> fundings = fundingBO.getMostViewedFundingList(limit);

        // 프론트에서 필요한 필드만 얇게 매핑
        List<Map<String, Object>> donationList = donations.stream()
                .map(d -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("donationId", d.getDonationId()); // 도메인 필드명에 맞게 사용
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
}
