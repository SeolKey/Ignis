import React from 'react';
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

const getDdayText = (endRaw) => {
  if (!endRaw) return null;
  const end = new Date(endRaw);
  if (isNaN(end.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return '오늘 마감';
  return '마감된 봉사';
};

export default function HomeCard({ item, onClick, type }) {
  if (!item) return null;

  // type: "donation"/"volunteer"/"funding" 또는 "기부"/"봉사"/"펀딩"
  const t = (type || item.type || '').toString().toLowerCase();
  const isDonation = t.includes('donation') || t.includes('기부');
  const isVolunteer = t.includes('volunteer') || t.includes('봉사');
  const isFunding = t.includes('funding') || t.includes('펀딩');

  const title =
    item.title ??
    item.name ??
    (isDonation
      ? '기부 프로젝트'
      : isVolunteer
      ? '봉사 프로젝트'
      : isFunding
      ? '펀딩 프로젝트'
      : 'IGNIS 프로젝트');

  const image = toImageUrl(item.imagePath ?? item.thumbnailUrl ?? item.imageUrl);

  const id =
    item.donationId ??
    item.volunteerId ??
    item.fundingId ??
    item.id ??
    item.postId ??
    item.projectId;

  // ---- 타입별 텍스트 ----
  let subText = '';

  // 1) 기부: 누적 기부금 (Donation.currentPrice 사용)
  if (isDonation) {
    if (item.currentPrice != null) {
      subText = `누적 기부금 ${Number(item.currentPrice).toLocaleString()}원`;
    }
  }

  // 2) 봉사: endTime 기준 D-day
  if (isVolunteer) {
    const dday = getDdayText(item.endTime);
    if (dday) subText = dday;
  }

  // 3) 펀딩: 현재/목표/달성률
  if (isFunding) {
    const current = Number(item.currentPrice ?? 0);
    const max = Number(item.maxPrice ?? 0);

    if (max > 0) {
      const rate = Math.min(100, Math.round((current / max) * 100));
      const left = Math.max(0, 100 - rate);
      subText = `현재 ${current.toLocaleString()}원 / 목표 ${max.toLocaleString()}원 · 달성률 ${rate}% · 목표까지 ${left}% 남음`;
    } else if (current > 0) {
      subText = `현재 ${current.toLocaleString()}원 참여`;
    }
  }

  const cardClass = isFunding
    ? 'funding-card'
    : isVolunteer
    ? 'volunteer-card'
    : 'donation-card';

  return (
    <div
      className={`grid-card ${cardClass}`}
      role="button"
      onClick={() => onClick?.(id)}
    >
      <img
        src={image}
        alt={title}
        className="grid-image"
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.src.includes(testImage)) {
            e.currentTarget.src = testImage;
          }
        }}
      />
      <div className="grid-body">
        <p className="grid-title">{title}</p>
        {subText && <p className="grid-sub">{subText}</p>}
      </div>
    </div>
  );
}
