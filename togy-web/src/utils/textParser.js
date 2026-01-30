import React from 'react';
import styled from 'styled-components';

const BoldText = styled.span`
  font-weight: 700;
  color: inherit;
`;

/**
 * Parses text containing markdown-style bold syntax (**text**) 
 * and returns an array of React elements or strings.
 * 
 * @param {string} text - The input text to parse
 * @returns {Array<string|React.ReactElement>} - Array of text and BoldText components
 */
export const parseEmphasizedText = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;

    // Split by **
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
        // Check if the part is enclosed in **
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2); // Remove **
            return <BoldText key={index}>{content}</BoldText>;
        }
        return part;
    });
};
