import React from 'react';
import SideMiniGrid from '../donation/SideMiniGrid';
const mapFundingItems = (items = []) =>
  items.map((v, idx) => {
    const id = v?.fundingId ?? v?.id ?? idx;
    const cur = Number(v?.currentPrice || 0);
    const max = Number(v?.maxPrice || 0);
    const progress = max > 0 ? Math.max(0, Math.min(100, Math.round((cur * 100) / max))) : null;

    return {
      ...v,
      id,
      title: v?.title ?? v?.name ?? '펀딩',
      imagePath: v?.imagePath ?? v?.thumbnailUrl ?? v?.imageUrl,
      progress,
    };
  });

export default function FundingSideMiniGrid({
  title = '함께 보는',
  items = [],
  onMore,
  onClickItem,
}) {
  return (
    <SideMiniGrid
      title={title}
      type="펀딩"
      items={mapFundingItems(items)}
      onMore={onMore}
      onClickItem={onClickItem}
    />
  );
}
