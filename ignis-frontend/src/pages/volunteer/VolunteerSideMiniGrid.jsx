import React from 'react';
import SideMiniGrid from '../donation/SideMiniGrid';

// 봉사 리스트는 currentPeople/maxParticipants 비율을 progress로 계산해서 넘김
const mapVolunteerItems = (items = []) =>
  items.map((v, idx) => {
    const id =
      v?.volunteerId ?? v?.id ?? idx;
    const total = Number(v?.maxParticipants || 0);
    const cur = Number(v?.currentPeople || 0);
    const progress =
      total > 0 ? Math.max(0, Math.min(100, Math.round((cur * 100) / total))) : null;
    return {
      ...v,
      id,
      progress,                 // SideMiniGrid가 우측 하단 배지로 표시
      title: v?.title ?? v?.name ?? '봉사',
      imagePath: v?.imagePath ?? v?.thumbnailUrl ?? v?.imageUrl,
    };
  });

export default function VolunteerSideMiniGrid({
  title = '함께 보는',
  items = [],
  onMore,
  onClickItem,
}) {
  return (
    <SideMiniGrid
      title={title}
      type="봉사"
      items={mapVolunteerItems(items)}
      onMore={onMore}
      onClickItem={onClickItem}
    />
  );
}
