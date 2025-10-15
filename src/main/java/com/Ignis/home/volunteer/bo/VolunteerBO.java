package com.Ignis.home.volunteer.bo;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.Ignis.common.FileManagerService;
import com.Ignis.common.upload.UploadCategory;
import com.Ignis.home.volunteer.domain.Volunteer;
import com.Ignis.home.volunteer.domain.VolunteerParticipant;
import com.Ignis.home.volunteer.mapper.VolunteerMapper;
import com.Ignis.home.volunteer.mapper.VolunteerPeopleMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
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
        String imageUrl;
        try {
            imageUrl = fileManagerService.saveFile(UploadCategory.VOLUNTEER, imageFile);
        } catch (IOException e) {
            throw new RuntimeException("봉사 이미지 저장 실패", e);
        }

        Volunteer volunteer = new Volunteer();
        volunteer.setUserId(userId);
        volunteer.setTitle(title);
        volunteer.setDescription(description);
        volunteer.setLocation(location);
        volunteer.setImagePath(imageUrl);
        volunteer.setStartTime(LocalDateTime.parse(startTime));
        volunteer.setEndTime(LocalDateTime.parse(endTime));
        volunteer.setMaxParticipants(maxParticipants);
        volunteer.setStatus("PENDING");
        volunteer.setCurrentPeople(0);
        volunteer.setCreatedAt(LocalDateTime.now());

        return volunteerMapper.insertVolunteer(volunteer);
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

    public boolean isJoined(Long volunteerId, Long userId) {
        Integer exists = volunteerPeopleMapper.exists(volunteerId, userId);
        return exists != null && exists > 0;
    }

    public Long createVolunteerFromReact(Volunteer v) {
        volunteerMapper.insertVolunteer(v);
        return v.getVolunteerId();
    }

    public List<VolunteerParticipant> getParticipantList(Long volunteerId) {
        return volunteerPeopleMapper.selectParticipantsByVolunteerId(volunteerId);
    }

    // ✅ [추가] 긴급 상태 토글 (+ 제목 자동 변경)
    public void toggleEmergency(Long volunteerId, boolean isEmergency) {
        Volunteer volunteer = volunteerMapper.selectVolunteerById(volunteerId);
        if (volunteer == null) return;

        String title = volunteer.getTitle();
        if (isEmergency) {
            if (!title.startsWith("[긴급]")) {
                title = "[긴급] " + title;
            }
        } else {
            title = title.replaceFirst("^\\[긴급\\]\\s*", "");
        }

        volunteerMapper.updateVolunteerEmergencyStatusAndTitle(
                Map.of("volunteerId", volunteerId,
                        "isEmergency", isEmergency ? 1 : 0,
                        "title", title)
        );
    }
    // ✅ 긴급 상태인 봉사글 목록 조회
    public Volunteer getEmergencyVolunteer() {
        return volunteerMapper.selectEmergencyVolunteer();
    }

}
