package com.Ignis.payment;

import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.funding.domain.FundingPrice;
import com.Ignis.home.funding.mapper.FundingMapper;
import com.Ignis.home.funding.mapper.FundingPriceMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PaymentBO {

    private final FundingMapper fundingMapper;
    private final FundingPriceMapper fundingPriceMapper;
    private final PortOneClient portOneClient;

    private String newMerchantUid(Long fundingId) {
        return "FUNDING-" + fundingId + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0,8);
    }

    /** 사전등록 + READY 행 생성 */
    @Transactional
    public PrepareResult prepareFunding(Long userId, Long fundingId, int amount, String buyerName, String buyerEmail, String buyerTel) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount는 1 이상 정수여야 합니다.");
        }
        Funding funding = fundingMapper.selectFundingById(fundingId);
        if (funding == null) {
            throw new IllegalArgumentException("존재하지 않는 펀딩입니다. id=" + fundingId);
        }

        String merchantUid = newMerchantUid(fundingId);

        // 1) READY 행 insert
        FundingPrice fp = new FundingPrice();
        fp.setFundingId(fundingId);
        fp.setUserId(userId);
        fp.setGivePrice(amount);
        fp.setMerchantUid(merchantUid);
        fp.setStatus("READY");
        fp.setCurrency("KRW");
        fp.setCreatedAt(LocalDateTime.now());
        fp.setUpdatedAt(LocalDateTime.now());
        fundingPriceMapper.insertFundingPriceReady(fp);

        // 2) PortOne 사전등록
        portOneClient.prepare(merchantUid, amount);

        // 응답: 프론트 결제창 호출용
        PrepareResult result = new PrepareResult();
        result.setMerchantUid(merchantUid);
        result.setName(funding.getTitle());
        result.setAmount(amount);
        result.setBuyerName(buyerName);
        result.setBuyerEmail(buyerEmail);
        result.setBuyerTel(buyerTel);
        return result;
    }


    @Transactional
    public CompletedPayment completeFunding(String impUid, String merchantUid) {
        FundingPrice fp = fundingPriceMapper.selectByMerchantUid(merchantUid);
        if (fp == null) {
            throw new IllegalStateException("사전등록 이력이 없습니다. merchantUid=" + merchantUid);
        }
        return completeFunding(impUid, merchantUid, fp.getFundingId());
    }

    /** 결제 검증 + DB 반영 + 누적금액 증가 */
    @Transactional
    public CompletedPayment completeFunding(String impUid, String merchantUid, Long fundingId) {
        // 1) PortOne 결제 단건조회
        Map pay = portOneClient.getPaymentByImpUid(impUid);
        String status = (String) pay.get("status");      // paid, ready, failed...
        Object amtObj = pay.get("amount");
        int amount = Integer.parseInt(String.valueOf(amtObj));
        String pgProvider = (String) pay.get("pg_provider");
        String pgTid = (String) pay.get("pg_tid");
        String payMethod = (String) pay.get("pay_method");
        String receiptUrl = (String) pay.get("receipt_url");

        // 2) 사전등록 행 조회
        FundingPrice fp = fundingPriceMapper.selectByMerchantUid(merchantUid);
        if (fp == null) {
            throw new IllegalStateException("사전등록 이력이 없습니다. merchantUid=" + merchantUid);
        }
        if (!fp.getFundingId().equals(fundingId)) {
            throw new IllegalStateException("merchantUid와 fundingId가 일치하지 않습니다.");
        }
        if (fp.getGivePrice() == null || !fp.getGivePrice().equals(amount)) {
            throw new IllegalStateException("결제금액 위변조 의심: 사전(" + fp.getGivePrice() + ") ≠ 실제(" + amount + ")");
        }

        if (!"paid".equalsIgnoreCase(status)) {
            // 실패/취소 처리
            fundingPriceMapper.updateStatusByMerchantUid(merchantUid, "FAILED");
            throw new IllegalStateException("결제가 완료 상태가 아닙니다. status=" + status);
        }

        // 3) 결제 성공 반영 (PAID)
        int updated = fundingPriceMapper.updatePaidByMerchantUid(
                merchantUid, impUid, pgProvider, pgTid, payMethod, receiptUrl
        );
        if (updated == 0) {
            // 이미 처리되었을 수 있음 (중복콜백). idempotent
        }

        // 4) 펀딩 누적금액 증가
        fundingMapper.updateCurrentPrice(fundingId, amount);

        CompletedPayment done = new CompletedPayment();
        done.setFundingId(fundingId);
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
        private Long fundingId;
        private Integer amount;
        private String impUid;
        private String merchantUid;
    }
}
