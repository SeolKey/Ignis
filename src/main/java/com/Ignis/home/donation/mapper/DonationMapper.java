package com.Ignis.home.donation.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.Ignis.home.donation.domain.Donation;

@Mapper
public interface DonationMapper {

    // 전체 리스트
    List<Donation> selectDonationList();

    // admin 전용 (보류 상태)
    List<Donation> selectPendingDonationList();

    // 최신순 n개
    List<Donation> selectLatestDonation(int limit);

    // 단건 조회
    Donation selectDonationById(Long donationId);

    // 등록
    int insertDonation(Donation donation);

    // 최신 승인된 n개
    List<Donation> selectRecentDonationList(int limit);

    // 상태 업데이트
    void updateDonationStatus(@Param("donationId") Long donationId, @Param("status") String status);

    // 삭제
    void deleteDonation(int donationId);

    // ✅ currentPrice 업데이트
    void updateDonationCurrentPrice(@Param("donationId") Long donationId,
                                    @Param("currentPrice") int currentPrice);

    // ✅ 조회수 증가
    void incrementViewCount(Long donationId);

    // ✅ 조회수 순으로 나열
    List<Donation> selectMostViewedDonationList(int limit);

    // ✅ 금액 누적 업데이트
    int updateCurrentPrice(@Param("donationId") Long donationId,
                           @Param("delta") int delta);

    // ✅ [추가] 승인된(Approved) 글 전체 리스트 (긴급 관리용)
    List<Donation> selectApprovedDonationList();

    // ✅ [추가] 긴급 상태 업데이트
    void updateDonationEmergencyStatusAndTitle(Map<String, Object> params);

    // ✅ 긴급 기부글 1개 조회
    Donation selectEmergencyDonation();
}
