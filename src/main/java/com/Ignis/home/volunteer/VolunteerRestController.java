package com.Ignis.home.volunteer;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.home.volunteer.bo.VolunteerBO;

@RestController
@RequestMapping("/volunteer")
public class VolunteerRestController {

    @Autowired
    private VolunteerBO volunteerBO;

    @PostMapping("/create")
    public Map<String, Object> createVolunteer(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime,
            @RequestParam("maxParticipants") int maxParticipants,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        int rowCount = volunteerBO.addVolunteer(
            userId, title, description, location, startTime, endTime, maxParticipants, imageFile
        );

        Map<String, Object> result = new HashMap<>();
        if (rowCount > 0) {
            result.put("code", 1);
            result.put("result", "성공");
        } else {
            result.put("code", 500);
            result.put("errorMessage", "DB 저장 실패");
        }
        return result;
    }
}
