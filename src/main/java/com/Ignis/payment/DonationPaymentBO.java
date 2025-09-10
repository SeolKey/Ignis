package com.Ignis.payment;

import com.Ignis.home.donation.domain.Donation;
import com.Ignis.home.donation.domain.DonationPrice;
import com.Ignis.home.donation.mapper.DonationMapper;
import com.Ignis.home.donation.mapper.DonationPriceMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DonationPaymentBO {
    private final DonationMapper donationMapper;
    private final DonationPriceMapper donationPriceMapper;
    private final PortOneClient portOneClient;

    private String newMerchantUid(Long donationId) {
        return "DONATION-" + donationId + "-" + System.currentTimeMillis()
                + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    /** 사전등록 + READY 행 생성 */
    @Transactional
    public PrepareResult prepareDonation(Long userId, Long donationId, int amount,
                                         String buyerName, String buyerEmail, String buyerTel) {
        if (amount <= 0) throw new IllegalArgumentException("amount는 1 이상 정수여야 합니다.");
        Donation donation = donationMapper.selectDonationById(donationId);
        if (donation == null) throw new IllegalArgumentException("존재하지 않는 기부입니다. id=" + donationId);

        // (선택) 목표 초과 방지 로직
        // if (donation.getCurrentPrice() + amount > donation.getMaxPrice()) { ... }

        String merchantUid = newMerchantUid(donationId);

        // 1) READY insert
        DonationPrice dp = new DonationPrice();
        dp.setDonationId(donationId);
        dp.setUserId(userId);
        dp.setGivePrice(amount);
        dp.setMerchantUid(merchantUid);
        dp.setStatus("READY");
        dp.setCurrency("KRW");
        dp.setCreatedAt(LocalDateTime.now());
        dp.setUpdatedAt(LocalDateTime.now());
        donationPriceMapper.insertDonationPriceReady(dp);

        // 2) PortOne 사전등록
        portOneClient.prepare(merchantUid, amount);

        // 3) 프론트용 반환
        PrepareResult r = new PrepareResult();
        r.setMerchantUid(merchantUid);
        r.setName(donation.getTitle());
        r.setAmount(amount);
        r.setBuyerName(buyerName);
        r.setBuyerEmail(buyerEmail);
        r.setBuyerTel(buyerTel);
        return r;
    }

    /** 결제 검증 + DB 반영 + 누적금액 증가 */
    @Transactional
    public CompletedPayment completeDonation(String impUid, String merchantUid, Long donationId) {
        // 1) PortOne 결제 단건조회
        Map pay = portOneClient.getPaymentByImpUid(impUid);
        String status = (String) pay.get("status"); // paid, ready, failed...
        Integer amount = (Integer) pay.get("amount");
        String pgProvider = (String) pay.get("pg_provider");
        String pgTid = (String) pay.get("pg_tid");
        String payMethod = (String) pay.get("pay_method");
        String receiptUrl = (String) pay.get("receipt_url");

        // 2) 사전등록 행 조회
        DonationPrice dp = donationPriceMapper.selectByMerchantUid(merchantUid);
        if (dp == null) throw new IllegalStateException("사전등록 이력이 없습니다. merchantUid=" + merchantUid);
        if (!dp.getDonationId().equals(donationId))
            throw new IllegalStateException("merchantUid와 donationId가 일치하지 않습니다.");
        if (dp.getGivePrice() == null || !dp.getGivePrice().equals(amount))
            throw new IllegalStateException("결제금액 위변조 의심: 사전(%d) ≠ 실제(%d)".formatted(dp.getGivePrice(), amount));

        if (!"paid".equalsIgnoreCase(status)) {
            donationPriceMapper.updateStatusByMerchantUid(merchantUid, "FAILED");
            throw new IllegalStateException("결제가 완료 상태가 아닙니다. status=" + status);
        }

        // 3) 결제 성공 반영
        donationPriceMapper.updatePaidByMerchantUid(
                merchantUid, impUid, pgProvider, pgTid, payMethod, receiptUrl);

        // 4) 기부 누적금액 증가
        donationMapper.updateCurrentPrice(donationId, amount);

        CompletedPayment done = new CompletedPayment();
        done.setDonationId(donationId);
        done.setAmount(amount);
        done.setImpUid(impUid);
        done.setMerchantUid(merchantUid);
        return done;
    }

    @Data
    public static class PrepareResult {
        private String merchantUid;
        private String name;
        private Integer amount;
        private String buyerName;
        private String buyerEmail;
        private String buyerTel;
    }

    @Data
    public static class CompletedPayment {
        private Long donationId;
        private Integer amount;
        private String impUid;
        private String merchantUid;
    }

}
