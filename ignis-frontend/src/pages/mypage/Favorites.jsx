import React from 'react';
import { Card, Empty } from 'antd';

export default function Favorites() {
  return (
    <Card bordered={false} title="관심 프로젝트">
      <Empty description="관심 프로젝트가 없습니다. 프로젝트에서 하트를 눌러 추가해 보세요." />
    </Card>
  );
}
