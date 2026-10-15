'use client';

import { CONFIGS, DESIGNS, img, type Mine, type Snapshot } from '@/lib/data';

type Props = {
  snap: Snapshot | null;
  mine: Mine;
  full?: boolean;
  updatedAt?: Date | null;
  onOpenDesign?: (n: number) => void;
};

const fmt = (d: Date) =>
  d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export default function ResultsPanel({ snap, mine, full = false, updatedAt, onOpenDesign }: Props) {
  if (!snap) return <div className="results-empty">결과를 불러오는 중이에요…</div>;

  const ranked = DESIGNS.map((d) => ({ n: d.n, v: snap.designs[d.n - 1] }))
    .sort((a, b) => b.v - a.v || a.n - b.n)
    .map((r, i, arr) => ({ ...r, rank: i > 0 && arr[i - 1].v === r.v ? 0 : i + 1 }));
  // 동점이면 앞 순위를 그대로 따라감
  let last = 1;
  for (const r of ranked) {
    if (r.rank === 0) r.rank = last;
    else last = r.rank;
  }
  const rows = full ? ranked : ranked.slice(0, 5);
  const maxD = Math.max(1, ...snap.designs);
  const maxC = Math.max(1, ...snap.cfgs);
  const totalD = snap.designs.reduce((a, b) => a + b, 0);
  const totalC = snap.cfgs.reduce((a, b) => a + b, 0);
  const pct = (v: number, t: number) => (t ? Math.round((v / t) * 100) : 0);

  return (
    <div className="results">
      <div className="results-meta">
        <span>
          총 <b>{snap.voters}</b>명 참여
        </span>
        <span className="live">
          <i className="dot" /> 실시간{updatedAt ? ` · ${fmt(updatedAt)} 갱신` : ''}
        </span>
      </div>

      <div className={full ? 'results-cols full' : 'results-cols'}>
        <section>
          <h3>시안별 득표{full ? '' : ' (상위 5)'}</h3>
          <ol className="bars">
            {rows.map((r) => {
              const isMine = mine.des.includes(r.n);
              return (
                <li key={r.n}>
                  <button
                    className="bar-row"
                    onClick={() => onOpenDesign?.(r.n)}
                    disabled={!onOpenDesign}
                    aria-label={`시안 ${r.n} ${r.v}표`}
                  >
                    <span className="rank">{r.v > 0 ? r.rank : '-'}</span>
                    {full && <img className="thumb" src={img(r.n, 'closed')} alt="" loading="lazy" />}
                    <span className="bar-name">
                      시안 {r.n}
                      {isMine && <em className="mine-tag">내 선택</em>}
                    </span>
                    <span className="bar-track">
                      <span
                        className={r.rank === 1 && r.v > 0 ? 'bar-fill top' : 'bar-fill'}
                        style={{ width: `${r.v ? Math.max(3, (r.v / maxD) * 100) : 0}%` }}
                      />
                    </span>
                    <span className="bar-val">
                      {r.v}
                      <small>{full ? ` · ${pct(r.v, totalD)}%` : ''}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <h3>구성별 득표</h3>
          <ol className="bars">
            {CONFIGS.map((c) => {
              const v = snap.cfgs[c.id];
              const isMine = mine.cfg === c.id;
              const lead = v > 0 && v === maxC;
              return (
                <li key={c.id}>
                  <div className="bar-row static">
                    <span className="rank">{c.mark}</span>
                    <span className="bar-name">
                      {c.short}
                      {isMine && <em className="mine-tag">내 선택</em>}
                    </span>
                    <span className="bar-track">
                      <span
                        className={lead ? 'bar-fill top' : 'bar-fill alt'}
                        style={{ width: `${v ? Math.max(3, (v / maxC) * 100) : 0}%` }}
                      />
                    </span>
                    <span className="bar-val">
                      {v}
                      <small>{full ? ` · ${pct(v, totalC)}%` : ''}</small>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
