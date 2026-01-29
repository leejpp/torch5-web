import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const AdminPortal = () => {
    return (
        <Container>
            <ContentWrapper>
                <HeaderSection>
                    <MainTitle>횃불교회 통합 관리자</MainTitle>
                    <SubTitle>관리하실 부서를 선택해주세요</SubTitle>
                </HeaderSection>

                <Grid>
                    <AdminCard to="/admin/togy">
                        <CardIcon>🔥</CardIcon>
                        <CardContent>
                            <CardTitle>TOGY 청년부</CardTitle>
                            <CardDesc>청년부 데이터 및 사역 관리</CardDesc>
                        </CardContent>
                        <ArrowIcon>→</ArrowIcon>
                    </AdminCard>

                    <AdminCard to="/admin/main">
                        <CardIcon>⛪️</CardIcon>
                        <CardContent>
                            <CardTitle>본당</CardTitle>
                            <CardDesc>성도 및 멤버 관리</CardDesc>
                        </CardContent>
                        <ArrowIcon>→</ArrowIcon>
                    </AdminCard>

                    <AdminCard to="/admin/talant">
                        <CardIcon>🌱</CardIcon>
                        <CardContent>
                            <CardTitle>교회학교</CardTitle>
                            <CardDesc>달란트 및 학생 관리</CardDesc>
                        </CardContent>
                        <ArrowIcon>→</ArrowIcon>
                    </AdminCard>
                </Grid>

                <Footer>
                    <HomeLink to="/">메인으로 돌아가기</HomeLink>
                    <Copyright>© 2026 Torch Church Admin Portal</Copyright>
                </Footer>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    min-height: 100vh;
    background-color: ${colors.neutral[50]};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${spacing.xl};
    background-image: radial-gradient(${colors.neutral[200]} 1px, transparent 1px);
    background-size: 20px 20px;
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    width: 100%;
`;

const HeaderSection = styled.div`
    text-align: center;
    margin-bottom: ${spacing['4xl']};
`;

const MainTitle = styled.h1`
    font-size: ${typography.fontSize['4xl']};
    color: ${colors.primary[800]};
    margin-bottom: ${spacing.sm};
    
    ${media['max-md']} {
        font-size: ${typography.fontSize['3xl']};
    }
`;

const SubTitle = styled.p`
    font-size: ${typography.fontSize.xl};
    color: ${colors.neutral[500]};
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${spacing.lg};
    margin-bottom: ${spacing['4xl']};
`;

const AdminCard = styled(Link)`
    background: white;
    border-radius: ${borderRadius.xl};
    padding: ${spacing['2xl']};
    display: flex;
    align-items: center;
    text-decoration: none;
    box-shadow: ${shadows.md};
    border: 1px solid ${colors.neutral[200]};
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: ${shadows.xl};
        border-color: ${colors.primary[300]};
        
        & > div:last-child { // Arrow
            transform: translateX(5px);
            color: ${colors.primary[600]};
        }
    }
`;

const DisabledCard = styled.div`
    background: ${colors.neutral[100]};
    border-radius: ${borderRadius.xl};
    padding: ${spacing['2xl']};
    display: flex;
    align-items: center;
    border: 1px dashed ${colors.neutral[300]};
    cursor: not-allowed;
    opacity: 0.7;
`;

const CardIcon = styled.div`
    font-size: 3rem;
    margin-right: ${spacing.lg};
`;

const CardContent = styled.div`
    flex: 1;
`;

const CardTitle = styled.h3`
    font-size: ${typography.fontSize.xl};
    color: ${colors.neutral[800]};
    margin-bottom: ${spacing.xs};
    font-weight: ${typography.fontWeight.bold};
`;

const CardDesc = styled.p`
    font-size: ${typography.fontSize.sm};
    color: ${colors.neutral[500]};
`;

const ArrowIcon = styled.div`
    font-size: ${typography.fontSize['2xl']};
    color: ${colors.neutral[300]};
    transition: all 0.3s ease;
`;

const Footer = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const HomeLink = styled(Link)`
    color: ${colors.primary[600]};
    font-weight: 500;
    text-decoration: none;
    
    &:hover {
        text-decoration: underline;
    }
`;

const Copyright = styled.div`
    color: ${colors.neutral[400]};
    font-size: ${typography.fontSize.sm};
`;

export default AdminPortal;
