import React, { useState } from 'react';

// Hardcoded donation details
const BANK_NAME = 'OO은행';
const ACCOUNT_NUMBER = '123-456789-01-234';
const ACCOUNT_HOLDER = '토기청년부';

function DonationSection() {
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = async () => {
    const textToCopy = `${BANK_NAME} ${ACCOUNT_NUMBER} (${ACCOUNT_HOLDER})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess('복사되었습니다!');
      setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopySuccess('복사 실패');
    }
  };

  const sectionStyle = {
    padding: '20px',
    backgroundColor: '#f8f9fa', // Light background
    borderTop: '1px solid #dee2e6',
    borderBottom: '1px solid #dee2e6',
    marginTop: '20px'
  };

  const headingStyle = {
    fontSize: '1.2em',
    marginBottom: '10px'
  };

  const infoStyle = {
    marginBottom: '15px'
  };

  const buttonStyle = {
    padding: '8px 15px',
    fontSize: '0.9em',
    cursor: 'pointer'
  };

  const successMessageStyle = {
    color: 'green',
    marginLeft: '10px',
    fontSize: '0.9em'
  };

  return (
    <div style={sectionStyle}>
      <h3 style={headingStyle}>💌 후원 안내</h3>
      <div style={infoStyle}>
        <p>{BANK_NAME} {ACCOUNT_NUMBER}</p>
        <p>예금주: {ACCOUNT_HOLDER}</p>
      </div>
      <button onClick={copyToClipboard} style={buttonStyle}>
        계좌번호 복사
      </button>
      {copySuccess && <span style={successMessageStyle}>{copySuccess}</span>}
    </div>
  );
}

export default DonationSection; 