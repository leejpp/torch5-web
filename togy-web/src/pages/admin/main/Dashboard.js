import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../../styles/designSystem';

const Dashboard = () => {
    return (
        <Container>
            <Header>
                <Title>본당 관리자 대시보드</Title>
                <Subtitle>성도 관리 및 교회 일정을 관리하세요.</Subtitle>
            </Header>

            <Grid>
                <Card to="/admin/main/members">
                    <CardIcon>👥</CardIcon>
                    <CardTitle>성도 관리</CardTitle>
                    <CardDescription>
                        교회 등록 성도 명단을 조회, 수정, 삭제하고<br />
                        새거족을 등록합니다.
                    </CardDescription>
                    <CardAction>바로가기 →</CardAction>
                </Card>

                <Card to="/admin/main/schedule">
                    <CardIcon>📅</CardIcon>
                    <CardTitle>일정 관리</CardTitle>
                    <CardDescription>
                        교회 주요 행사 및 캘린더 일정을<br />
                        등록하고 관리합니다.
                    </CardDescription>
                    <CardAction>바로가기 →</CardAction>
                </Card>
            </Grid>
        </Container>
    );
};

const Container = styled.div`
    max-width: 1000px;
    margin: 0 auto;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: ${spacing['4xl']};
`;

const Title = styled.h1`
    font-size: ${typography.fontSize['3xl']};
    color: ${colors.neutral[900]};
    margin-bottom: ${spacing.sm};
`;

const Subtitle = styled.p`
    font-size: ${typography.fontSize.lg};
    color: ${colors.neutral[500]};
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${spacing.xl};
    
    ${media['max-md']} {
        grid-template-columns: 1fr;
    }
`;

const Card = styled(Link)`
    background: white;
    border-radius: ${borderRadius.xl};
    padding: ${spacing['2xl']};
    box-shadow: ${shadows.md};
    text-decoration: none;
    transition: all 0.3s ease;
    border: 1px solid ${colors.neutral[200]};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${shadows.xl};
        border-color: ${colors.primary[500]};
    }
`;

const CardIcon = styled.div`
    font-size: ${typography.fontSize['5xl']};
    margin-bottom: ${spacing.lg};
    background: ${colors.neutral[50]};
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
`;

const CardTitle = styled.h2`
    font-size: ${typography.fontSize['2xl']};
    color: ${colors.neutral[900]};
    margin-bottom: ${spacing.md};
    font-weight: ${typography.fontWeight.bold};
`;

const CardDescription = styled.p`
    font-size: ${typography.fontSize.base};
    color: ${colors.neutral[500]};
    line-height: 1.6;
    margin-bottom: ${spacing.xl};
`;

const CardAction = styled.span`
    color: ${colors.primary[600]};
    font-weight: ${typography.fontWeight.semibold};
    font-size: ${typography.fontSize.lg};
`;

export default Dashboard;
