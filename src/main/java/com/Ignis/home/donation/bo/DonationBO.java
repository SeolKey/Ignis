package com.Ignis.home.donation.bo;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.Ignis.common.upload.UploadCategory;
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
        String imageUrl = null;
        try {
            imageUrl = fileManagerService.saveFile(UploadCategory.DONATION, file);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
        donation.setImagePath(imageUrl); // DB에는 URL 문자열 저장
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

    public void increaseViewCount(Long donationId) {
        donationMapper.incrementViewCount(donationId);
    }

    public List<Donation> getMostViewedDonationList(int limit) {
        return donationMapper.selectMostViewedDonationList(limit);
    }

    public void toggleEmergency(Long donationId, boolean isEmergency) {
        Donation donation = donationMapper.selectDonationById(donationId);
        if (donation == null) return;

        // ✅ 제목 자동 수정 로직
        String title = donation.getTitle();
        if (isEmergency) {
            if (!title.startsWith("[긴급]")) {
                title = "[긴급] " + title;
            }
        } else {
            // "[긴급]" 제거
            title = title.replaceFirst("^\\[긴급\\]\\s*", "");
        }

        // ✅ DB 업데이트 (is_emergency, title 동시에)
        donationMapper.updateDonationEmergencyStatusAndTitle(
                Map.of("donationId", donationId,
                        "isEmergency", isEmergency ? 1 : 0,
                        "title", title)
        );
    }


    public Donation getEmergencyDonation() {
        return donationMapper.selectEmergencyDonation();
    }


}
