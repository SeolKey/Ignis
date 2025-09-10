package com.Ignis.home.donation.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.Ignis.home.donation.domain.Donation;

@Mapper
public interface DonationMapper {

    // 전체 리스트
    List<Donation> selectDonationList();

    // admin 전용
    List<Donation> selectPendingDonationList();
    
    // 최신순 n개
    List<Donation> selectLatestDonation(int limit);

    // 단건 조회
    Donation selectDonationById(Long donationId);

    // 등록
    int insertDonation(Donation donation);
    
    List<Donation> selectRecentDonationList(int limit);
    
    void updateDonationStatus(@Param("donationId") Long donationId, @Param("status") String status);

    void deleteDonation(int donationId);

    // ✅ [추가] currentPrice 업데이트
    void updateDonationCurrentPrice(@Param("donationId") Long donationId,
                                    @Param("currentPrice") int currentPrice);

    void incrementViewCount(Long donationId); // 조회수 증가

    List<Donation> selectMostViewedDonationList(int limit); // 조회수 순으로 나열

    int updateCurrentPrice(@Param("donationId") Long donationId,
                           @Param("delta") int delta);
}
