package com.Ignis.home.volunteer.bo;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
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

    // ✅ 사용자용 봉사 목록
    public List<Volunteer> getVolunteerList() {
        return volunteerMapper.selectVolunteerList();
    }

    public Volunteer getVolunteerById(Long id) {
        return volunteerMapper.selectVolunteerById(id);
    }

    public List<Volunteer> getRecentVolunteerList(int limit) {
        return volunteerMapper.selectRecentVolunteerList(limit);
    }

    // ✅ 관리자용 봉사 목록 (모든 상태)
    public List<Volunteer> getAllVolunteersForAdmin() {
        return volunteerMapper.selectAllVolunteersForAdmin();
    }

    @Transactional
    public void updateVolunteerStatus(Long volunteerId, String status, String rejectReason) {
        // Map.of 는 null 금지 → HashMap 으로 변경
        Map<String, Object> params = new HashMap<>();
        params.put("volunteerId", volunteerId);
        params.put("status", status);
        // null 가능: 거절 사유 입력 안 했을 때도 XML에서 안전하게 처리됨
        params.put("rejectReason", rejectReason);

        volunteerMapper.updateVolunteerStatus(params);
    }

    // ✅ 이미지 업로드 + 봉사 등록
    public int addVolunteer(Long userId, String title, String description, String location,
                            String startTime, String endTime, int maxParticipants, MultipartFile imageFile) {

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

    // ▼ 참여 관련
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

    // ✅ 긴급 상태 토글
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

    public Volunteer getEmergencyVolunteer() {
        return volunteerMapper.selectEmergencyVolunteer();
    }

    // ✅ 좋아요 관련
    public boolean isLiked(Long volunteerId, Long userId) {
        if (userId == null) return false;
        return volunteerMapper.likeExists(volunteerId, userId) > 0;
    }

    public int likeCount(Long volunteerId) {
        Integer cnt = volunteerMapper.selectLikeCount(volunteerId);
        return cnt == null ? 0 : cnt;
    }

    @Transactional
    public ToggleResult toggleLike(Long volunteerId, Long userId) {
        if (userId == null) throw new IllegalStateException("로그인이 필요합니다.");
        boolean already = volunteerMapper.likeExists(volunteerId, userId) > 0;
        if (already) {
            volunteerMapper.deleteLike(volunteerId, userId);
            volunteerMapper.decrementLikeCount(volunteerId);
        } else {
            volunteerMapper.insertLike(volunteerId, userId);
            volunteerMapper.incrementLikeCount(volunteerId);
        }
        return new ToggleResult(!already, likeCount(volunteerId));
    }

    public static class ToggleResult {
        public final boolean liked;
        public final int likeCount;
        public ToggleResult(boolean liked, int likeCount) {
            this.liked = liked; this.likeCount = likeCount;
        }
    }

}
