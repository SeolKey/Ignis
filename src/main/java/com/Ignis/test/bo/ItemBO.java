package com.Ignis.test.bo;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.Ignis.test.domain.Item;
import com.Ignis.test.mapper.ItemMapper;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
public class ItemBO {

	@Autowired
	private ItemMapper itemMapper;
	
	public List<Item> getItemList() {
		List<Item> ItemList = itemMapper.selectItemList();
		return ItemList;
	}
}
