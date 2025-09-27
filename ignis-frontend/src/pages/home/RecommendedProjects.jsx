import React from 'react';

export default function RecommendedProjects({
  title = '추천 프로젝트',
  items = [],
  onClickItem,
  fallbackImage,
  showTypeTag = false,
}) {
  const list =
    Array.isArray(items) && items.length > 0
      ? items
      : [
          { key: 's1', id: 's1', title: '🔥 인기 프로젝트 1', image: fallbackImage },
          { key: 's2', id: 's2', title: '💡 추천 프로젝트 2', image: fallbackImage },
          { key: 's3', id: 's3', title: '🎨 창작 프로젝트 3', image: fallbackImage },
          { key: 's4', id: 's4', title: '🌱 환경 프로젝트 4', image: fallbackImage },
          { key: 's5', id: 's5', title: '📚 교육 프로젝트 5', image: fallbackImage },
          { key: 's6', id: 's6', title: '⚡ 기술 프로젝트 6', image: fallbackImage },
        ];

  return (
    <>
      <h3 className="recommend-title">{title}</h3>
      <ul className="recommend-list">
        {list.map((it, idx) => (
          <li
            key={it.key ?? it.id ?? `rec-${idx}`}
            className="recommend-item"
            onClick={() => onClickItem?.(it)}
          >
            <img src={it.image || fallbackImage} alt={it.title} />
            <p>
              {showTypeTag && it.type && <span className="rec-type">{it.type}</span>} {it.title}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
