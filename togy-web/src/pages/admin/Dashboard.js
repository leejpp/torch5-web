import React from 'react';
import styled from 'styled-components';
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MenuItem = styled(Link)`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const MenuIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const MenuTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const MenuDescription = styled.p`
  color: #666;
  margin: 0.5rem 0 0 0;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const LogoutButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
  
  &:after {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: spin 1.2s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 2rem auto;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

export default Dashboard;