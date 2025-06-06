package com.Ignis.home.donation.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.domain.Donation;
import com.Ignis.home.donation.mapper.DonationMapper;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class DonationBO {

    @Autowired
    private DonationMapper donationMapper;

    // 전체 기부 리스트 불러오기
    public List<Donation> getDonationList() {
        return donationMapper.selectDonationList();
    }

    // 최신순으로 n개만 불러오기 (메인페이지용)
    public List<Donation> getLatestProjects(int limit) {
        return donationMapper.selectLatestDonation(limit);
    }

    // 단일 상세 조회
    public Donation getDonationById(Long donationId) {
        return donationMapper.selectDonationById(donationId);
    }

    // 기타: 등록, 수정, 삭제 등 필요한 경우 여기에 추가
    
    public void insertDonation(Donation donation) {
        donationMapper.insertDonation(donation);
    }
    
    public List<Donation> getRecentDonationList(int limit) {
        return donationMapper.selectRecentDonationList(limit);
    }
    
    public void updateDonationStatus(Long donationId, Status status){
        donationMapper.updateDonationStatus(donationId, status.name());
    }

    public void deletedonation (int donationId){
        donationMapper.deleteDonation(donationId);
    }
}
