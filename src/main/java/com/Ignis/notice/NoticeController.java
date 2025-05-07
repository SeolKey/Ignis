package com.Ignis.notice;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.Ignis.notice.bo.NoticeBO;
import com.Ignis.notice.domain.Notice;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeBO noticeBO;

    @GetMapping("/notice-list-view")
    public String noticeList(Model model) {
        List<Notice> noticeList = noticeBO.getNoticeList();
        model.addAttribute("noticeList", noticeList);
        return "notice/noticeList";
    }

    @GetMapping("/notice-create-view")
    public String noticeCreateForm(Model model) {
        model.addAttribute("notice", new Notice());
        return "notice/noticeCreate";
    }

    @GetMapping("/notice-detail-view/{id}")
    public String noticeDetail(@PathVariable("id") int id, Model model) {
        Notice notice = noticeBO.getNoticeById(id);
        model.addAttribute("notice", notice);
        return "notice/noticeDetail";
    }

    @GetMapping("/notice-edit-view/{id}")
    public String noticeEditForm(@PathVariable("id") int id, Model model) {
        Notice notice = noticeBO.getNoticeById(id);
        model.addAttribute("notice", notice);
        return "notice/noticeEdit";
    }
}
