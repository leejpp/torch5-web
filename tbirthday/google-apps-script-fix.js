// 구글 앱스 스크립트 수정 코드
// 기존 doGet 함수를 아래 코드로 교체하세요

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // 헤더 제외하고 필요한 데이터만 추출
  var birthdayList = data.slice(1).map(function(row) {
    return {
      소속: row[0],      // 소속 (A열)
      name: row[2],      // 이름 (C열)
      position: row[3],  // 직분 (D열)
      type: row[7],      // 음/양 (H열)
      birthday: row[8],  // 변환 생년월일 (I열)
      '생년월일 기초': row[5]  // 원본 음력 날짜 (F열) - 추가됨
    };
  }).filter(function(item) {
    return item.name && item.birthday;
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    birthdays: birthdayList
  })).setMimeType(ContentService.MimeType.JSON);
}

// 나머지 함수들은 그대로 유지
function lunarToSolar(lunarDate) {
 // API 키 설정
 const apiKey = "73aW9os31oLc836m1WBkvdXEGkTsncvAgQRSMDEs96ZebUpk8rKW2NPWFexueHPG1NYBKG3L46PpjK7%2F7zZ2GQ%3D%3D";
 
 // 현재 연도 가져오기
 const year = new Date().getFullYear();
 // 월과 일 추출
 const month = lunarDate.substring(0, 2);
 const day = lunarDate.substring(2, 4);
 
 // API URL 구성
 const url = `http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getSolCalInfo?serviceKey=${apiKey}&lunYear=${year}&lunMonth=${month}&lunDay=${day}`;
 
 try {
   // API 호출
   const response = UrlFetchApp.fetch(url);
   const xml = response.getContentText();
   const document = XmlService.parse(xml);
   const root = document.getRootElement();
   
   // 응답 데이터 파싱
   const items = root.getChild('body')
                    .getChild('items')
                    .getChild('item');
   
   // 양력 날짜 조합
   const solYear = items.getChild('solYear').getText();
   const solMonth = items.getChild('solMonth').getText();
   const solDay = items.getChild('solDay').getText();
   
   // Date 객체로 반환
   return new Date(solYear, solMonth - 1, solDay);
 } catch(error) {
   Logger.log('Error: ' + error.toString());
   return '변환 실패: ' + error.toString();
 }
}

function LUNAR_TO_SOLAR(date) {
 // 입력값 검증
 if (!date) return "날짜를 입력하세요";
 
 // 문자열로 변환 및 4자리 맞추기
 date = String(date).padStart(4, '0');
 
 // 형식 검증
 if (date.length !== 4) {
   return "MMDD 형식으로 입력하세요";
 }
 
 // 월/일 범위 검증
 const month = parseInt(date.substring(0, 2));
 const day = parseInt(date.substring(2, 4));
 
 if (month < 1 || month > 12) {
   return "월은 01-12 사이여야 합니다";
 }
 if (day < 1 || day > 31) {
   return "일은 01-31 사이여야 합니다";
 }
 
 return lunarToSolar(date);
}

// 테스트용 함수
function testLunarToSolar() {
 Logger.log(LUNAR_TO_SOLAR('0222'));
}

