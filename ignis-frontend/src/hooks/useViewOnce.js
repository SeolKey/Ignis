import { useEffect, useRef, useState } from "react";

/**
 * 상세 페이지 진입 시 조회수 1회 증가 (중복 방지 쿨다운)
 *
 * @param {Object}   params
 * @param {string|number} params.id            엔티티 ID (필수)
 * @param {"donation"|"volunteer"|"funding"} params.type  엔티티 타입 (필수)
 * @param {number}   [params.cooldownMs=21600000]         중복 방지 시간(ms) 기본 6h
 * @param {string[]} [params.endpoints]                   커스텀 엔드포인트(우선시)
 * @param {(views:number|null)=>void} [params.onUpdated]  서버가 최신 조회수 반환 시 콜백
 */
export default function useViewOnce({
  id,
  type,
  cooldownMs = 6 * 60 * 60 * 1000,
  endpoints,
  onUpdated,
} = {}) {
  const [status, setStatus] = useState("idle"); // idle | skipped | success | error
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!id || !type) return;
    if (didRunRef.current) return;
    didRunRef.current = true;

    // localStorage 키: 타입별로 분리 (예: donation:viewed:123)
    const key = `${type}:viewed:${id}`;
    const now = Date.now();
    const last = Number(localStorage.getItem(key) || 0);

    // 쿨다운 내 재방문이면 스킵
    if (now - last < cooldownMs) {
      setStatus("skipped");
      return;
    }

    // 엔드포인트 후보
    const defaultCandidatesByType = {
      donation: [
        `/donation/api/${id}/view`,
        `/donation/view/${id}`,
        `/api/donation/${id}/view`,
      ],
      volunteer: [
        `/volunteer/api/${id}/view`,
        `/volunteer/view/${id}`,
        `/api/volunteer/${id}/view`,
      ],
      funding: [
        `/funding/api/${id}/view`,
        `/funding/view/${id}`,
        `/api/funding/${id}/view`,
      ],
    };

    const candidates = Array.isArray(endpoints) && endpoints.length > 0
      ? endpoints
      : defaultCandidatesByType[type] || [];

    if (candidates.length === 0) {
      setStatus("error");
      return;
    }

    (async () => {
      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (!res.ok) continue;

          // 성공 처리
          localStorage.setItem(key, String(now));
          setStatus("success");

          // 서버가 최신 조회수(JSON) 주면 UI에 반영
          let data = null;
          try { data = await res.json(); } catch  {
            //
          }
          const views =
            data && typeof data.views === "number"
              ? data.views
              : data && typeof data.viewCount === "number"
              ? data.viewCount
              : null;

          if (views != null && typeof onUpdated === "function") {
            onUpdated(views);
          }
          return;
        } catch {
          // 다음 후보 계속 시도
        }
      }
      // 전부 실패
      setStatus("error");
    })();
  }, [id, type, cooldownMs, endpoints, onUpdated]);

  return status;
}
