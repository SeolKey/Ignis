import React from 'react';

const toImageUrl = (p) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const base = window.location.origin.includes(':5173')
    ? 'http://localhost'
    : window.location.origin;
  const path = String(p).startsWith('/') ? p : `/${p}`;
  return `${base}${encodeURI(path)}`;
};

export default function SideMiniGrid({ title, items = [], type = '기부', onMore, onClickItem }) {
  return (
    <section className="donation-side-section">
      <div className="donation-side-head">
        <h3 className="donation-side-title">
          {title}{' '}
          <span className="donation-side-accent">{type}</span>
        </h3>
        {onMore && (
          <button className="donation-side-more" onClick={onMore} type="button">
            더보기 ›
          </button>
        )}
      </div>

      <div className="donation-side-grid">
        {items.map((it, idx) => {
          const id = it?.donationId ?? it?.fundingId ?? it?.volunteerId ?? it?.id ?? idx;
          const title = it?.title ?? it?.name ?? `${type} 프로젝트`;
          const img = toImageUrl(it?.imagePath ?? it?.thumbnailUrl ?? it?.imageUrl);
          return (
            <div
              key={id}
              className="donation-mini-card"
              role="button"
              onClick={() => onClickItem?.(id)}
              title={title}
            >
              <div className="donation-mini-thumb-wrap">
                <img
                  src={img}
                  alt={title}
                  className="donation-mini-thumb"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.src = '';
                  }}
                />
                {it?.progress != null && (
                  <div className="donation-mini-progress">
                    {Math.round(it.progress)}%
                  </div>
                )}
              </div>
              <div className="donation-mini-title">{title}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
