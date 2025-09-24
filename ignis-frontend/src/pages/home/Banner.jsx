import React from 'react';

/** 상단 배너 컴포넌트 (스타일은 Home.css의 .simple-banner 사용) */
export default function Banner({ title, subtitle, subNote }) {
  return (
    <div className="simple-banner">
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      {subNote && <p className="banner-sub">{subNote}</p>}
    </div>
  );
}
