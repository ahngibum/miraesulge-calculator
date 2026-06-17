# 세션 작업 노트

## 브랜치
- 작업 브랜치: `claude/magical-hypatia-vikgiq`
- main에도 동일 내용 push 완료 (이전 세션)

## 완료된 작업

### Next.js 앱 (`nextjs-app/`)
Next.js 16 + TypeScript + Tailwind CSS 기반 신규 앱 생성

#### 구현 파일 목록
| 파일 | 내용 |
|------|------|
| `app/lib/constants/onboarding.ts` | 온보딩 질문 9개 정의 (birth_year/chips/range 타입) |
| `app/lib/constants/road-cards.ts` | 로드 A 카드 20개 (ageMin/ageMax 포함) |
| `app/lib/calc/calc_engine.js` | A-1(10억 목표), A-2(FIRE) 계산 로직 |
| `app/components/onboarding/Onboarding.tsx` | 메인 온보딩 컴포넌트 (조건부 분기 포함) |
| `app/components/onboarding/BirthYearInput.tsx` | 출생연도 입력 → 만 나이 자동 표시 |
| `app/components/onboarding/ChipsInput.tsx` | 선택 칩 + 직접 입력 |
| `app/components/onboarding/RangeInput.tsx` | 슬라이더 + 직접 입력 |
| `app/components/onboarding/ProgressBar.tsx` | 진도 바 3단계 |
| `app/components/onboarding/CompanionBar.tsx` | 동반자 멘트 |
| `app/page.tsx` | 메인 랜딩 페이지 |
| `app/onboarding/page.tsx` | 온보딩 페이지 |
| `app/calculator/[cardId]/page.tsx` | 카드별 SSG 페이지 + Schema.org |
| `app/layout.tsx` | Noto Sans KR 폰트 적용 |
| `app/globals.css` | 브랜드 컬러 (teal-500 #1D9E75) |
| `vercel.json` | Vercel 배포 설정 (Root Directory: nextjs-app) |

### 온보딩 UX 구현 내용
- 출생연도 입력 → 만 나이 자동 계산 표시
- 기혼 → 맞벌이/외벌이 분기 → 맞벌이 → 배우자 소득 질문
- 미혼 → "배우자 있을 경우도 볼게요?" 분기
- 스킵 버튼 + 이전 버튼
- 진도 바: "N개 질문 남음" + "현재/전체" + 점 바

### 카드 20개 (순서)
a-1, a-2, a-11, a-3, a-4, a-5, a-6, a-7, a-8, a-10,
a-12, a-14, a-15, a-16, a-17, a-18, a-19, a-20, a-b1, a-b2

## 다음 세션에서 할 일
- [ ] GitHub push 완료 (새 PAT 토큰 필요 — 이전 토큰 노출로 자동 무효화됨)
- [ ] Vercel 배포 연결 (Root Directory: `nextjs-app`)
- [ ] 카드 선택 UI (RoadCardList 컴포넌트) — 나이 범위 밖 카드 흐리게 표시
- [ ] 카드 클릭 시 동반자 현실 진단 멘트 + 선택지 모달
- [ ] 계산 결과 페이지 (`/calculator/[cardId]/result`) 구현
- [ ] A-3~A-20 카드 calc_engine 로직 추가
- [ ] Google Analytics (G-Z1T5GDGTWV) + GTM (GTM-WDHD5J3V) 연동

## Push 방법 (다음 세션)
```bash
# 새 PAT 토큰 발급 후:
git remote set-url origin https://ahngibum:<NEW_TOKEN>@github.com/ahngibum/miraesulge-calculator.git
git push origin HEAD:claude/magical-hypatia-vikgiq
git push origin HEAD:main
git remote set-url origin http://local_proxy@127.0.0.1:34469/git/ahngibum/miraesulge-calculator
```
