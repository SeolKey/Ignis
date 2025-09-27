package com.Ignis.home.funding.bo;

import java.io.IOException;
import java.util.List;

import com.Ignis.common.enums.Status;
import com.Ignis.common.upload.UploadCategory;
import com.Ignis.home.donation.domain.Donation;
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

    public List<Funding> getFundingList() {
        return fundingMapper.selectFundingList();
    }

    public Funding getFundingById(Long fundingId) {
        return fundingMapper.selectFundingById(fundingId);
    }

    public void insertFunding(Funding funding, MultipartFile file) {
        String imageUrl = null;
        try {
            imageUrl = fileManagerService.saveFile(UploadCategory.FUNDING, file);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
        funding.setImagePath(imageUrl); // DB에는 URL 문자열 저장
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
    
    public void deleteFunding (int fundingId){fundingMapper.deleteFunding(fundingId);
    }

    public void increaseViewCount(Long fundingId) {
        fundingMapper.incrementViewCount(fundingId);
    }

    public List<Funding> getMostViewedFundingList(int limit) {
        return fundingMapper.selectMostViewedFundingList(limit);
    }
}
