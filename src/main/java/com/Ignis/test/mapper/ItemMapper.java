package com.Ignis.test.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.Ignis.test.domain.Item;

@Mapper
public interface ItemMapper {
	public List<Item> selectItemList();
}
