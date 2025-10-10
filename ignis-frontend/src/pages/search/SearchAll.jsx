import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Input,
  Row,
  Col,
  Segmented,
  Select,
  List,
  Tag,
  Typography,
  Space,
  Button,
  Empty,
  Skeleton,
  Progress,
  Tooltip,
  Pagination,
  message,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FireOutlined,
  FundOutlined,
  HeartOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

export default function SearchAll({
  endpoint = "/search",
  pageSize = 10,
}) {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // ---------- 상태 ----------
  const [query, setQuery] = useState(sp.get("q") || "");
  const [status, setStatus] = useState(sp.get("status") || "ALL"); // ALL | PROGRESS | DONE
  const [sort, setSort] = useState(sp.get("sort") || "LATEST");    // LATEST | POP | TARGET
  const [type, setType] = useState(sp.get("type") || "all");       // all | donation | funding | volunteer
  const [page, setPage] = useState(Number(sp.get("page") || 1));
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const abortRef = useRef(null);
  const debRef = useRef(null);

  // ---------- 유틸 ----------
  const fmtNumber = (n) =>
    n == null ? "-" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fmtKRW = (n) => (n == null ? "-" : `₩${fmtNumber(n)}`);
  const fmtDate = (s) => (s ? s.replace("T", " ").slice(0, 19) : "-");

  const ratio = (cur, max) => {
    if (!cur || !max) return 0;
    const p = Math.min(100, Math.round((cur / max) * 100));
    return Number.isFinite(p) ? p : 0;
  };

  const pushURL = () => {
    const params = new URLSearchParams({
      q: query || "",
      status,
      sort,
      type,
      page: String(page),
    });
    setSp(params, { replace: true });
  };

  const normalizeType = (raw) => {
    const s = (raw || "").toString().toLowerCase();
    if (s.includes("fund")) return "funding";
    if (s.includes("donat") || s.includes("donation")) return "donation";
    if (s.includes("volun")) return "volunteer";
    if (s === "all" || !s) return "all";
    return s; // 이미 정확한 값일 수 있음
  };

  // Detail 링크 생성 (프로젝트 경로에 맞게 필요 시 수정)
  const linkTo = (t, id) => {
    const tp = normalizeType(t);
    const key = id ?? "";
    if (tp === "donation") return `/donation/${key}`;
    if (tp === "funding") return `/funding/${key}`;
    if (tp === "volunteer") return `/volunteer/${key}`;
    // fallback: 타입 감지 실패 시 펀딩으로
    return `/funding/${key}`;
  };

  // ---------- 검색 호출 ----------
  const doSearch = async (silent = false) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const qs = new URLSearchParams({
      q: query,
      status,
      sort,
      type,
      page: String(page - 1), // 0-based
      size: String(pageSize),
    }).toString();

    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${endpoint}?${qs}`, {
        credentials: "include",
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));

      const list = Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];

      setItems(list);
      setTotal(
        Number(
          data?.total ??
            data?.totalCount ??
            data?.totalElements ??
            data?.count ??
            list.length
        )
      );
    } catch (e) {
      if (e.name !== "AbortError") {
        console.warn(e);
        message.error("검색 중 오류가 발생했어요.");
        setItems([]);
        setTotal(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ---------- 초기 & 파라미터 변경 ----------
  useEffect(() => {
    pushURL();
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => doSearch(), 220);
    return () => clearTimeout(debRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, sort, type, page]);

  // ---------- 렌더 도우미 ----------
  const TypeBadge = ({ t }) => {
    const tp = normalizeType(t);
    if (tp === "donation")
      return <Tag icon={<HeartOutlined />} color="magenta">기부</Tag>;
    if (tp === "funding")
      return <Tag icon={<FundOutlined />} color="blue">펀딩</Tag>;
    if (tp === "volunteer")
      return <Tag icon={<TeamOutlined />} color="green">봉사</Tag>;
    return <Tag color="default">기타</Tag>;
  };

  const StatusTag = ({ v }) => {
    const val = (v || "").toString().toUpperCase();
    if (val.includes("PROGRESS") || val.includes("ONGOING"))
      return <Tag color="processing">진행중</Tag>;
    if (val.includes("DONE") || val.includes("END") || val.includes("CLOSE"))
      return <Tag color="default">종료</Tag>;
    if (val.includes("PAID") || val.includes("SUCCESS"))
      return <Tag color="success">완료</Tag>;
    return <Tag>상태없음</Tag>;
  };

  // 카드 1개
  const ResultCard = ({ item }) => {
    const t =
      normalizeType(item?.type || item?.category || item?.domain || type);
    const id = item?.id ?? item?.fundingId ?? item?.donationId ?? item?.volunteerId ?? item?.docId;
    const title =
      item?.title ?? item?.projectTitle ?? item?.name ?? "(제목 없음)";
    const desc = item?.description ?? item?.content ?? "";
    const thumb =
      item?.thumbnailPath || item?.imagePath || item?.cover || null;

    // 금액/목표는 펀딩/기부에서만 의미 있음(있으면 출력)
    const cur =
      item?.currentPrice ??
      item?.current_amount ??
      item?.paidAmount ??
      item?.sumAmount;
    const max =
      item?.maxPrice ??
      item?.target ??
      item?.goalAmount ??
      item?.targetAmount;

    const p = ratio(cur, max);
    const views = item?.viewCount ?? item?.views ?? null;
    const st = item?.status ?? item?.state ?? "";
    const created = item?.createdAt ?? item?.time ?? item?.dateTime ?? "";

    return (
      <Card
        className="search-all-card"
        bordered={false}
        bodyStyle={{ padding: 16 }}
        style={{
          borderRadius: 14,
          border: "1px solid #eef2f8",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(255,255,255,0.98))",
          boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
        }}
      >
        <Row gutter={16} align="middle">
          {/* 썸네일 */}
          <Col xs={24} sm={7} md={6} lg={5}>
            <div
              style={{
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: 10,
                overflow: "hidden",
                background: "#f4f6fb",
                display: "grid",
                placeItems: "center",
              }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              ) : t === "donation" ? (
                <HeartOutlined style={{ fontSize: 28, opacity: 0.35 }} />
              ) : t === "funding" ? (
                <FundOutlined style={{ fontSize: 28, opacity: 0.35 }} />
              ) : (
                <TeamOutlined style={{ fontSize: 28, opacity: 0.35 }} />
              )}
            </div>
          </Col>

          {/* 본문 */}
          <Col xs={24} sm={17} md={12} lg={13}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Space wrap align="start">
                <Title level={5} style={{ margin: 0, letterSpacing: "-0.2px" }}>
                  {title}
                </Title>
                <TypeBadge t={t} />
                <StatusTag v={st} />
                {views != null && (
                  <Tag icon={<EyeOutlined />} color="blue">
                    {fmtNumber(views)}
                  </Tag>
                )}
              </Space>

              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2, tooltip: desc }}
                style={{ marginBottom: 6 }}
              >
                {desc || "설명이 없습니다."}
              </Paragraph>

              {(cur != null || max != null) && (
                <div>
                  <Space split={<span style={{ opacity: 0.4 }}>·</span>}>
                    <Text strong>{fmtKRW(cur || 0)}</Text>
                    {max != null && <Text type="secondary">/ {fmtKRW(max)}</Text>}
                    <Text type="secondary">{p}% 달성</Text>
                  </Space>
                  <Progress
                    percent={p}
                    showInfo={false}
                    strokeWidth={8}
                    style={{ marginTop: 6 }}
                  />
                </div>
              )}

              {created && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <FieldTimeOutlined /> {fmtDate(created)}
                </Text>
              )}
            </Space>
          </Col>

          {/* 액션 */}
          <Col xs={24} md={6} lg={6} style={{ textAlign: "right" }}>
            <Space wrap>
              <Button type="primary" onClick={() => navigate(linkTo(t, id))}>
                상세 보기
              </Button>
              <Tooltip title="관심 등록">
                <Button icon={<FireOutlined />} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  // ---------- 상단 컨트롤 바 ----------
  const Controls = useMemo(
    () => (
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          border: "1px solid #eef2f8",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.96))",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          marginBottom: 16,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12} lg={12}>
            <Input
              allowClear
              size="large"
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              onPressEnter={() => doSearch()}
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="제목·작성자·설명으로 통합 검색"
            />
          </Col>

          <Col xs={12} sm={8} md={5} lg={5}>
            <Segmented
              block
              value={sort}
              onChange={(v) => {
                setPage(1);
                setSort(v);
              }}
              options={[
                { label: "최신순", value: "LATEST" },
                { label: "조회순", value: "POP" },
                { label: "목표액", value: "TARGET" },
              ]}
            />
          </Col>

          <Col xs={12} sm={8} md={4} lg={4}>
            <Select
              value={status}
              onChange={(v) => {
                setPage(1);
                setStatus(v);
              }}
              style={{ width: "100%" }}
              options={[
                { label: "상태: 전체", value: "ALL" },
                { label: "진행중", value: "PROGRESS" },
                { label: "종료/완료", value: "DONE" },
              ]}
            />
          </Col>

          <Col xs={12} sm={8} md={5} lg={4}>
            <Segmented
              block
              value={type}
              onChange={(v) => {
                setPage(1);
                setType(v);
              }}
              options={[
                { label: "전체", value: "all" },
                { label: "기부", value: "donation" },
                { label: "펀딩", value: "funding" },
                { label: "봉사", value: "volunteer" },
              ]}
            />
          </Col>

          <Col xs={24} sm={24} md={6} lg={3} style={{ textAlign: "right" }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => doSearch()}>
                새로고침
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, sort, status, type]
  );

  return (
    <div style={{ padding: "24px 0" }}>
      <Space direction="vertical" size={4} style={{ width: "100%", marginBottom: 8 }}>
        <Title level={3} style={{ margin: 0 }}>통합 검색</Title>
        <Text type="secondary">기부·펀딩·봉사 전체를 한 번에 검색하세요.</Text>
      </Space>

      {Controls}

      {/* 결과 리스트 */}
      <List
        dataSource={loading ? Array.from({ length: 5 }, (_, i) => i) : items}
        locale={{
          emptyText: loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : (
            <Empty
              description={
                <>
                  <div>검색 결과가 없습니다.</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    검색어·필터를 조정해 다시 시도해 보세요.
                  </Text>
                </>
              }
            />
          ),
        }}
        renderItem={(it, idx) => (
          <List.Item style={{ padding: 0, border: "none", marginBottom: 12 }}>
            {loading ? (
              <Card bordered={false} style={{ borderRadius: 14, marginBottom: 4 }}>
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              </Card>
            ) : (
              <ResultCard item={it} key={it?.id ?? idx} />
            )}
          </List.Item>
        )}
      />

      {/* 페이지네이션 */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Pagination
          current={page}
          total={total}
          pageSize={pageSize}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}
