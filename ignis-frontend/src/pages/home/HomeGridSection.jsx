import React from 'react';
import { Card } from 'antd';
import HomeCard from './HomeCard';

export default function HomeGridSection({ title, items = [], onMore, onClickItem, type }) {
  return (
    <section className="section" style={{ marginTop: 48 }}>
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {onMore && <a onClick={onMore} style={{ cursor: 'pointer' }}>더 보러가기 →</a>}
      </div>

      <div className="card-container card-grid">
        {items.map((item) => (
          <HomeCard
            key={item.fundingId ?? item.donationId ?? item.volunteerId ?? item.id}
            item={item}
            type={type}
            onClick={(id) => onClickItem?.(id)}
          />
        ))}
      </div>
    </section>
  );
}
