package com.Ignis.home.volunteer.bo;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import com.Ignis.common.upload.UploadCategory;
import com.Ignis.home.volunteer.domain.VolunteerParticipant;
import com.Ignis.home.volunteer.mapper.VolunteerPeopleMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.home.volunteer.domain.Volunteer;
import com.Ignis.home.volunteer.mapper.VolunteerMapper;

@Service
public class VolunteerBO {

    @Autowired
    private VolunteerMapper volunteerMapper;

    @Autowired
    private VolunteerPeopleMapper volunteerPeopleMapper;

    @Autowired
    private FileManagerService fileManagerService;


    public List<Volunteer> getVolunteerList() {
        return volunteerMapper.selectVolunteerList();
    }

    public Volunteer getVolunteerById(Long id) {
        return volunteerMapper.selectVolunteerById(id);
    }

    public List<Volunteer> getRecentVolunteerList(int limit) {
        return volunteerMapper.selectRecentVolunteerList(limit);
    }

    public int addVolunteer(Long userId, String title, String description, String location,
            String startTime, String endTime, int maxParticipants, MultipartFile imageFile) {

        // 이미지 저장 처리
        String imagePath = saveImage(imageFile);

        Volunteer volunteer = new Volunteer();
        volunteer.setUserId(userId);
        volunteer.setTitle(title);
        volunteer.setDescription(description);
        volunteer.setLocation(location);
        volunteer.setImagePath(imagePath);
        volunteer.setStartTime(LocalDateTime.parse(startTime));
        volunteer.setEndTime(LocalDateTime.parse(endTime));
        volunteer.setMaxParticipants(maxParticipants);
        volunteer.setStatus("PENDING");
        volunteer.setCurrentPeople(0);
        volunteer.setCreatedAt(LocalDateTime.now());

        return volunteerMapper.insertVolunteer(volunteer);
    }


    public String saveImage(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) return null;
        try {
            return fileManagerService.saveFile(UploadCategory.VOLUNTEER, imageFile);
        } catch (IOException e) {
            throw new RuntimeException("봉사 이미지 저장 실패", e);
        }
    }

    public void increaseViewCount(Long volunteerId) {
        volunteerMapper.incrementViewCount(volunteerId);
    }

    public List<Volunteer> getMostViewedVolunteerList(int limit) {
        return volunteerMapper.selectMostViewedVolunteerList(limit);
    }

    // ▼ 참여하기
    @Transactional
    public void joinVolunteer(Long volunteerId, Long userId) {
        Volunteer v = volunteerMapper.selectVolunteerById(volunteerId);
        if (v == null) throw new IllegalArgumentException("존재하지 않는 봉사글입니다.");
        if (!"APPROVED".equalsIgnoreCase(v.getStatus()))
            throw new IllegalStateException("승인되지 않은 봉사글입니다.");

        var now = java.time.LocalDateTime.now();
        if (now.isBefore(v.getStartTime()) || now.isAfter(v.getEndTime()))
            throw new IllegalStateException("모집 기간이 아닙니다.");

        Integer exists = volunteerPeopleMapper.exists(volunteerId, userId);
        if (exists != null && exists > 0) throw new IllegalStateException("이미 참여했습니다.");

        int inc = volunteerMapper.increaseCurrentPeople(volunteerId);
        if (inc == 0) throw new IllegalStateException("정원이 가득 찼습니다.");

        int ins = volunteerPeopleMapper.insert(volunteerId, userId);
        if (ins == 0) throw new IllegalStateException("참여 저장 실패");
    }

    // ▼ 참여 취소
    @Transactional
    public void cancelVolunteer(Long volunteerId, Long userId) {
        Integer exists = volunteerPeopleMapper.exists(volunteerId, userId);
        if (exists == null || exists == 0) throw new IllegalStateException("참여 이력이 없습니다.");

        int del = volunteerPeopleMapper.delete(volunteerId, userId);
        if (del == 0) throw new IllegalStateException("취소 실패");

        volunteerMapper.decreaseCurrentPeople(volunteerId);
    }

    // ▼ 내가 참여했는지 여부
    public boolean isJoined(Long volunteerId, Long userId) {
        Integer exists = volunteerPeopleMapper.exists(volunteerId, userId);
        return exists != null && exists > 0;
    }

    // VolunteerBO.java
    public Long createVolunteerFromReact(Volunteer v) {
        // Mapper의 <insert id="insertVolunteer" useGeneratedKeys="true" keyProperty="volunteerId"> 필요
        volunteerMapper.insertVolunteer(v);
        return v.getVolunteerId();
    }

    public List<VolunteerParticipant> getParticipantList(Long volunteerId) {
        return volunteerPeopleMapper.selectParticipantsByVolunteerId(volunteerId);
    }

}
