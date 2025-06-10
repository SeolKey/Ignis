package com.Ignis.home.funding;

import java.util.List;

import com.Ignis.home.funding.bo.FundingPriceBO;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;

@Controller
@RequestMapping("/funding")
public class FundingController {

    @Autowired
    private FundingBO fundingBO;

    @GetMapping("/funding-list-view")
    public String fundingListPage(Model model) {
        List<Funding> fundingList = fundingBO.getFundingList();
        model.addAttribute("fundingList", fundingList);
        return "funding/fundingList";
    }

    @GetMapping("/funding-create-view")
    public String fundingCreatePage() {
        return "funding/fundingCreate";
    }

    @GetMapping("/funding-detail-view/{fundingId}")
    public String fundingDetailPage(@PathVariable("fundingId") Long fundingId, Model model) {
        Funding funding = fundingBO.getFundingById(fundingId);
        model.addAttribute("funding", funding);
        return "funding/fundingDetail";
    }


    @GetMapping("/participate/{fundingId}")
    public String showParticipatePage(
    		@PathVariable("fundingId") Long fundingId,
            Model model,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return "redirect:/user/sign-in-view";
        }

        model.addAttribute("funding", fundingBO.getFundingById(fundingId));
        return "funding/fundingParticipate";
    }

    @GetMapping("/participate-complete")
    public String participateCompletePage(
            HttpSession session,
            Model model) {

        model.addAttribute("userId", session.getAttribute("participationUserId"));
        model.addAttribute("fundingId", session.getAttribute("participationFundingId"));
        model.addAttribute("givePrice", session.getAttribute("participationGivePrice"));
        return "funding/fundingParticipateComplete";
    }
}
