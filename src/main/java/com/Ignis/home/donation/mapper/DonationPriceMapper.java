package com.Ignis.home.donation.mapper;


import com.Ignis.home.donation.domain.DonationPrice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DonationPriceMapper {
    // 사전등록(READY) 행 생성
    int insertDonationPriceReady(DonationPrice dp);

    // merchant_uid로 조회
    DonationPrice selectByMerchantUid(@Param("merchantUid") String merchantUid);

    // 결제 성공(PAID) 업데이트
    int updatePaidByMerchantUid(@Param("merchantUid") String merchantUid,
                                @Param("impUid") String impUid,
                                @Param("pgProvider") String pgProvider,
                                @Param("pgTid") String pgTid,
                                @Param("payMethod") String payMethod,
                                @Param("receiptUrl") String receiptUrl);

    // 실패/취소 상태 업데이트
    int updateStatusByMerchantUid(@Param("merchantUid") String merchantUid,
                                  @Param("status") String status);
}
