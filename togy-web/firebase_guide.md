# Firebase 설정 가이드

새로 추가된 '예배 영상 게시판(Sermons)' 기능을 원활하게 사용하기 위해 필요한 Firebase 설정입니다.

## 1. 쿼리 인덱스(Index) 설정
Firestore는 복합 쿼리(여러 필드로 정렬/필터링)를 사용할 때 **인덱스**가 필요합니다. 인덱스가 없으면 데이터가 보이지 않거나 에러가 발생합니다.

### 방법 A: 자동 설정 (권장)
1. 앱을 실행하고 **설교 방송** 페이지로 이동합니다.
2. 브라우저 개발자 도구(`F12`)의 **Console** 탭을 엽니다.
3. 설교 리스트를 필터링하거나 조회할 때 빨간색 에러 메시지가 뜨는지 확인합니다.
4. 에러 메시지에 있는 **파란색 링크**를 클릭하면 Firebase Console의 인덱스 생성 페이지로 바로 연결됩니다.
5. **[인덱스 만들기]** 버튼을 누르고 완료될 때까지 잠시 기다립니다. (약 1~5분 소요)

### 방법 B: 수동 설정
Firebase Console > Firestore Database > **Indexes** 탭에서 아래 복합 인덱스를 직접 추가합니다.

| Collection ID | Fields Indexed | Query Scope |
| :--- | :--- | :--- |
| **sermons** | `date` (Descending) <br> `createdAt` (Descending) | Collection |
| **sermons** | `serviceType` (Ascending) <br> `date` (Descending) <br> `createdAt` (Descending) | Collection |

## 2. 보안 규칙 (Security Rules)
기존에 설정된 규칙이 있다면 그대로 두셔도 됩니다. 기본적으로 아래와 같은 규칙이 적용되어 있어야 합니다. (관리자만 쓰기 가능)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // 누구나 읽기 가능
      allow read: if true;
      // 쓰기/수정/삭제는 인증된 관리자만 가능 (실제 운영 시 조건 강화 권장)
      allow write: if request.auth != null;
    }
  }
}
```

## 3. Storage
유튜브 링크를 사용하므로 별도의 Storage 설정은 필요하지 않습니다.
