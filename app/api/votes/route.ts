import { NextResponse } from 'next/server';
import { getSnapshot, isClosed, saveVotes, validateMine, VOTER_ID_RE } from '@/lib/votes';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(req: Request) {
  const voter = new URL(req.url).searchParams.get('voter') ?? undefined;
  const id = voter && VOTER_ID_RE.test(voter) ? voter : undefined;
  try {
    return NextResponse.json(await getSnapshot(id), { headers: noStore });
  } catch (e) {
    console.error('GET /api/votes', e);
    return NextResponse.json({ error: '결과를 불러오지 못했어요.' }, { status: 500, headers: noStore });
  }
}

// 내 투표 전체를 한 번에 덮어씀. 취소·되돌리기·초기화도 같은 요청으로 처리.
export async function PUT(req: Request) {
  if (isClosed()) {
    return NextResponse.json({ error: '투표가 마감됐어요.' }, { status: 403, headers: noStore });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청이에요.' }, { status: 400, headers: noStore });
  }
  const v = validateMine(body);
  if (typeof v === 'string') {
    return NextResponse.json({ error: v }, { status: 400, headers: noStore });
  }
  try {
    await saveVotes(v.voterId, v.mine);
    return NextResponse.json(await getSnapshot(v.voterId), { headers: noStore });
  } catch (e) {
    console.error('PUT /api/votes', e);
    return NextResponse.json({ error: '투표를 저장하지 못했어요. 다시 시도해 주세요.' }, { status: 500, headers: noStore });
  }
}
