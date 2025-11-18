import React, { useEffect, useState } from "react";
import { Layout, Menu, Input, Button, Space, Typography, Select, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SearchOutlined, UserOutlined, LogoutOutlined, LoginOutlined, FunnelPlotOutlined } from "@ant-design/icons";
import IgnisLogo from "../assets/IgnisLogo.png";
import "../styles/components/Header.css";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "donation", label: "기부" },
  { value: "volunteer", label: "봉사" },
  { value: "funding", label: "펀딩" },
  { value: "post", label: "게시글" },
  { value: "notice", label: "공지" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);      // ✅ 관리자 여부
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("");

  const selectedKey =
    location.pathname.startsWith("/donation") ? "donation" :
    location.pathname.startsWith("/volunteer") ? "volunteer" :
    location.pathname.startsWith("/funding") ? "funding" :
    location.pathname.startsWith("/board") ? "board" : "home";

  const loadMe = async () => {
    try {
      const res = await fetch("/user/me", { credentials: "include" });
      if (!res.ok) {
        setUsername(null);
        setIsAdmin(false);
        return;
      }
      const data = await res.json();
      const name = data?.userName ?? data?.username ?? null;
      const isAuthed = data?.authenticated ?? !!name;

      if (!isAuthed) {
        setUsername(null);
        setIsAdmin(false);
        return;
      }

      setUsername(name);

      // ✅ role 기반 관리자 판별 (admin / ADMIN / ROLE_ADMIN 다 커버)
      const role = (data?.role ?? "").toString().toLowerCase();
      const admin = role === "admin" || role === "role_admin";
      setIsAdmin(admin);
    } catch {
      setUsername(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    loadMe();
    const onAuthChanged = () => loadMe();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "POST", credentials: "include" });
      setUsername(null);
      setIsAdmin(false);                  // ✅ 로그아웃 시 관리자 플래그도 초기화
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/");
    } catch {
      message.error("로그아웃에 실패했습니다.");
    }
  };

  const handleSearch = () => {
    const q = searchValue.trim();
    if (!q) return message.info("검색어를 입력해 주세요.");
    const params = new URLSearchParams();
    params.set("q", q);
    if (searchType) params.append("types", searchType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <AntHeader className="ignis-header trendy">
      <div className="left-wrap">
        <Link to="/" className="brand" aria-label="IGNIS Home">
          <img src={IgnisLogo} alt="IGNIS" />
        </Link>

        <Menu mode="horizontal" theme="light" selectedKeys={[selectedKey]} className="menu">
          <Menu.Item key="home"><Link to="/">홈</Link></Menu.Item>
          <Menu.Item key="donation"><Link to="/donation-list">기부</Link></Menu.Item>
          <Menu.Item key="volunteer"><Link to="/volunteer">봉사</Link></Menu.Item>
          <Menu.Item key="funding"><Link to="/funding">펀딩</Link></Menu.Item>
          <Menu.SubMenu key="board" title="게시판">
            <Menu.Item key="board-free"><Link to="/board/free">후기 게시판</Link></Menu.Item>
            <Menu.Item key="board-notice"><Link to="/board/notice">공지사항</Link></Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </div>

      {/* 오른쪽: 카테고리 드롭다운 + 검색 + 관리자 버튼 */}
      <div className="right-wrap">
        <div className="header-search-shell">
          <Select
            className="header-type-select trendy"
            value={searchType}
            onChange={setSearchType}
            placeholder="전체"
            options={TYPE_OPTIONS}
            suffixIcon={<FunnelPlotOutlined />}
            size="large"
            dropdownStyle={{ padding: 8, borderRadius: 12 }}
            popupClassName="header-type-dropdown"
            allowClear
            style={{ width: 140 }}
          />

          <Input
            size="large"
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="검색어를 입력하세요"
            prefix={<SearchOutlined />}
            className="header-search-input trendy"
            aria-label="검색어 입력"
          />

          <Button size="large" type="primary" onClick={handleSearch} className="header-search-btn">
            검색
          </Button>

          {/* ✅ 관리자일 때만 검색 오른쪽에 표시 */}
          {isAdmin && (
            <Button
              size="large"
              type="default"
              className="admin-btn"
              style={{ marginLeft: 8 }}
              onClick={() => {
                window.location.href = "/admin/main";
              }}
            >
              관리자 페이지
            </Button>
          )}
        </div>

        {username ? (
          <Space size={12} className="auth-zone">
            <Text className="hello">
              <UserOutlined style={{ marginRight: 6 }} />
              {username}님
            </Text>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-btn"
            >
              로그아웃
            </Button>
          </Space>
        ) : (
          <Button type="text" icon={<LoginOutlined />} className="login-btn">
            로그인
          </Button>
        )}
      </div>
    </AntHeader>
  );
}
