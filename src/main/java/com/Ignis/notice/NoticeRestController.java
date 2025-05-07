package com.Ignis.notice;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.Ignis.notice.bo.NoticeBO;
import com.Ignis.notice.domain.Notice;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeRestController {

    private final NoticeBO noticeBO;

    @PostMapping("/create")
    public Map<String, Object> createNotice(
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        HttpSession session
    ) {
        Map<String, Object> result = new HashMap<>();

        Long userIdLong = (Long) session.getAttribute("userId");
        if (userIdLong == null) {
            result.put("code", 401);
            result.put("error", "로그인 필요");
            return result;
        }

        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setContent(content);
        notice.setUserId(userIdLong.intValue());

        noticeBO.createNotice(notice);
        result.put("result", "성공");
        return result;
    }


    @PostMapping("/edit")
    public Map<String, Object> updateNotice(@RequestBody Notice notice) {
        Map<String, Object> result = new HashMap<>();
        noticeBO.updateNotice(notice);
        result.put("result", "성공");
        return result;
    }
}
