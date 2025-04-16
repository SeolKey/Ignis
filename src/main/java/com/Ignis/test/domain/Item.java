package com.Ignis.test.domain;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class Item {
	private int id;
	private String loginId;
	private int userId;
	private String title;
	private int price;
	private String status;
	private String type;
	private String content;
	private LocalDateTime time;
	private String imageUrl;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
