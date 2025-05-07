package com.Ignis.notice.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Ignis.notice.domain.Notice;
import com.Ignis.notice.mapper.NoticeMapper;

@Service
public class NoticeBO {

    @Autowired
    private NoticeMapper noticeMapper;

    public List<Notice> getNoticeList() {
        return noticeMapper.selectNoticeList();
    }

    public Notice getNoticeById(int id) {
        return noticeMapper.selectNoticeById(id);
    }

    public void createNotice(Notice notice) {
        noticeMapper.insertNotice(notice);
    }

    public void updateNotice(Notice notice) {
        noticeMapper.updateNotice(notice);
    }
}
