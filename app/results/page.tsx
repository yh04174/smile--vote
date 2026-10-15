'use client';

import Link from 'next/link';
import ResultsPanel from '@/components/ResultsPanel';
import { useVotes } from '@/lib/useVotes';

export default function ResultsPage() {
  const v = useVotes({ pollMs: 3000 });
  return (
    <div className="results-page">
      <header className="top">
        <div>
          <p className="eyebrow">LASTBUTTON × SONGTAESEOK</p>
          <h1>투표 결과</h1>
        </div>
        <div className="actions">
          <Link href="/" className="btn-link">투표하러 가기</Link>
        </div>
      </header>
      {v.closed && <div className="banner warn">투표가 마감됐어요. 아래가 최종 결과예요.</div>}
      {v.error === 'load' && <div className="banner warn">결과를 불러오지 못했어요. 자동으로 다시 시도하고 있어요.</div>}
      <ResultsPanel snap={v.snap} mine={v.mine} full updatedAt={v.updatedAt} />
    </div>
  );
}
