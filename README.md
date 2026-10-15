# 스마일 선물세트 패키지 시안 투표

LASTBUTTON × SONGTAESEOK 패키지 시안 9종 · 구성 4가지 투표 사이트 (Next.js, 익명 투표)

## 투표 규칙
- 구성(①~④): 1개만 투표, 다른 구성을 누르면 선택이 바뀜
- 시안(1~9): 마음에 드는 2개 투표
- 취소·되돌리기·내 투표 초기화 가능 (마감 전까지)
- 로그인·이름 없음. 브라우저에 저장된 익명 ID로 기기당 1세트만 집계

## 화면
- `/` 시안 갤러리 + 오른쪽 슬라이드 상세 패널(←/→ 이동, Esc 닫기) + 실시간 결과 요약
- `/results` 전체 결과 (3초마다 자동 갱신)
- `/api/votes` GET 집계·내 투표 조회 / PUT 내 투표 저장(덮어쓰기)

## 배포 (GitHub + Vercel)
1. GitHub에 새 저장소를 만들고 이 폴더를 push
2. Vercel에서 **Add New → Project** 로 저장소 import (설정 변경 없이 Deploy)
3. Vercel 프로젝트 **Storage → Marketplace → Upstash Redis** 를 만들어 프로젝트에 연결
   (환경변수 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 이 자동 주입됨)
4. **Redeploy** 후 발급된 URL을 공유 (이후 push 할 때마다 자동 배포)

> 3번 없이 배포하면 서버 메모리에 저장되어 투표가 유지되지 않음. 로컬 개발에서만 이 방식 사용.

## 환경변수
| 이름 | 설명 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash 직접 연결 시 (Marketplace 연결이면 `KV_REST_API_*` 사용) |
| `VOTING_CLOSED` | `true` 로 두고 재배포하면 투표 마감, 결과만 조회 |
| `VOTE_NAMESPACE` | 투표 데이터 구분 이름. 바꾸면 새 투표판 시작 |

## 로컬 실행
```bash
npm install
npm run dev   # http://localhost:3000
```

## 구조
```
app/            페이지, API (api/votes/route.ts)
components/     VoteApp(메인), Drawer(상세 패널), ResultsPanel(결과)
lib/            data(시안·구성 정보), votes(집계·검증), store(Redis), useVotes(클라이언트 훅)
public/designs/ PDF에서 추출한 시안 이미지 (시안번호-lid|closed|c1~c4.webp)
```

## 시안 정보 수정
시안 색상·구성 설명은 `lib/data.ts`, 이미지는 `public/designs/` 파일을 같은 이름으로 교체.
