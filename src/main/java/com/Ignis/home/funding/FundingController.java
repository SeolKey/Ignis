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
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/funding")
public class FundingController {

    @Autowired
    private FundingBO fundingBO;

    @GetMapping("/funding-list-view")
    public String fundingListPage(@RequestParam(name = "sort", defaultValue = "latest") String sort, @RequestParam(name = "limit", defaultValue = "1000") int limit, Model model) {
        List<Funding> list;
        if ("views".equalsIgnoreCase(sort)) {
            list = fundingBO.getMostViewedFundingList(limit);
        } else {
            sort = "latest";
            list = fundingBO.getFundingList();
        }
        model.addAttribute("fundingList", list);
        model.addAttribute("sort", sort);
        return "funding/fundingList";
    }

    @GetMapping("/funding-create-view")
    public String fundingCreatePage() {
        return "funding/fundingCreate";
    }

    @GetMapping("/funding-detail-view/{fundingId}")
    public String fundingDetailPage(@PathVariable("fundingId") Long fundingId, Model model) {
        fundingBO.increaseViewCount(fundingId);
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
