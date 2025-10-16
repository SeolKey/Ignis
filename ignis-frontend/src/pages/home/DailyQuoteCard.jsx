import React, { useMemo } from 'react';
import { Card, Typography, Space } from 'antd';
import { FireOutlined, HeartTwoTone } from '@ant-design/icons';

const { Text } = Typography;

// 하루에 하나씩 고정되도록 날짜 기반 인덱스
function getDailyIndex(len) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  // 간단한 해시 느낌
  const seed = Number(`${y}${m.toString().padStart(2, '0')}${d.toString().padStart(2, '0')}`);
  return seed % len;
}

const QUOTES = [
  { text: '작은 불꽃이 큰 희망을 밝힙니다.', author: 'IGNIS' },
  { text: '우리가 나누는 만큼, 세상은 따뜻해진다.', author: 'IGNIS' },
  { text: '선한 의도는 행동으로 완성된다.', author: 'Anonymous' },
  { text: '오늘의 작은 선택이 내일의 변화를 만든다.', author: 'IGNIS' },
  { text: '가장 어두운 밤도 별을 이기지 못한다.', author: '위로의 문장' },
  { text: '누군가의 시작이 되자. 불씨는 전염된다.', author: 'IGNIS' },
  { text: '희망은 준비된 사람에게 미소 짓는다.', author: 'Anonymous' },
  { text: '작은 실천이 모여 거대한 변화를 만든다.', author: 'IGNIS' },
  { text: '선한 의심은 검증이 되고, 선한 의지는 참여가 된다.', author: 'IGNIS' },
  { text: '가장 멀게 느껴지는 변화도 한 걸음에서 시작된다.', author: 'Anonymous' },
];

export default function DailyQuoteCard({ className }) {
  const quote = useMemo(() => {
    const idx = getDailyIndex(QUOTES.length);
    return QUOTES[idx];
  }, []);

  return (
    <Card
      bordered={false}
      className={['daily-quote-card', className].filter(Boolean).join(' ')}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="dq-head">
          <FireOutlined />
          <span> 오늘의 작은 불꽃</span>
        </div>
        <div className="dq-quote">
          <Text className="dq-text">“{quote.text}”</Text>
          <Text type="secondary" className="dq-author">
            <HeartTwoTone twoToneColor="#ff4d4f" /> {quote.author}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
