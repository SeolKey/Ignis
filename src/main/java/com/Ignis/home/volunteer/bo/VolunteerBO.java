package com.Ignis.home.volunteer.bo;

import java.time.LocalDateTime;
import java.util.List;

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
        return fileManagerService.saveFile(imageFile);
    }

    public void increaseViewCount(Long volunteerId) {
        volunteerMapper.incrementViewCount(volunteerId);
    }

    public List<Volunteer> getMostViewedVolunteerList(int limit) {
        return volunteerMapper.selectMostViewedVolunteerList(limit);
    }
}
