import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const Dashboard = () => {
  return (
    <Container>
      <HeaderSection>
        <Title>청년부 관리 대시보드</Title>
        <Subtitle>TOGY Youth Admin</Subtitle>
      </HeaderSection>

      <Grid>
        <DashboardCard to="/admin/togy/prayer">
          <CardIcon>🙏</CardIcon>
          <CardInfo>
            <CardTitle>중보기도 관리</CardTitle>
            <CardDesc>기도제목 등록/수정</CardDesc>
          </CardInfo>
        </DashboardCard>

        <DashboardCard to="/admin/togy/voices">
          <CardIcon>💬</CardIcon>
          <CardInfo>
            <CardTitle>마음의 소리</CardTitle>
            <CardDesc>익명 게시판 관리</CardDesc>
          </CardInfo>
        </DashboardCard>



        <DashboardCard to="/admin/togy/yearlythemes">
          <CardIcon>📖</CardIcon>
          <CardInfo>
            <CardTitle>연간 표어</CardTitle>
            <CardDesc>주제 및 비전 설정</CardDesc>
          </CardInfo>
        </DashboardCard>

        <DashboardCard to="/admin/togy/cells">
          <CardIcon>👥</CardIcon>
          <CardInfo>
            <CardTitle>셀 재편성</CardTitle>
            <CardDesc>셀 구성원 배치</CardDesc>
          </CardInfo>
        </DashboardCard>
      </Grid>
    </Container>
  );
};

// Styles
const Container = styled.div`
  padding: ${spacing.xl};
  max-width: 1000px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral[200]};
  padding-bottom: ${spacing.lg};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: ${spacing.xs};
`;

const Subtitle = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${spacing.lg};
`;

const DashboardCard = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${spacing.lg};
  background: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
    border-color: ${colors.primary[300]};
  }
`;

const CardIcon = styled.div`
  font-size: ${typography.fontSize['2xl']};
  margin-right: ${spacing.md};
  background: ${colors.neutral[100]};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.md};
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: 2px;
`;

const CardDesc = styled.p`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[500]};
`;

export default Dashboard;

