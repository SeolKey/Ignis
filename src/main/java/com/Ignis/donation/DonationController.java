package com.Ignis.donation;


import com.Ignis.common.enums.Status;
import com.Ignis.donation.bo.DonationBO;
import com.Ignis.donation.domain.Donation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/donation")
@RequiredArgsConstructor
public class DonationController {

    private final DonationBO donationBO;

    @GetMapping("/donation-list-view")
    public String donationList(Model model) {
        List<Donation> donationList = donationBO.getDonationListByStatus(Status.APPROVED);
        model.addAttribute("donationList", donationList);
        return "donation/donationList";
    }

    @GetMapping("/donation-create-view")
    public String donationCreateView(){
        return "donation/donationCreate";
    }

    @GetMapping("/donation-detail-view/{donationId}")
    public String donationDetailPath(@PathVariable("donationId") int donationId, Model model) {
        Donation donation = donationBO.getDonationById(donationId);
        model.addAttribute("donation", donation);
        return "donation/donationDetail";
    }


}
