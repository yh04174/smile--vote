export const MAX_DESIGN_VOTES = 2;
export const MAX_CONFIG_VOTES = 1;

export type ViewKey = 'lid' | 'closed' | 'c1' | 'c2' | 'c3' | 'c4';

export type Design = {
  n: number;
  lid: string;
  body: string;
  inner: string;
  base: string;
};

export const DESIGNS: Design[] = [
  { n: 1, lid: '#EEE4D0', body: '#D4C2A5', inner: '#D7C6AC', base: '#EEE8DA' },
  { n: 2, lid: '#101010', body: '#101010', inner: '#EEE8DA', base: '#EEE8DA' },
  { n: 3, lid: '#EEE8DA', body: '#EEE8DA', inner: '#EEE8DA', base: '#EEE8DA' },
  { n: 4, lid: '#EEE8DA', body: '#EEE8DA', inner: '#EEE8DA', base: '#EEE8DA' },
  { n: 5, lid: '#EEE8DA', body: '#EEE8DA', inner: '#EDC443', base: '#EEE8DA' },
  { n: 6, lid: '#EDC443', body: '#EDC443', inner: '#EDC443', base: '#101010' },
  { n: 7, lid: '#101010', body: '#101010', inner: '#EDC443', base: '#EEE8DA' },
  { n: 8, lid: '#EEE8DA', body: '#EEE8DA', inner: '#EDC443', base: '#EEE8DA' },
  { n: 9, lid: '#EEE8DA', body: '#EEE8DA', inner: '#EDC443', base: '#EEE8DA' },
];

export const COLOR_NAMES: Record<string, string> = {
  '#101010': '블랙',
  '#EEE8DA': '아이보리',
  '#EDC443': '옐로',
};

export type Config = {
  id: number;
  mark: string;
  name: string;
  short: string;
  size: string;
  desc: string;
};

export const CONFIGS: Config[] = [
  {
    id: 0,
    mark: '①',
    name: '단상자 구성',
    short: '단상자',
    size: '122.2 × 154.2 × 39.8mm',
    desc: '퍼퓸은 단상자, 키링은 서랍 상자에 담고 엽서는 뚜껑 안쪽 칼집에 꽂아요.',
  },
  {
    id: 1,
    mark: '②',
    name: '받침 구성',
    short: '받침',
    size: '122.2 × 154.2 × 39.8mm',
    desc: '단상자 없이 퍼퓸과 키링을 받침 홈에 바로 담고, 엽서는 뚜껑 안쪽 칼집에 꽂아요.',
  },
  {
    id: 2,
    mark: '③',
    name: '받침 + 엽서 세로',
    short: '받침+엽서 세로',
    size: '122.2 × 163.2 × 39.8mm',
    desc: '엽서까지 받침에 세로로 놓아요. 키링 줄은 몸통 아래 홈에 접어 넣어요.',
  },
  {
    id: 3,
    mark: '④',
    name: '받침 + 엽서 가로',
    short: '받침+엽서 가로',
    size: '157.7 × 154.2 × 39.8mm',
    desc: '엽서를 받침에 가로로 눕혀 열자마자 읽혀요. 그만큼 상자가 옆으로 넓어져요.',
  },
];

export const CONTENTS =
  '구성품은 모두 같아요. 로즈 드 샤르므 솔리드 퍼퓸 30ml, 송태석 작가 스마일 키링, 엽서(90 × 50mm)예요. 치수는 닫았을 때 바깥 치수예요.';

export const img = (n: number, k: ViewKey) => `/designs/${n}-${k}.webp`;

export type Mine = { cfg: number | null; des: number[] };

export type Snapshot = {
  designs: number[];
  cfgs: number[];
  voters: number;
  closed: boolean;
  mine: Mine;
};
