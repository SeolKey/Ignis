package com.Ignis.notice.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import com.Ignis.notice.domain.Notice;

@Mapper
public interface NoticeMapper {

    List<Notice> selectNoticeList();

    Notice selectNoticeById(int id);

    void insertNotice(Notice notice);

    void updateNotice(Notice notice);
}
