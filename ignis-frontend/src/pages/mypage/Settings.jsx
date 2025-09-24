import React from 'react';
import { Card, Descriptions, Switch } from 'antd';

export default function Settings() {
  return (
    <Card bordered={false} title="설정">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="알림 수신"> <Switch defaultChecked /> </Descriptions.Item>
        <Descriptions.Item label="이메일 수신 동의"> <Switch /> </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
