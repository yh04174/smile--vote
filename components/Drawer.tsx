'use client';

import { useState } from 'react';
import {
  COLOR_NAMES,
  CONFIGS,
  CONTENTS,
  DESIGNS,
  MAX_CONFIG_VOTES,
  MAX_DESIGN_VOTES,
  img,
  type Mine,
  type ViewKey,
} from '@/lib/data';

export type Open = { t: 'd'; n: number } | { t: 'c'; i: number };

type Props = {
  open: Open;
  mine: Mine;
  closed: boolean;
  lastDesign: number;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
  onOpen: (o: Open) => void;
  onToggleDesign: (n: number) => void;
  onChooseConfig: (i: number) => void;
};

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: 'lid', label: '뚜껑 윗면' },
  { key: 'closed', label: '닫았을 때' },
  { key: 'c1', label: '① 단상자' },
  { key: 'c2', label: '② 받침' },
  { key: 'c3', label: '③ 엽서 세로' },
  { key: 'c4', label: '④ 엽서 가로' },
];

function Chip({ label, hex }: { label: string; hex: string }) {
  const name = COLOR_NAMES[hex.toUpperCase()];
  return (
    <li className="chip">
      <span className="sw" style={{ background: hex }} />
      <span>
        <b>{label}</b>
        <small>
          {name ? `${name} · ` : ''}
          {hex}
        </small>
      </span>
    </li>
  );
}

function DesignBody({ open, mine, closed, onToggleDesign }: Props & { open: { t: 'd'; n: number } }) {
  const d = DESIGNS[open.n - 1];
  const [view, setView] = useState<ViewKey>('closed');
  const has = mine.des.includes(d.n);
  const full = !has && mine.des.length >= MAX_DESIGN_VOTES;
  const cfgIdx = view.startsWith('c') && view !== 'closed' ? Number(view.slice(1)) - 1 : null;
  const caption =
    cfgIdx !== null ? `${CONFIGS[cfgIdx].mark} ${CONFIGS[cfgIdx].name} · ${CONFIGS[cfgIdx].size}` : VIEWS.find((v) => v.key === view)!.label;

  return (
    <>
      <div className={`viewer ${view === 'lid' ? 'portrait' : ''}`}>
        <img key={`${d.n}-${view}`} src={img(d.n, view)} alt={`시안 ${d.n} ${caption}`} />
      </div>
      <p className="caption">{caption}</p>
      <div className="thumbs" role="tablist" aria-label="보기 전환">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view === v.key}
            className={view === v.key ? 'thumb-btn on' : 'thumb-btn'}
            onClick={() => setView(v.key)}
          >
            <img src={img(d.n, v.key)} alt="" loading="lazy" />
            <span>{v.label}</span>
          </button>
        ))}
      </div>

      <h4>색상</h4>
      <ul className="chips">
        <Chip label="뚜껑" hex={d.lid} />
        <Chip label="몸통" hex={d.body} />
        <Chip label="안쪽 테두리" hex={d.inner} />
        <Chip label="받침" hex={d.base} />
      </ul>

      <div className="vote-box">
        <button
          className={has ? 'vote-btn done' : 'vote-btn'}
          onClick={() => onToggleDesign(d.n)}
          disabled={closed}
          aria-pressed={has}
        >
          {closed ? '투표가 마감됐어요' : has ? '투표함 · 눌러서 취소' : full ? '2표를 모두 썼어요' : `이 시안에 투표 (${mine.des.length}/${MAX_DESIGN_VOTES})`}
        </button>
        {full && !closed && <p className="hint warn">다른 시안 투표를 취소하면 이 시안을 고를 수 있어요.</p>}
      </div>
    </>
  );
}

function ConfigBody({ open, mine, closed, lastDesign, onOpen, onChooseConfig }: Props & { open: { t: 'c'; i: number } }) {
  const c = CONFIGS[open.i];
  const [pd, setPd] = useState(lastDesign);
  const has = mine.cfg === c.id;
  const key = `c${c.id + 1}` as ViewKey;

  return (
    <>
      <div className="viewer">
        <img key={`${pd}-${key}`} src={img(pd, key)} alt={`시안 ${pd} ${c.name}`} />
      </div>
      <p className="caption">시안 {pd}에 적용한 모습</p>

      <h4>{c.mark} {c.name}</h4>
      <p className="desc">{c.desc}</p>
      <dl className="spec">
        <div>
          <dt>닫았을 때 바깥 치수</dt>
          <dd>{c.size}</dd>
        </div>
        <div>
          <dt>구성품 (모든 구성 동일)</dt>
          <dd>로즈 드 샤르므 솔리드 퍼퓸 30ml, 송태석 작가 스마일 키링, 엽서(90 × 50mm)</dd>
        </div>
      </dl>

      <h4>다른 시안으로 보기</h4>
      <div className="pick-design" role="group" aria-label="시안 선택">
        {DESIGNS.map((d) => (
          <button key={d.n} className={pd === d.n ? 'pd on' : 'pd'} onClick={() => setPd(d.n)}>
            {d.n}
          </button>
        ))}
      </div>

      <h4>구성 비교</h4>
      <div className="cmp">
        {CONFIGS.map((x) => (
          <button key={x.id} className={x.id === c.id ? 'cmp-item on' : 'cmp-item'} onClick={() => onOpen({ t: 'c', i: x.id })}>
            <img src={img(pd, `c${x.id + 1}` as ViewKey)} alt="" loading="lazy" />
            <span>{x.mark} {x.short}</span>
          </button>
        ))}
      </div>

      <div className="vote-box">
        <button
          className={has ? 'vote-btn done' : 'vote-btn'}
          onClick={() => onChooseConfig(c.id)}
          disabled={closed}
          aria-pressed={has}
        >
          {closed
            ? '투표가 마감됐어요'
            : has
              ? '투표함 · 눌러서 취소'
              : mine.cfg !== null
                ? `이 구성으로 변경 (${MAX_CONFIG_VOTES}표 중 사용)`
                : `이 구성에 투표 (0/${MAX_CONFIG_VOTES})`}
        </button>
        {!has && mine.cfg !== null && !closed && (
          <p className="hint">구성은 1개만 투표할 수 있어서, 누르면 기존 투표가 이 구성으로 바뀌어요.</p>
        )}
      </div>
    </>
  );
}

export default function Drawer(props: Props) {
  const { open, onClose, onNav } = props;
  const title = open.t === 'd' ? `시안 ${open.n}` : `구성 ${CONFIGS[open.i].mark}`;
  return (
    <div className="drawer-in">
      <div className="drawer-head">
        <div className="drawer-nav">
          <button onClick={() => onNav(-1)} aria-label="이전">‹</button>
          <strong>{title}</strong>
          <button onClick={() => onNav(1)} aria-label="다음">›</button>
        </div>
        <button className="x" onClick={onClose} aria-label="닫기">✕</button>
      </div>
      <div className="drawer-body">
        {open.t === 'd' ? (
          <DesignBody key={`d${open.n}`} {...props} open={open} />
        ) : (
          <ConfigBody key={`c${open.i}`} {...props} open={open} />
        )}
        {open.t === 'd' && <p className="foot-note">{CONTENTS}</p>}
      </div>
    </div>
  );
}
