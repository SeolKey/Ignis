import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Layout, Row, Col, Card, Input, Button, Tag, Typography,
  Pagination, Empty, Space, Spin, Divider, message,
} from "antd";
import {
  SearchOutlined,
  FunnelPlotOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import "../../styles/search/SearchPage.css";


const { Content } = Layout;
const { Title, Text } = Typography;

const PAGE_SIZE_DEFAULT = 12;

// 타입 메타
const TYPE_META = {
  donation:  { color: "blue",   label: "기부" },
  volunteer: { color: "green",  label: "봉사" },
  funding:   { color: "red",    label: "펀딩" },
  post:      { color: "gold",   label: "게시글" },
  notice:    { color: "default",label: "공지" },
};

// React 라우팅 경로(/도메인/:id)
function typeToHref(type, id) {
  switch (type) {
    case "donation":  return `/donation-detail/${id}`;
    case "volunteer": return `/volunteer/${id}`;
    case "funding":   return `/funding/${id}`;
    case "post":      return `/board/free/${id}`;
    case "notice":    return `/board/notice/${id}`;
    default:          return "#";
  }
}

// URL 쿼리 ↔ 상태 (FULLTEXT 제거: q, types, pageUI, size만 유지)
function useQueryState() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const types = sp.getAll("types");
  const pageUI = Math.max(1, parseInt(sp.get("pageUI") ?? "1", 10));
  const size = Math.max(1, parseInt(sp.get("size") ?? String(PAGE_SIZE_DEFAULT), 10));

  const setMany = (obj) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(obj).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        next.delete(k);
        v.forEach((one) => next.append(k, String(one)));
      } else if (v === undefined || v === null || v === "") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSp(next);
  };

  return { q, types, pageUI, size, setMany };
}

