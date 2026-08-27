[README.md](https://github.com/user-attachments/files/31495984/README.md)
# Dev Tools

JSON · YAML · Regex를 다루는 개발자용 웹 도구입니다. 빌드 과정 없이 `index.html`만 열면 바로 사용할 수 있습니다.

## 데모

`index.html`을 브라우저로 열거나, GitHub Pages로 배포한 주소에 접속하면 됩니다.

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

별도 설치 없이 `index.html`을 브라우저에서 열면 됩니다.

