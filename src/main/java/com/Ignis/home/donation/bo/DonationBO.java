package com.Ignis.home.donation.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.domain.Donation;
import com.Ignis.home.donation.mapper.DonationMapper;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class DonationBO {

    @Autowired
    private DonationMapper donationMapper;

    @Autowired
    private FileManagerService fileManagerService;

    // 전체 기부 리스트 불러오기
    public List<Donation> getDonationList() {
        return donationMapper.selectDonationList();
    }

    // 전체 pending으로 되어있는 전체 기부 리스트 불러오기
    public List<Donation> getPendingDonationList() {
        return donationMapper.selectPendingDonationList();
    }

    // 최신순으로 n개만 불러오기 (메인페이지용)
    public List<Donation> getLatestProjects(int limit) {
        return donationMapper.selectLatestDonation(limit);
    }

    // 단일 상세 조회
    public Donation getDonationById(Long donationId) {
        return donationMapper.selectDonationById(donationId);
    }

	// 기부 등록 (파일 포함)
    public void insertDonation(Donation donation, MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            String imagePath = fileManagerService.saveFile(file);
            donation.setImagePath(imagePath);
        } else {
            // 🔥 DB에 NOT NULL 제약이 있으므로 빈 문자열이라도 넣자
            donation.setImagePath("");
        }
        donationMapper.insertDonation(donation);
    }

    public List<Donation> getRecentDonationList(int limit) {
        return donationMapper.selectRecentDonationList(limit);
    }

    public void updateDonationStatus(Long donationId, Status status) {
        donationMapper.updateDonationStatus(donationId, status.name());
    }

    public void deletedonation(int donationId) {
        donationMapper.deleteDonation(donationId);
    }

    // ✅ [추가] 기부 참여 처리
    public void participateDonation(Long userId, Long donationId, Integer amount) {
        // 현재 Donation 정보 조회
        Donation donation = donationMapper.selectDonationById(donationId);
        if (donation == null) {
            throw new IllegalArgumentException("존재하지 않는 기부 프로젝트입니다.");
        }

        // 목표 금액 초과 방지
        int newPrice = donation.getCurrentPrice() + amount;
        if (newPrice > donation.getMaxPrice()) {
            throw new IllegalArgumentException("목표 금액을 초과할 수 없습니다.");
        }

        // 금액 갱신
        donation.setCurrentPrice(newPrice);
        donationMapper.updateDonationCurrentPrice(donationId, newPrice);

        // TODO: 필요하다면 기부 참여 로그(참여자 테이블)에 기록
        // e.g. donationMapper.insertDonationParticipation(userId, donationId, amount);
    }
}
