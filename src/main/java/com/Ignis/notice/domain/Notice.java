package com.Ignis.notice.domain;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.ToString;

@ToString 
@Data // 따로 Getter Setter 만들어주는 친구
public class Notice {
	private int noticeId;
	private int userId;
	private String title;
	private String content;
	private String imagePath;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
