package com.Ignis.home.funding.bo;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.Ignis.common.enums.Status;
import com.Ignis.common.upload.UploadCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.funding.mapper.FundingMapper;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class FundingBO {

    @Autowired
    private FundingMapper fundingMapper;

    @Autowired
    private FileManagerService fileManagerService;

    /** 펀딩 목록 */
    public List<Funding> getFundingList() {
        return fundingMapper.selectFundingList();
    }

    /** 단일 펀딩 조회 */
    public Funding getFundingById(Long fundingId) {
        return fundingMapper.selectFundingById(fundingId);
    }

    /** ✅ 수정된 insertFunding (대표 + 서브 이미지 처리) */
    public void insertFunding(Funding funding, MultipartFile mainImage, MultipartFile subImage) {
        try {
            // 대표 이미지 저장 (필수)
            String mainImageUrl = null;
            if (mainImage != null && !mainImage.isEmpty()) {
                mainImageUrl = fileManagerService.saveFile(UploadCategory.FUNDING, mainImage);
                funding.setImagePath(mainImageUrl);
            } else {
                funding.setImagePath(null);
            }

            // 서브 이미지 저장 (선택)
            String subImageUrl = null;
            if (subImage != null && !subImage.isEmpty()) {
                subImageUrl = fileManagerService.saveFile(UploadCategory.FUNDING, subImage);
                // Funding 엔티티에 subImagePath 컬럼이 존재해야 함
                funding.setSubImagePath(subImageUrl);
            }

            // DB 저장
            fundingMapper.insertFunding(funding);

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    /** 기존 insertFunding(React 용 등)과 충돌 피하기 위해 오버로딩 버전 유지 */
    public void insertFunding(Funding funding, MultipartFile file) {
        String imageUrl = null;
        try {
            imageUrl = fileManagerService.saveFile(UploadCategory.FUNDING, file);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
        funding.setImagePath(imageUrl);
        fundingMapper.insertFunding(funding);
    }

    public List<Funding> getRecentFundingList(int limit) {
        return fundingMapper.selectRecentFundingList(limit);
    }

    public List<Funding> getPendingFundingList() {
        return fundingMapper.selectPendingFundingList();
    }

    public void updateFundingStatus(Long fundingId, Status status, String rejectReason) {
        fundingMapper.updateFundingStatus(fundingId, status.name(), rejectReason);
    }

    public void deleteFunding(int fundingId) {
        fundingMapper.deleteFunding(fundingId);
    }

    public void increaseViewCount(Long fundingId) {
        fundingMapper.incrementViewCount(fundingId);
    }

    public List<Funding> getMostViewedFundingList(int limit) {
        return fundingMapper.selectMostViewedFundingList(limit);
    }

    public void toggleEmergency(Long fundingId, boolean isEmergency) {
        Funding funding = fundingMapper.selectFundingById(fundingId);
        if (funding == null) return;

        String title = funding.getTitle();
        if (isEmergency) {
            if (!title.startsWith("[긴급]")) {
                title = "[긴급] " + title;
            }
        } else {
            title = title.replaceFirst("^\\[긴급\\]\\s*", "");
        }

        fundingMapper.updateFundingEmergencyStatusAndTitle(
                Map.of("fundingId", fundingId,
                        "emergency", isEmergency ? 1 : 0,
                        "title", title)
        );
    }

    public Funding getEmergencyFunding() {
        return fundingMapper.selectEmergencyFunding();
    }

    // ===== 좋아요 관련 =====
    public boolean isLiked(Long userId, Long fundingId) {
        if (userId == null) return false;
        return fundingMapper.likeExists(fundingId, userId) > 0;
    }

    public int likeCount(Long fundingId) {
        Integer cnt = fundingMapper.selectLikeCount(fundingId);
        return cnt == null ? 0 : cnt;
    }

    public ToggleResult toggleLike(Long userId, Long fundingId) {
        if (userId == null) throw new IllegalStateException("로그인이 필요합니다.");
        boolean already = fundingMapper.likeExists(fundingId, userId) > 0;
        if (already) {
            fundingMapper.deleteLike(fundingId, userId);
            fundingMapper.decrementLikeCount(fundingId);
        } else {
            fundingMapper.insertLike(fundingId, userId);
            fundingMapper.incrementLikeCount(fundingId);
        }
        return new ToggleResult(!already, likeCount(fundingId));
    }

    public static class ToggleResult {
        public final boolean liked;
        public final int likeCount;
        public ToggleResult(boolean liked, int likeCount) {
            this.liked = liked;
            this.likeCount = likeCount;
        }
    }
}
