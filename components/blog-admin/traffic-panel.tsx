"use client";
import { useEffect, useState } from "react";
import { chartPoints, collectedDays } from "@/lib/traffic/chart";
import type { Counts } from "@/lib/traffic/schema";
import styles from "./traffic-panel.module.css";
type Report = { collectionStatus?: "disabled" | "blocked" | "configured"; total: Counts; allTime: Counts; trend: ({date: string} & Counts)[]; startedAt: string | null; updatedAt: string };
const colors = { visits: "#163cff", pageViews: "#0284a8", blogOpens: "#bd6409", reads: "#8754c7" };
const labels: Record<keyof Counts, string> = { visits: "Lượt ghé website", pageViews: "Lượt xem trang", blogOpens: "Lượt mở blog", reads: "Đã đọc có tương tác" };
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const points = chartPoints(values, 160, 38);
  return <svg viewBox="-3 -3 166 44" aria-hidden="true" className={styles.spark}>
    {points.length > 1 && <polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke"/>}
    {points.length === 1 && <circle cx={points[0].x} cy={points[0].y} r="3" fill={color}/>}
  </svg>;
}
export function TrafficPanel() {
  const [days, setDays] = useState(7), [retry, setRetry] = useState(0);
  const [state, setState] = useState<{ report?: Report; error?: boolean; days: number }>({ days: 0 });
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController(), timer = window.setTimeout(() => controller.abort(), 10000);
    void fetch(`/api/traffic?days=${days}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("unavailable");
      const report: Report = await response.json();
      if (!controller.signal.aborted) setState({ report, days });
    }).catch(() => { if (!disposed) setState({ error: true, days }); }).finally(() => window.clearTimeout(timer));
    return () => { disposed = true; controller.abort(); window.clearTimeout(timer); };
  }, [days, retry]);
  const report = state.days === days ? state.report : undefined, error = state.days === days && state.error;
  const [selectedDay, setSelectedDay] = useState<string>();
  const rows = collectedDays(report?.trend ?? [], report?.startedAt ?? null);
  const keys = Object.keys(labels) as (keyof Counts)[];
  const maximum = Math.max(1, ...rows.flatMap(row => keys.map(key => row[key])));
  const activeIndex = rows.some(row => row.date === selectedDay) ? rows.findIndex(row => row.date === selectedDay) : Math.max(0, rows.length - 1);
  const active = rows[activeIndex];
  const format = (value: number) => new Intl.NumberFormat("vi").format(value);
  return <section className={styles.panel} aria-label="Thống kê truy cập">
    <div className={styles.heading}><div><h2>Website & bài viết</h2><p>Lượt truy cập được ghi nhận · múi giờ UTC</p></div><label>Khoảng thời gian <select value={days} onChange={e => setDays(Number(e.target.value))}><option value={1}>Hôm nay</option><option value={7}>7 ngày</option><option value={30}>30 ngày</option></select></label></div>
    {report?.collectionStatus === "disabled" && <p role="status"><strong>Thu thập đang tắt.</strong> Số liệu bên dưới là dữ liệu đã ghi nhận trước đó, nếu có. Cần bật cờ traffic ở bản build và runtime khi release.</p>}
    {report?.collectionStatus === "blocked" && <p role="alert"><strong>Chưa đủ cấu hình để thu thập.</strong> Kiểm tra cấu hình blog, trusted ingress và rate-limit secret trước khi release.</p>}
    <div className={styles.cards}>{keys.map(key => <div key={key} style={{borderTopColor: colors[key]}}><span>{labels[key]}</span><strong style={{color: colors[key]}}>{report?.startedAt ? format(report.total[key]) : "—"}</strong>{rows.length > 0 && <Sparkline values={rows.map(row => row[key])} color={colors[key]}/>}</div>)}</div>
    {rows.length > 0 && <div className={styles.chartBox}>
      <h3>Xu hướng theo ngày</h3>
      <ul className={styles.legend}>{keys.map(key => <li key={key}><i style={{background: colors[key]}}/>{labels[key]}</li>)}</ul>
      <svg viewBox="0 0 660 215" role="img" aria-label="So sánh lượt ghé, xem trang, mở blog và đọc theo ngày. Số liệu chi tiết ở bên dưới.">
        {[0, 0.5, 1].map(ratio => <g key={ratio}><line x1="48" x2="636" y1={178-ratio*150} y2={178-ratio*150} stroke="#e4e8ef"/><text x="40" y={182-ratio*150} textAnchor="end" fill="#617084" fontSize="11">{format(Math.round(maximum*ratio))}</text></g>)}
        {keys.map(key => { const points = chartPoints(rows.map(row => row[key]), 588, 150, maximum); return <g key={key} transform="translate(48 28)">
          {points.length > 1 && <polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={colors[key]} strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>}
          <circle cx={points[activeIndex].x} cy={points[activeIndex].y} r="4" fill={colors[key]} stroke="white" strokeWidth="1.5"/>
        </g>; })}
        {[...new Set([0, Math.floor((rows.length-1)/2), rows.length-1])].map(index => <text key={index} x={48+(rows.length === 1 ? 294 : index*588/(rows.length-1))} y="205" textAnchor="middle" fontSize="11" fill="#617084">{rows[index].date.slice(5)}</text>)}
      </svg>
      <label className={styles.dayPicker}>Xem ngày <select value={active.date} onChange={e => setSelectedDay(e.target.value)}>{rows.map(row => <option key={row.date} value={row.date}>{row.date}</option>)}</select></label>
      <div className={styles.dayValues} aria-live="polite">{keys.map(key => <span key={key}>{labels[key]} <b>{format(active[key])}</b></span>)}</div>
      <details><summary>Xem bảng số liệu</summary><div className={styles.tableScroll}><table><thead><tr><th>Ngày UTC</th>{keys.map(key => <th key={key}>{labels[key]}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.date}><th scope="row">{row.date}</th>{keys.map(key => <td key={key}>{format(row[key])}</td>)}</tr>)}</tbody></table></div></details>
    </div>}
    {report?.startedAt && <p>Tổng từ khi bắt đầu: <strong>{new Intl.NumberFormat("vi").format(report.allTime.visits)}</strong> lượt ghé website · <strong>{new Intl.NumberFormat("vi").format(report.allTime.reads)}</strong> lượt đọc có tương tác</p>}
    <p role="status">{error ? <>Chưa tải được thống kê. <button type="button" onClick={() => setRetry(n => n + 1)}>Thử lại</button></> : !report ? "Đang tải thống kê…" : !report.startedAt ? "Chưa có dữ liệu được ghi nhận." : `Bắt đầu ghi nhận: ${report.startedAt.slice(0,10)} · Cập nhật ${report.updatedAt.slice(11,16)} UTC`}</p>
    <details><summary>Các số này có nghĩa gì?</summary><p>Lượt ghé là phiên truy cập, hết phiên sau 30 phút không có hoạt động; không phải số người duy nhất. Đã đọc cần ít nhất 10 giây trên màn hình và đi qua 25% bài. Không gồm nhân viên, trang Studio và bot nhận diện được. Chỉ ghi nhận khi khách cho phép analytics; trình chặn và offline có thể làm thiếu dữ liệu.</p><p>Chỉ số mới không có dữ liệu lịch sử trước ngày bắt đầu. Lượt xem trong bảng giữ bộ đếm mở bài hiện có.</p></details>
  </section>;
}
