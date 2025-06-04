package com.Ignis.donation.bo;

import com.Ignis.common.enums.Status;
import com.Ignis.donation.domain.Donation;
import com.Ignis.donation.mapper.DonationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonationBO {

    @Autowired
    private DonationMapper donationMapper;

    public List<Donation> getDonationList(){
        return donationMapper.selectDonationList();
    }

    public List<Donation> getDonationListByStatus(Status status) {
        return donationMapper.selectDonationListByStatus(status);
    }

    public Donation getDonationById(int donationId){
        return donationMapper.selectDonationById(donationId);
    }

    public void createDonation(Donation donation){
        donationMapper.insertDonation(donation);
    }

    public void updateDonationStatus(int donationId, Status status){
        donationMapper.updateDonationStatus(donationId, status.name());
    }

    public void deletedonation (int donationId){
        donationMapper.deleteDonation(donationId);
    }
}
