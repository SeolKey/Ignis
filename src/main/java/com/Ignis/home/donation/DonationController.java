package com.Ignis.home.donation;

import java.util.List;

import com.Ignis.payment.DonationPaymentBO;
import jakarta.servlet.http.HttpSession;
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

    @Autowired
    private DonationPaymentBO donationPaymentBO;

    @GetMapping("/donation-list-view")
    public String donationListPage(@RequestParam(name = "sort", defaultValue = "latest") String sort, @RequestParam(name = "limit", defaultValue = "1000") int limit, Model model) {
        List<Donation> list;
        if ("views".equalsIgnoreCase(sort)) {
            list = donationBO.getMostViewedDonationList(limit); // 조회수 순
        } else {
            sort = "latest";
            list = donationBO.getDonationList(); // 최신순(기존)
        }
        model.addAttribute("donationList", list);  // View로 넘겨줌
        model.addAttribute("sort", sort);
        return "donation/donationList";      // templates/donation/donation-list-view.html
    }
    
    @GetMapping("/donation-create-view")
    public String donationCreatePage() {
        return "donation/donationCreate";  // → templates/donation/donationCreate.html
    }
    
    @GetMapping("/donation-detail-view")
    public String donationDetail(@RequestParam("donationId") Long donationId, Model model) {
        donationBO.increaseViewCount(donationId);
        Donation donation = donationBO.getDonationById(donationId);
        model.addAttribute("donation", donation);
        return "donation/donationDetail";
    }

    @GetMapping("/participate-view")
    public String donationParticipateView(@RequestParam("donationId") Long donationId, Model model) {
        Donation donation = donationBO.getDonationById(donationId);
        model.addAttribute("donation", donation);
        // PortOne 가맹점 식별코드 - 필요시 환경변수/설정에서 주입
        model.addAttribute("portOneImpKey", "imp15650525");
        return "donation/donationParticipate";
    }

    @GetMapping("/participate-complete")
    public String donationParticipateComplete(@RequestParam("imp_uid") String impUid,
                                              @RequestParam("merchant_uid") String merchantUid,
                                              @RequestParam("donationId") Long donationId,
                                              HttpSession session,
                                              Model model) {
        Long userId = currentUserId(session);

        //서버 검증 & DB 반영 (예외 발생 시 별도 실패페이지 없이 그대로 에러 터지게)
        DonationPaymentBO.CompletedPayment done =
                donationPaymentBO.completeDonation(impUid, merchantUid, donationId);

        model.addAttribute("userId", userId);
        model.addAttribute("donationId", donationId);
        model.addAttribute("givePrice", done.getAmount());
        return "donation/donationParticipateComplete";
    }

    /** 세션에서 userId 안전 추출 (userId/userID, Integer/Long 모두 허용) */
    private Long currentUserId(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (id == null) id = session.getAttribute("userID");
        if (id instanceof Long) return (Long) id;
        if (id instanceof Integer) return ((Integer) id).longValue();
        return null;
    }
}
