import React, { useCallback, useEffect, useState } from "react";
import { Card, Typography, Row, Col, Space, Statistic, Checkbox, Button, Table, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import '../../styles/mypage/Dashboard.css';

const { Title, Text } = Typography;

// 포맷 유틸
const fmtNumber = (n) => (n == null ? "-" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
const fmtKRW = (n) => (n == null ? "-" : `${fmtNumber(n)}원`);
const fmtDate = (s) => (s ? s.replace("T", " ").slice(0, 19) : "-");

// 공용 fetch 유틸 (쿠키 포함)
async function fetchJson(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  let data = null;
  try { data = await res.json(); } catch { /* 일부 빈 응답 대비 */ }
  if (!res.ok) {
    if (res.status === 401) message.warning("로그인이 필요합니다.");
    throw new Error(data?.error_message || `HTTP ${res.status}`);
  }
  return data;
}

export default function Dashboard({ user = {} }) {
  // 상단 요약
  const [summary, setSummary] = useState({ totalParticipations: 0, totalDonationAmount: 0, totalFundingAmount: 0 });

  // 상태(체크박스)
  const [onlyPaidDonation, setOnlyPaidDonation] = useState(true);
  const [onlyPaidFunding, setOnlyPaidFunding] = useState(true);

  // 목록/로딩
  const [donations, setDonations] = useState([]);
  const [fundings, setFundings] = useState([]);
  const [loadingDonation, setLoadingDonation] = useState(false);
  const [loadingFunding, setLoadingFunding] = useState(false);

  // 데이터 로더들
  const loadSummary = useCallback(async () => {
    try {
      const s = await fetchJson("/mypage/summary");
      setSummary({
        totalParticipations: s.totalParticipations ?? 0,
        totalDonationAmount: s.totalDonationAmount ?? 0,
        totalFundingAmount: s.totalFundingAmount ?? 0,
      });
    } catch { /* 토스트만으로 충분 */ }
  }, []);

  const loadDonations = useCallback(async (onlyPaid) => {
    setLoadingDonation(true);
    try {
      const rows = await fetchJson(`/mypage/donations?onlyPaid=${onlyPaid}`);
      setDonations(Array.isArray(rows) ? rows : []);
    } catch {
      setDonations([]);
    } finally {
      setLoadingDonation(false);
    }
  }, []);

  const loadFundings = useCallback(async (onlyPaid) => {
    setLoadingFunding(true);
    try {
      const rows = await fetchJson(`/mypage/fundings?onlyPaid=${onlyPaid}`);
      setFundings(Array.isArray(rows) ? rows : []);
    } catch {
      setFundings([]);
    } finally {
      setLoadingFunding(false);
    }
  }, []);

  // 최초 로드 (PAID 기본)
  useEffect(() => {
    loadSummary();
    loadDonations(true);
    loadFundings(true);
  }, [loadSummary, loadDonations, loadFundings]);

  // 필터 변경 시 재조회
  useEffect(() => { loadDonations(onlyPaidDonation); }, [onlyPaidDonation, loadDonations]);
  useEffect(() => { loadFundings(onlyPaidFunding); }, [onlyPaidFunding, loadFundings]);

  // ── 테이블 컬럼 (두 표가 같은 너비를 쓰도록 고정) ─────────────────────────
  const TITLE_W = undefined;   // 남은 공간 자동
  const AMOUNT_W = 120;
  const STATUS_W = 120;
  const DATE_W = 200;

  const baseColumns = [
    { title: "제목", dataIndex: "title", key: "title", width: TITLE_W, ellipsis: true,
      render: (v, r) => v ?? r.projectTitle ?? r.name ?? "-" },
    { title: "금액", dataIndex: "amount", key: "amount", width: AMOUNT_W, align: "right",
      render: (v, r) => fmtKRW(v ?? r.price ?? r.paidAmount) },
    { title: "상태", dataIndex: "status", key: "status", width: STATUS_W, align: "center",
      render: (v, r) => v ?? r.state ?? "-" },
    { title: "일시", dataIndex: "createdAt", key: "createdAt", width: DATE_W,
      render: (v, r) => fmtDate(v ?? r.time ?? r.dateTime) },
  ];

  const donationColumns = baseColumns;
  const fundingColumns  = baseColumns;

  //시간대별 맞춤 인사
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "좋은 아침이에요";
    if (h < 18) return "즐거운 오후 보내세요";
    return "편안한 저녁 되세요";
  };

  //랜덤 명언/응원 문구
  const messages = [
    "작은 나눔이 큰 희망을 만듭니다.",
    "오늘도 당신의 선행에 감사드립니다 🙏",
    "세상을 바꾸는 건 바로 여러분의 참여예요!",
  ];
  const [quote] = useState(messages[Math.floor(Math.random() * messages.length)]);

  return (
    <>
      {/* 인사/요약 */}
      <div className="greeting-bar">
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            {getGreeting()}, {user.name || user.userName || "사용자"}님! 👋
          </Title>
          <Text type="secondary">{quote}</Text>
          <br />
          <Text type="secondary">
            {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card" bordered={false}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">총 참여 수</Text>
              <Title level={2} style={{ margin: 0 }}>{fmtNumber(summary.totalParticipations)}건</Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card" bordered={false}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">총 기부 내역</Text>
              <Statistic value={summary.totalDonationAmount} prefix="₩" valueStyle={{ fontSize: 28 }} />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card" bordered={false}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">총 펀딩 내역</Text>
              <Statistic value={summary.totalFundingAmount} prefix="₩" valueStyle={{ fontSize: 28 }} />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 기부 내역 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div className="section-head">
          <div className="section-left">
            <Title level={3} style={{ margin: 0 }}>기부 내역</Title>
            <Checkbox
              checked={onlyPaidDonation}
              onChange={(e) => setOnlyPaidDonation(e.target.checked)}
            >
              PAID만 보기
            </Checkbox>
          </div>
          <div className="section-right">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadDonations(onlyPaidDonation)}
              loading={loadingDonation}
            >
              새로고침
            </Button>
          </div>
        </div>

        <Table
          rowKey={(r, i) => r.id ?? r.paymentId ?? `don-${i}`}
          columns={donationColumns}
          dataSource={donations}
          loading={loadingDonation}
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: AMOUNT_W + STATUS_W + DATE_W + 300 }}
        />
      </Card>

      {/* 펀딩 내역 */}
      <Card bordered={false}>
        <div className="section-head">
          <div className="section-left">
            <Title level={3} style={{ margin: 0 }}>펀딩 내역</Title>
            <Checkbox
              checked={onlyPaidFunding}
              onChange={(e) => setOnlyPaidFunding(e.target.checked)}
            >
              PAID만 보기
            </Checkbox>
          </div>
          <div className="section-right">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadFundings(onlyPaidFunding)}
              loading={loadingFunding}
            >
              새로고침
            </Button>
          </div>
        </div>

        <Table
          rowKey={(r, i) => r.id ?? r.paymentId ?? `fund-${i}`}
          columns={fundingColumns}
          dataSource={fundings}
          loading={loadingFunding}
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: AMOUNT_W + STATUS_W + DATE_W + 300 }}
        />
      </Card>
    </>
  );
}
