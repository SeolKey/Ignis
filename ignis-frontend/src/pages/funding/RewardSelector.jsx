import React, { useMemo, useState } from "react";
import { Card, Typography, Tag, Button, Tooltip, message } from "antd";
import {
  CheckCircleTwoTone,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
} from "@ant-design/icons";
import "../../styles/funding/RewardSelector.css";

const { Title, Text, Paragraph } = Typography;

// 통화 포맷
const won = (n) => Number(n || 0).toLocaleString() + "원";

// 예시 리워드 (백엔드 연동 전까지는 이걸로 표시)
const FALLBACK_REWARDS = [
  {
    id: 1,
    price: 3500,
    title: "[도서 산간 지역 배송비]",
    desc:
      "도서 산간 지역의 경우 본 배송비를 추가해 주셔야 정상적으로 리워드 발송이 가능합니다.",
    shippingLabel: "무료배송",
    startAtText: "2026년 06월 말 (21~말일) 예정",
    limit: 700,
    remaining: 697,
  },
  {
    id: 2,
    price: 189000,
    title: "[얼리버드] 본편 + 한정 스킨 세트",
    desc:
      "정식 출시 전 본편 키 + 한정 스킨 + 디지털 아트북(이름 크레딧 표기 포함) 세트입니다.",
    shippingLabel: "무료배송",
    startAtText: "2026년 06월 말 (21~말일) 예정",
    limit: 300,
    remaining: 112,
  },
  {
    id: 3,
    price: 59000,
    title: "[스탠다드] 본편 + 사운드트랙",
    desc: "본편 키와 공식 OST(디지털) 다운로드 쿠폰이 제공됩니다.",
    shippingLabel: "무료배송",
    startAtText: "2026년 06월 말 (21~말일) 예정",
    limit: 1000,
    remaining: 824,
  },
];

export default function RewardSelector({
  title = "리워드 선택",
  periodText = "진행기간  9.19 ~ 10.3",
  rewards = FALLBACK_REWARDS,
  onSelect,          // (reward) => void
  onShare,           // () => void
  onClickFund,       // (selectedReward) => void
  className,
}) {
  const [liked, setLiked] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(
    () => rewards.find((r) => r.id === selectedId) || null,
    [rewards, selectedId]
  );

  const handleSelect = (r) => {
    setSelectedId(r.id);
    onSelect?.(r);
  };

  const handleFund = () => {
    if (!selected) {
      message.warning("리워드를 먼저 선택해 주세요.");
      return;
    }
    onClickFund?.(selected);
    message.success(`[${selected.title}] 선택됨`);
  };

  return (
    <div className={`reward-wrap ${className || ""}`}>
      <div className="reward-header">
        <Title level={3} className="reward-title">{title}</Title>
        <Text type="secondary" className="reward-period">{periodText}</Text>
      </div>

      {/* 상단 요약 카드 */}
      <Card className="reward-topcard" bordered={false}>
        <div className="reward-toprow">
          <div className="reward-toprow-item">
            <div className="reward-toprow-label">배송비</div>
            <div className="reward-toprow-value">무료배송</div>
          </div>
          <div className="reward-toprow-item">
            <div className="reward-toprow-label">발송 시작일</div>
            <div className="reward-toprow-value">2026년 06월 말 (21~말일) 예정</div>
          </div>
          <div className="reward-toprow-item">
            <div className="reward-toprow-label">제한 수량</div>
            <div className="reward-toprow-value">700개</div>
          </div>
        </div>
      </Card>

      {/* 리워드 리스트 */}
      <div className="reward-list">
        {rewards.map((r) => {
          const isSelected = selectedId === r.id;
          const leftBadge =
            typeof r.remaining === "number" && r.limit
              ? `현재 ${r.remaining}개 남음!`
              : null;

          return (
            <Card
              key={r.id}
              className={`reward-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => handleSelect(r)}
              bordered={false}
              hoverable
            >
              <div className="reward-price-row">
                <Text className="reward-price">{won(r.price)}</Text>
                {leftBadge && (
                  <Tag color="cyan" className="reward-left-badge">{leftBadge}</Tag>
                )}
                {isSelected && (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    className="reward-selected-icon"
                  />
                )}
              </div>

              <div className="reward-title-2">{r.title}</div>
              <Paragraph className="reward-desc">{r.desc}</Paragraph>

              <div className="reward-meta-table">
                <div className="row">
                  <div className="col label">배송비</div>
                  <div className="col value">{r.shippingLabel || "무료배송"}</div>
                </div>
                <div className="row">
                  <div className="col label">발송 시작일</div>
                  <div className="col value">{r.startAtText}</div>
                </div>
                <div className="row">
                  <div className="col label">제한 수량</div>
                  <div className="col value">
                    {typeof r.limit === "number" ? `${r.limit}개` : "-"}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 하단 액션 */}
      <div className="reward-bottom">
        <div className="reward-bottom-left">
          <Tooltip title={liked ? "좋아요 취소" : "좋아요"}>
            <button
              className={`rb-icon ${liked ? "active" : ""}`}
              aria-label="좋아요"
              onClick={() => setLiked((v) => !v)}
            >
              {liked ? <HeartFilled /> : <HeartOutlined />}
              <span className="rb-count">1,190</span>
            </button>
          </Tooltip>

          <Tooltip title="공유하기">
            <button className="rb-icon" aria-label="공유하기" onClick={onShare}>
              <ShareAltOutlined />
              <span className="rb-count">60</span>
            </button>
          </Tooltip>
        </div>

        <Button type="primary" size="large" className="rb-cta" onClick={handleFund}>
          펀딩하기
        </Button>
      </div>
    </div>
  );
}
