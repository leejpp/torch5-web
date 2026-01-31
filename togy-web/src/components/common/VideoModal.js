import React from 'react';
import styled from 'styled-components';
import { colors, borderRadius, shadows } from '../../styles/designSystem';

const VideoModal = ({ isOpen, onClose, youtubeId, title, startTime }) => {
    if (!isOpen) return null;

    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1${startTime ? `&start=${startTime}` : ''}`;

    return (
        <Overlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Header>
                    <Title>{title}</Title>
                    <CloseButton onClick={onClose}>✕</CloseButton>
                </Header>
                <VideoContainer>
                    <iframe
                        src={embedUrl}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </VideoContainer>
            </ModalContent>
        </Overlay>
    );
};

const Overlay = styled.div`
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8);
    display: flex; justify-content: center; align-items: center; z-index: 2000; padding: 20px;
`;

const ModalContent = styled.div`
    background: black; width: 100%; max-width: 900px;
    border-radius: ${borderRadius.lg}; box-shadow: ${shadows.xl}; overflow: hidden;
    display: flex; flex-direction: column;
`;

const Header = styled.div`
    display: flex; justify-content: space-between; align-items: center; padding: 10px 20px;
    background: #222; color: white;
`;

const Title = styled.h3`
    font-size: 1rem; margin: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 90%;
`;
const CloseButton = styled.button`
    background: none; border: none; font-size: 1.5rem; color: #fff; cursor: pointer;
`;

const VideoContainer = styled.div`
    position: relative; padding-bottom: 56.25%; /* 16:9 Aspect Ratio */ height: 0; overflow: hidden;
    
    iframe {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    }
`;

export default VideoModal;
