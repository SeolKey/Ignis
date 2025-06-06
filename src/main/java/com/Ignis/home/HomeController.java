package com.Ignis.home;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

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

    @GetMapping("/")
    public String showHomePage(Model model) {
        List<Donation> donationList = donationBO.getRecentDonationList(4);
        List<Volunteer> volunteerList = volunteerBO.getRecentVolunteerList(4);
        List<Funding> fundingList = fundingBO.getRecentFundingList(4);

        model.addAttribute("donationList", donationList);
        model.addAttribute("volunteerList", volunteerList);
        model.addAttribute("fundingList", fundingList);

        return "home/home";
    }
}
