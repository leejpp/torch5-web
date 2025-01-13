import React from 'react';
import styled from 'styled-components';
import { db, verifyPassword } from '../../firebase/config';
import { Link } from 'react-router-dom'; 
import AdminLayout from '../../layouts/AdminLayout';

const Dashboard = () => {
  return (
    <AdminLayout>
      <Container>
        <Title>관리자 대시보드</Title>
        <MenuGrid>
          <MenuItem to="/admin/notice">
            <MenuIcon>📢</MenuIcon>
            <MenuTitle>공지사항 관리</MenuTitle>
          </MenuItem>
          <MenuItem to="/admin/prayer">
            <MenuIcon>🙏</MenuIcon>
            <MenuTitle>중보기도 관리</MenuTitle>
          </MenuItem>
          <MenuItem to="/admin/voices">
            <MenuIcon>💌</MenuIcon>
            <MenuTitle>마음의 소리 관리</MenuTitle>
          </MenuItem>
          <MenuItem to="/admin/calendar">
            <MenuIcon>📅</MenuIcon>
            <MenuTitle>일정 관리</MenuTitle>
          </MenuItem>
          <MenuItem to="/admin/members">
            <MenuIcon>👥</MenuIcon>
            <MenuTitle>멤버 관리</MenuTitle>
          </MenuItem>
        </MenuGrid>
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
`;

const MenuItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const MenuIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const MenuTitle = styled.span`
  color: #333;
  font-size: 1.1rem;
`;

export default Dashboard;