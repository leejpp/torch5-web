import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  TossContainer,
  TossCard,
  TossCardBody,
  TossTitle,
  TossSubtitle,
  TossGrid,
  TossColors,
  TossAnimations,
  TossBadge
} from '../../components/common/TossDesignSystem';

// 스타일 컴포넌트

// 토스 스타일 개선된 메뉴 카드
const TossMenuCard = styled(TossCard)`
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.gradient};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const MenuCardIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  animation: ${TossAnimations.bounce} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const MenuCardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${TossColors.grey900};
  margin: 0 0 8px 0;
`;

const MenuCardDescription = styled.p`
  font-size: 14px;
  color: ${TossColors.grey600};
  margin: 0;
  line-height: 1.5;
`;

const TossHeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, ${TossColors.primary} 0%, ${TossColors.primaryDark} 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`;

const TalantDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '달란트 입력',
      description: '주일학교 학생들의 달란트를 빠르고 쉽게 입력하세요',
      icon: '✏️',
      gradient: `linear-gradient(135deg, ${TossColors.primary} 0%, ${TossColors.primaryDark} 100%)`,
      path: '/talant/input',
      delay: 0
    },
    {
      title: '달란트 내역',
      description: '전체 달란트 내역을 날짜별로 체계적으로 관리하세요',
      icon: '📊',
      gradient: `linear-gradient(135deg, ${TossColors.success} 0%, #047857 100%)`,
      path: '/talant/history',
      delay: 0.1
    },
    {
      title: '달란트 현황판',
      description: '학생별 월간 달란트 현황을 달력으로 한눈에 확인하세요',
      icon: '📅',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      path: '/talant/board',
      delay: 0.2
    },
    {
      title: '달란트 랭킹',
      description: '학생들의 달란트 순위를 실시간으로 확인하고 공유하세요',
      icon: '🏆',
      gradient: `linear-gradient(135deg, ${TossColors.warning} 0%, #D97706 100%)`,
      path: '/talant/rank',
      delay: 0.3
    }
  ];

  return (
    <TossContainer>
      <TossHeroSection>
        <HeroContent>
          <TossBadge style={{ marginBottom: '24px' }}>
            🎯 주일학교 관리 시스템
          </TossBadge>
          
          <TossTitle style={{ color: 'white', fontSize: '36px', marginBottom: '16px' }}>
            달란트 관리 시스템
          </TossTitle>
          <TossSubtitle style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px' }}>
            주일학교 달란트를 스마트하게 관리하고, 학생들의 성장을 함께 응원하세요
          </TossSubtitle>
        </HeroContent>
      </TossHeroSection>

      <div style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <TossGrid>
            {menuItems.map((item, index) => (
              <TossMenuCard 
                key={index} 
                onClick={() => navigate(item.path)}
                delay={item.delay}
                gradient={item.gradient}
              >
                <TossCardBody style={{ textAlign: 'center' }}>
                  <MenuCardIcon delay={item.delay}>
                    {item.icon}
                  </MenuCardIcon>
                  <MenuCardTitle>{item.title}</MenuCardTitle>
                  <MenuCardDescription>{item.description}</MenuCardDescription>
                </TossCardBody>
              </TossMenuCard>
            ))}
          </TossGrid>

          <TossCard style={{ marginTop: '40px', textAlign: 'center' }}>
            <TossCardBody>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📋</div>
              <MenuCardTitle style={{ marginBottom: '12px' }}>사용 안내</MenuCardTitle>
              <MenuCardDescription style={{ fontSize: '16px', lineHeight: '1.6' }}>
                주일학교 달란트 시스템을 통해 학생들의 성장을 체계적으로 관리할 수 있습니다.
                <br />
                출석, 암송, 헌금, 전도 등 다양한 항목의 달란트 입력과 실시간 랭킹 확인으로 
                더욱 효과적인 주일학교 운영을 경험해보세요.
              </MenuCardDescription>
            </TossCardBody>
          </TossCard>
        </div>
      </div>
    </TossContainer>
  );
};

export default TalantDashboard; 