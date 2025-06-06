package com.Ignis.home.donation.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.Ignis.home.donation.domain.Donation;

@Mapper
public interface DonationMapper {

    // 전체 리스트
    List<Donation> selectDonationList();

    // 최신순 n개
    List<Donation> selectLatestDonation(int limit);

    // 단건 조회
    Donation selectDonationById(Long donationId);

    // (선택) 등록, 수정, 삭제도 여기에 추가 가능
    void insertDonation(Donation donation);
    
    List<Donation> selectRecentDonationList(int limit);
    
    void updateDonationStatus(@Param("donationId") Long donationId, @Param("status") String status);

    void deleteDonation(int donationId);
}
