package com.Ignis.home.donation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;

@Controller
@RequestMapping("/donation")
public class DonationController {

    @Autowired
    private DonationBO donationBO;

    @GetMapping("/donation-list-view")
    public String donationListPage(Model model) {
        List<Donation> list = donationBO.getDonationList();
        model.addAttribute("donationList", list);  // View로 넘겨줌
        return "donation/donationList";      // templates/donation/donation-list-view.html
    }
    
    @GetMapping("/donation-create-view")
    public String donationCreatePage() {
        return "donation/donationCreate";  // → templates/donation/donationCreate.html
    }
    
    @GetMapping("/donation-detail-view")
    public String donationDetail(@RequestParam("donationId") Long donationId, Model model) {
        Donation donation = donationBO.getDonationById(donationId);
        model.addAttribute("donation", donation);
        return "donation/donationDetail";
    }
}
