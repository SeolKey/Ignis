import React, { useMemo } from 'react';
import { Button, Tag } from 'antd';
import { ExclamationCircleOutlined, FireOutlined, AlertOutlined } from '@ant-design/icons';

export default function EmergencyBanner({
  ribbon = '긴급',
  severity = 'red',        // 'red' | 'orange' | 'yellow'
  title,                   
  subtitle,                // 서브 카피 (있으면 사용)
  ctaText = '자세히 보기',
  onClickCta,
  endAt,                   // 남은 시간 표기용 (옵션)
  count,                   // 긴급 항목 개수(옵션) → 'N건 진행 중' 배지
}) {
  const color = useMemo(() => {
    switch (severity) {
      case 'orange': return '#fa8c16';
      case 'yellow': return '#fadb14';
      default: return '#ff4d4f';
    }
  }, [severity]);

  const remain = useMemo(() => {
    if (!endAt) return null;
    const ms = new Date(endAt).getTime() - Date.now();
    if (!isFinite(ms) || ms <= 0) return '마감 임박';
    const h = Math.floor(ms / 1000 / 60 / 60);
    const d = Math.floor(h / 24);
    if (d >= 1) return `${d}일 남음`;
    return `${h}시간 남음`;
  }, [endAt]);

  // 통일 카피(백엔드 타이틀 없으면 이걸 사용)
  const headline = title || '긴급 도움이 필요합니다';
  const subcopy  = subtitle || '지금 가장 시급한 곳에 손을 보태주세요.';

  return (
    <div
      className="emg-banner"
      style={{
        // 통일 배경 (이미지 사용 안 함)
        background:
          'radial-gradient(1200px 400px at -10% -40%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%),' +
          'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.78) 60%, rgba(0,0,0,0.72) 100%)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        position: 'relative',
        padding: '44px 28px',
        minHeight: 170,
      }}
    >
      {/* 상단 리본 / 진행건수 / 남은시간 */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <Tag color={color} style={{ fontWeight: 700 }}>
          <FireOutlined /> {ribbon}
        </Tag>
        {typeof count === 'number' && count > 1 && (
          <Tag style={{ fontWeight: 600 }}>
            {count}건 진행 중
          </Tag>
        )}
        {remain && <Tag>{remain}</Tag>}
      </div>

      {/* 본문 */}
      <div style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: 0.2 }}>
          <ExclamationCircleOutlined style={{ marginRight: 8, color }} />
          {headline}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.55 }}>
          {subcopy}
        </p>

        <div style={{ marginTop: 6 }}>
          <Button
            size="large"
            type="primary"
            onClick={onClickCta}
            icon={<AlertOutlined />}
            style={{
              background: color,
              borderColor: color,
              fontWeight: 700,
            }}
          >
            {ctaText}
          </Button>
        </div>
      </div>

      {/* 하단 강조 바 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          background: color,
          opacity: 0.9,
        }}
      />
    </div>
  );
}
