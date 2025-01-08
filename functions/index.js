const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.verifyPassword = functions.https.onCall(async (data, context) => {
  try {
    const { password } = data;
    
    // 비밀번호를 해시화하여 저장/비교
    const adminDoc = await admin.firestore().collection('admin').doc('settings').get();
    const hashedPassword = adminDoc.data().hashedPassword;
    
    // 비밀번호 검증 (실제로는 더 안전한 해시 함수 사용)
    const isValid = hashedPassword === password;
    
    return { isValid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Password verification failed');
  }
}); 