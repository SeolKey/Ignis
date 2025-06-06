package com.Ignis.home.funding;

import java.util.List;

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

    @GetMapping("/detail/{fundingId}")
    public String fundingDetailPage(@PathVariable("fundingId") Long fundingId, Model model) {
        Funding funding = fundingBO.getFundingById(fundingId);
        model.addAttribute("funding", funding);
        return "funding/fundingDetail";
    }
}
