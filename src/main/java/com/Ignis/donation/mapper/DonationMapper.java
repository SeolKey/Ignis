package com.Ignis.donation.mapper;

import com.Ignis.common.enums.Status;
import com.Ignis.donation.domain.Donation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Stack;

@Mapper
public interface DonationMapper {

    List<Donation> selectDonationList(); // 관리자 페이지에서 사용할 리스트

    List<Donation> selectDonationListByStatus(Status status); //사용자에게 보여줄 승인된 리스트

    Donation selectDonationById(@Param("donationId") int donationId);

    void insertDonation(Donation donation);

    void updateDonationStatus(@Param("donationId") int donationId, @Param("status") String status);

    void deleteDonation(int donationId);
}
