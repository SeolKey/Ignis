import React from 'react';
import { Card } from 'antd';
import testImage from '../../assets/testImage.png';

const toImageUrl = (p) => {
  if (!p) return testImage;
  if (/^https?:\/\//i.test(p)) return p;
  const backendBase = window.location.origin.includes(':5173')
    ? 'http://localhost'
    : window.location.origin;
  const path = String(p).startsWith('/') ? p : `/${p}`;
  return `${backendBase}${encodeURI(path)}`;
};

export default function HomeCard({ item, onClick, type }) {
  const title = item.title ?? item.name ?? `${type} 프로젝트`;
  const image = toImageUrl(item.imagePath ?? item.thumbnailUrl ?? item.imageUrl);
  const id =
    item.fundingId ?? item.donationId ?? item.volunteerId ?? item.id ?? item.postId ?? item.projectId;

  return (
    <div
      className={`grid-card ${type === '펀딩' ? 'funding-card' : type === '봉사' ? 'volunteer-card' : 'donation-card'}`}
      role="button"
      onClick={() => onClick?.(id)}
    >
      <img
        src={image}
        alt={title}
        className="grid-image"
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.src.includes(testImage)) e.currentTarget.src = testImage;
        }}
      />
      <div className="grid-body">
        <p className="grid-title">{title}</p>
        {type === '펀딩' && (item.maxPrice != null || item.currentPrice != null) && (
          <p className="grid-sub">
            {item.currentPrice != null && <>현재 {Number(item.currentPrice).toLocaleString()}원</>}
            {item.maxPrice != null && <> · 목표 {Number(item.maxPrice).toLocaleString()}원</>}
          </p>
        )}
      </div>
    </div>
  );
}
