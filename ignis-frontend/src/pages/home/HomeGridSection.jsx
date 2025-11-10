import React from 'react';
import HomeCard from './HomeCard';

export default function HomeGridSection({
  title,
  items = [],
  onMore,
  onClickItem,
  type,
}) {
  // 안전하게 배열만 사용
  const list = Array.isArray(items) ? items : [];

  return (
    <section className="section" style={{ marginTop: 48 }}>
      {/* 섹션 타이틀 + 더보기 */}
      <div
        className="top-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>
        {onMore && (
          <a
            onClick={onMore}
            style={{ cursor: 'pointer', fontSize: 14 }}
          >
            더 보러가기 →
          </a>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="card-container card-grid">
        {list.map((item, idx) => {
          if (!item) return null;

          const key =
            item.fundingId ??
            item.donationId ??
            item.volunteerId ??
            item.id ??
            item.postId ??
            item.projectId ??
            `${type || 'home'}-${idx}`;

          return (
            <HomeCard
              key={key}
              item={item}
              type={type}
              onClick={(id) => onClickItem?.(id)}
            />
          );
        })}
      </div>
    </section>
  );
}