// API 호출 (FULLTEXT 파라미터 삭제)
async function fetchSearch({ q, types, page0, size, signal }) {
  const params = new URLSearchParams({
    q: q ?? "",
    page: String(page0 ?? 0),
    size: String(size ?? PAGE_SIZE_DEFAULT),
  });
  (types ?? []).forEach((t) => params.append("types", t));
  const res = await fetch(`/api/search?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json(); // { content, total, page, size }
}

const { CheckableTag } = Tag;

export default function SearchPage() {
  const { q, types, pageUI, size, setMany } = useQueryState();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [inputVal, setInputVal] = useState(q);
  const abortRef = useRef();

  useEffect(() => setInputVal(q), [q]);

  const activeTypes = useMemo(() => new Set(types ?? []), [types]);

  const onToggleType = (typeKey, checked) => {
    const next = new Set(activeTypes);
    checked ? next.add(typeKey) : next.delete(typeKey);
    setMany({ types: Array.from(next), pageUI: 1 });
  };

  const onSearch = () => {
    const nextQ = (inputVal ?? "").trim();
    if (!nextQ) return message.info("검색어를 입력해 주세요.");
    setMany({ q: nextQ, pageUI: 1 });
  };

  const onPageChange = (nextPage, nextSize) => {
    setMany({ pageUI: nextPage, size: nextSize });
  };

  useEffect(() => {
    const page0 = Math.max(0, pageUI - 1);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    fetchSearch({ q, types, page0, size, signal: controller.signal })
      .then((data) => {
        setList(Array.isArray(data?.content) ? data.content : []);
        setTotal(Number.isFinite(data?.total) ? data.total : 0);
        // 서버 보정
        if (Number.isFinite(data?.size) && data.size !== size) {
          setMany({ size: data.size });
        }
        if (Number.isFinite(data?.page) && data.page !== page0) {
          setMany({ pageUI: data.page + 1 });
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error(err);
          message.error("검색 중 오류가 발생했습니다.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, JSON.stringify(types), pageUI, size]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <Layout className="search-layout">
      <Header />

      <Content className="search-content">
        {/* 상단 Hero / 검색바 */}
        <Card className="hero-card" bordered={false}>
          <Row align="middle" gutter={[12, 12]}>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0 }}>통합 검색</Title>
              <Text type="secondary">필요한 정보를 빠르게 찾아보세요.</Text>
            </Col>
            <Col flex="400px">
              <Input
                size="large"
                allowClear
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onPressEnter={onSearch}
                placeholder="제목, 내용, 지역 등을 입력하세요"
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col>
              <Button size="large" type="primary" onClick={onSearch}>
                검색
              </Button>
            </Col>
          </Row>

          <Divider style={{ margin: "16px 0" }} />

          <Row align="middle" gutter={[12, 12]}>
            <Col>
              <Space size={8}>
                <FunnelPlotOutlined />
                <Text strong>필터</Text>
              </Space>
            </Col>
            <Col flex="auto">
              <div className="type-chips">
                {Object.entries(TYPE_META).map(([key, meta]) => (
                  <CheckableTag
                    key={key}
                    checked={activeTypes.has(key)}
                    onChange={(checked) => onToggleType(key, checked)}
                    className={`chip-${key}`}
                  >
                    {meta.label}
                  </CheckableTag>
                ))}
              </div>
            </Col>
          </Row>
        </Card>

        {/* 결과 영역: 결과 유무와 상관없이 넓이/높이 고정 */}
        <div className="result-section">
          {loading ? (
            <div className="loading-box">
              <Spin tip="검색 중..." />
            </div>
          ) : total > 0 ? (
            <>
              <Space size="small" className="result-summary">
                <Text type="secondary">총 <b>{total}</b>건</Text>
                <Text type="secondary">·</Text>
                <Text type="secondary">페이지 <b>{pageUI}</b> / <b>{totalPages}</b></Text>
              </Space>

              <Row gutter={[16, 16]}>
                {list.map((r) => {
                  const meta = TYPE_META[r.type] ?? { color: "default", label: r.type };
                  const href = typeToHref(r.type, r.id);
                  return (
                    <Col xs={24} sm={12} md={12} lg={8} key={`${r.type}-${r.id}`}>
                      <Card
                        hoverable
                        className="result-card"
                        onClick={() => (href !== "#" ? navigate(href) : null)}
                      >
                        {/* 썸네일 */}
                        <div className="thumb">
                          {r.imagePath ? (
                            <img src={r.imagePath} alt="" />
                          ) : (
                            <div className="thumb-empty">No Image</div>
                          )}
                        </div>

                        {/* 본문 */}
                        <div className="card-body">
                          <Tag color={meta.color} className="type-badge">
                            {meta.label}
                          </Tag>

                          <div className="title">
                            <Link to={href} onClick={(e) => e.stopPropagation()}>
                              {r.title}
                            </Link>
                          </div>

                          <div className="snippet" title={r.snippet ?? ""}>
                            {r.snippet ?? ""}
                          </div>

                          <div className="meta">
                            <span>{r.createdAt}</span>
                            {Number.isFinite(r.viewCount) && (
                              <span>{` · 조회 ${r.viewCount}`}</span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <div className="pager">
                <Pagination
                  current={pageUI}
                  pageSize={size}
                  total={total}
                  showSizeChanger
                  showQuickJumper
                  onChange={onPageChange}
                  onShowSizeChange={onPageChange}
                />
              </div>
            </>
          ) : (
            // ✅ 결과가 없어도 동일한 여백/높이를 유지하도록 empty 상태도 박스 채움
            <Card className="empty-card fill">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    해당 조건의 결과가 없습니다.
                    <br />
                    검색어 또는 타입을 변경해보세요.
                  </span>
                }
              />
            </Card>
          )}
        </div>

        <div className="tip">
          <Space>
            <ExclamationCircleOutlined />
            <span>페이지는 UI 기준 1부터 시작하고, 서버는 0부터 시작합니다.</span>
          </Space>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
}
