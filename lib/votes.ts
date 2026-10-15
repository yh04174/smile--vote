import { CONFIGS, DESIGNS, MAX_DESIGN_VOTES, type Mine, type Snapshot } from './data';
import { getStore } from './store';

const NS = process.env.VOTE_NAMESPACE || 'smile-pkg-2610';
const CFG_KEY = `${NS}:cfg`;
const DES_KEY = `${NS}:des`;

export const VOTER_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export const isClosed = () => process.env.VOTING_CLOSED === 'true';

// 값은 JSON 으로 오해받지 않도록 접두어를 붙여 저장: "c:2", "d:3,7"
const parseCfg = (v?: string): number | null => {
  if (!v?.startsWith('c:')) return null;
  const n = Number(v.slice(2));
  return Number.isInteger(n) && n >= 0 && n < CONFIGS.length ? n : null;
};

const parseDes = (v?: string): number[] => {
  if (!v?.startsWith('d:')) return [];
  const out: number[] = [];
  for (const s of v.slice(2).split(',')) {
    const n = Number(s);
    if (Number.isInteger(n) && n >= 1 && n <= DESIGNS.length && !out.includes(n)) out.push(n);
  }
  return out.slice(0, MAX_DESIGN_VOTES);
};

export async function getSnapshot(voterId?: string): Promise<Snapshot> {
  const store = getStore();
  const [cfgRaw, desRaw] = await Promise.all([store.getAll(CFG_KEY), store.getAll(DES_KEY)]);

  const designs = DESIGNS.map(() => 0);
  const cfgs = CONFIGS.map(() => 0);
  const voters = new Set<string>();

  for (const [id, v] of Object.entries(cfgRaw)) {
    const c = parseCfg(v);
    if (c !== null) {
      cfgs[c] += 1;
      voters.add(id);
    }
  }
  for (const [id, v] of Object.entries(desRaw)) {
    const list = parseDes(v);
    for (const n of list) designs[n - 1] += 1;
    if (list.length) voters.add(id);
  }

  const mine: Mine = voterId
    ? { cfg: parseCfg(cfgRaw[voterId]), des: parseDes(desRaw[voterId]) }
    : { cfg: null, des: [] };

  return { designs, cfgs, voters: voters.size, closed: isClosed(), mine };
}

export async function saveVotes(voterId: string, mine: Mine) {
  const store = getStore();
  await Promise.all([
    mine.cfg === null ? store.del(CFG_KEY, voterId) : store.set(CFG_KEY, voterId, `c:${mine.cfg}`),
    mine.des.length === 0 ? store.del(DES_KEY, voterId) : store.set(DES_KEY, voterId, `d:${mine.des.join(',')}`),
  ]);
}

export function validateMine(body: unknown): { voterId: string; mine: Mine } | string {
  if (!body || typeof body !== 'object') return '잘못된 요청이에요.';
  const { voterId, cfg, des } = body as Record<string, unknown>;
  if (typeof voterId !== 'string' || !VOTER_ID_RE.test(voterId)) return '투표자 정보가 올바르지 않아요.';
  if (cfg !== null && !(Number.isInteger(cfg) && (cfg as number) >= 0 && (cfg as number) < CONFIGS.length))
    return '구성 번호가 올바르지 않아요.';
  if (!Array.isArray(des) || des.length > MAX_DESIGN_VOTES) return `시안은 ${MAX_DESIGN_VOTES}개까지 투표할 수 있어요.`;
  const list: number[] = [];
  for (const n of des) {
    if (!Number.isInteger(n) || n < 1 || n > DESIGNS.length) return '시안 번호가 올바르지 않아요.';
    if (list.includes(n)) return '같은 시안에는 한 번만 투표할 수 있어요.';
    list.push(n);
  }
  return { voterId, mine: { cfg: cfg as number | null, des: list } };
}
