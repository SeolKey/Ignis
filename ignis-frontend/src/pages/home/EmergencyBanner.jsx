import React from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { AlertOutlined, ArrowRightOutlined, FireFilled } from '@ant-design/icons';

/**
 * 긴급 배너
 * - severity: 'critical' | 'warning' | 'info'
 * - title, message: 메인 카피
 * - updatedAt: 마지막 업데이트(문자열)
 * - actions: [{ label, onClick }] 형태(선택)
 * - donateHref / detailHref: CTA 링크(선택)
 */
export default function EmergencyBanner({
  severity = 'critical',
  title = '국가적 재난 안내',
  message = '현재 산불/재난이 발생했습니다. 안전 수칙을 확인하고, 긴급 모금에 참여해주세요.',
  updatedAt,              // e.g. '2025-10-14 17:30'
  donateHref,             // e.g. '/funding/emergency/123'
  detailHref,             // e.g. '/notice/emergency'
  actions = [],
}) {
  const colorMap = {
    critical: '#ff4d4f',
    warning: '#faad14',
    info: '#1677ff',
  };
  const color = colorMap[severity] || colorMap.critical;

  return (
    <div className="emergency-banner" role="region" aria-live="polite">
      <div className="emg-bg" />
      <div className="emg-left">
        <div className="emg-badge">
          <FireFilled />
          <span>긴급 안내</span>
          <Tag color="red" style={{ marginLeft: 8, borderRadius: 999 }}>
            {severity.toUpperCase()}
          </Tag>
        </div>
        <h2 className="emg-title">{title}</h2>
        <p className="emg-desc">{message}</p>
        {updatedAt && (
          <p className="emg-update">마지막 업데이트: <b>{updatedAt}</b></p>
        )}
        <div className="emg-actions">
          {detailHref && (
            <Button
              size="large"
              onClick={() => (window.location.href = detailHref)}
              icon={<AlertOutlined />}
            >
              자세히 보기
            </Button>
          )}
          {donateHref && (
            <Button
              type="primary"
              size="large"
              onClick={() => (window.location.href = donateHref)}
              icon={<ArrowRightOutlined />}
            >
              긴급 모금 참여
            </Button>
          )}
          {actions?.map((a, i) => (
            <Button key={i} size="large" onClick={a.onClick}>{a.label}</Button>
          ))}
        </div>
      </div>

      <div className="emg-right">
        <Tooltip title="안전을 가장 먼저 확인하세요">
          <div className="emg-pulse" style={{ borderColor: color }} />
        </Tooltip>
      </div>
    </div>
  );
}
