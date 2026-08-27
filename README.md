# Dev Tools

JSON · YAML · Regex를 다루는 개발자용 웹 도구입니다. 빌드 과정 없이 `index.html`만 열면 바로 사용할 수 있습니다.

## 데모

**https://adam-yam.github.io/devtools/**

별도 다운로드 없이 위 주소에서 바로 사용할 수 있습니다.

로컬에서 직접 보려면 저장소 전체를 내려받아야 합니다. `style.css`, `script.js`, `pics/icon.png`가 상대경로로 연결되어 있어서 `index.html` 파일 하나만 따로 받으면 정상적으로 열리지 않습니다.

## 기능

### JSON
- 포맷 / 압축
- 텍스트 · 트리 · 스키마 3가지 보기 모드 (스키마는 타입과 필수 필드를 자동 추론)
- 오류 메시지를 클릭하면 입력창에서 문제 위치로 자동 이동
- 파일 불러오기(드래그 앤 드롭 지원) / 내보내기 / 복사
- 비어 있을 때 샘플 데이터 불러오기
- URL로 공유 (내용을 base64로 인코딩해 링크 생성)
- YAML로 변환

### YAML
- 포맷 / 유효성 검사
- 오류 위치로 자동 이동
- 파일 불러오기 / 내보내기 / 복사 / 공유
- JSON으로 변환

### Regex
- 자주 쓰는 패턴(이메일, URL, 전화번호, 날짜) 원클릭 적용
- g/i/m/s 플래그 토글 버튼
- 매칭 결과 하이라이트 및 그룹 표시

### Diff
- JSON 두 개를 비교해 추가 / 삭제 / 변경된 값을 경로 단위로 표시

### 기타
- 다크 모드 토글 (설정은 로컬에 저장됨)
- 모바일 대응 레이아웃

## 기술 스택

- Vanilla HTML / CSS / JavaScript (프레임워크, 빌드 도구 없음)
- [js-yaml](https://github.com/nodeca/js-yaml) (YAML 파싱)
- [Pretendard](https://github.com/orioncactus/pretendard) 폰트

## 파일 구조

```
.
├── index.html   # 마크업
├── style.css    # 스타일
└── script.js    # 로직
```

## 실행 방법

저장소 전체를 내려받은 뒤 `index.html`을 열면 별도 설치 없이 바로 동작합니다. (서버 실행이나 빌드 과정 불필요)

```bash
git clone https://github.com/adam-yam/devtools.git
cd devtools
open index.html   # 또는 브라우저에서 직접 열기
```

파일을 압축(zip)으로 받는 경우에도 `index.html`, `style.css`, `script.js`, `pics/` 폴더가 모두 같은 위치에 있어야 합니다.
