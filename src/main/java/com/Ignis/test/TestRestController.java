package com.Ignis.test;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Ignis.test.bo.ItemBO;
import com.Ignis.test.domain.Item;

@RestController
public class TestRestController {
	
	@Autowired
	private ItemBO itemBO; // DI: 스프링 빈 주입
	
	// http://localhost/lesson02/ex01
	@RequestMapping("/test01")
	public List<Item> ex01() {
		return itemBO.getItemList(); // response => JSON
	}
	
}