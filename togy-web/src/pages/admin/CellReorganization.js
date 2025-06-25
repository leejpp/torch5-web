import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const CellReorganization = () => {
  const [formData, setFormData] = useState({
    totalMembers: '',
    cellCount: '',
    oldCellsText: '',
    newMembers: ''
  });
  const [cellLeaders, setCellLeaders] = useState([]);
  const [evangelistPairs, setEvangelistPairs] = useState([{ newcomer: '', evangelist: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 셀 개수에 따라 셀장 입력 필드 동적 생성
  const updateCellLeadersFields = (cellCount) => {
    const count = parseInt(cellCount, 10);
    if (isNaN(count) || count < 1) {
      setCellLeaders([]);
      return;
    }
    
    const newLeaders = Array(count).fill('').map((_, index) => 
      cellLeaders[index] || ''
    );
    setCellLeaders(newLeaders);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cellCount') {
      updateCellLeadersFields(value);
    }
  };

  const handleLeaderChange = (index, value) => {
    const newLeaders = [...cellLeaders];
    newLeaders[index] = value;
    setCellLeaders(newLeaders);
  };

  // 무작위 섞기(Fisher-Yates)
  const shuffle = (array) => {
    for(let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // 새신자-전도자 페어 추가
  const addEvangelistPair = () => {
    setEvangelistPairs([...evangelistPairs, { newcomer: '', evangelist: '' }]);
  };

  // 새신자-전도자 페어 제거
  const removeEvangelistPair = (index) => {
    if (evangelistPairs.length > 1) {
      const newPairs = evangelistPairs.filter((_, i) => i !== index);
      setEvangelistPairs(newPairs);
    }
  };

  // 새신자-전도자 페어 업데이트
  const updateEvangelistPair = (index, field, value) => {
    const newPairs = [...evangelistPairs];
    newPairs[index][field] = value;
    setEvangelistPairs(newPairs);
  };

  const createNewCells = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // 입력값 검증
      const N = parseInt(formData.totalMembers.trim(), 10);
      const C = parseInt(formData.cellCount.trim(), 10);
      
      if (isNaN(N) || N < 1) {
        throw new Error("총원 수를 올바르게 입력해주세요.");
      }
      
      if (isNaN(C) || C < 1) {
        throw new Error("셀 개수를 올바르게 입력해주세요.");
      }
      
      // 셀 리더 배열 가져오기
      const validLeaders = cellLeaders.filter(leader => leader.trim());
      
      // 셀 리더 중복 검사
      const uniqueLeaders = new Set(validLeaders);
      if (uniqueLeaders.size !== validLeaders.length) {
        throw new Error("셀 리더는 중복될 수 없습니다. 다른 이름을 입력해주세요.");
      }

      // 새신자-전도자 페어 검증
      const validPairs = evangelistPairs.filter(pair => 
        pair.newcomer.trim() && pair.evangelist.trim()
      );
      
      // 페어 중복 검사 (한 사람이 여러 페어에 등장하면 안됨)
      const allPairMembers = [];
      validPairs.forEach(pair => {
        allPairMembers.push(pair.newcomer.trim(), pair.evangelist.trim());
      });
      const uniquePairMembers = new Set(allPairMembers);
      if (uniquePairMembers.size !== allPairMembers.length) {
        throw new Error("새신자-전도자 페어에서 한 사람이 중복으로 등장할 수 없습니다.");
      }
      
      // 기존 셀들 파싱
      const oldCellLines = formData.oldCellsText.split("\n")
        .map(line => line.trim()).filter(x => x);
      
      const oldCells = oldCellLines.map(line => 
        line.split(/\s+/).filter(x => x)
      );

      // 새로 들어온 멤버
      const newMems = formData.newMembers.trim().split(/\s+/).filter(x => x);
      
      // 기존 셀에 포함된 인원 Set
      const existingMembers = new Set();
      oldCells.forEach(cell => cell.forEach(person => existingMembers.add(person)));
      
      // 새 멤버 추가
      newMems.forEach(person => existingMembers.add(person));
      
      // 셀 리더가 existingMembers에 없으면 추가
      validLeaders.forEach(leader => {
        if (!existingMembers.has(leader)) {
          existingMembers.add(leader);
        }
      });

      // 새신자-전도자 페어 멤버들이 existingMembers에 없으면 추가
      validPairs.forEach(pair => {
        if (!existingMembers.has(pair.newcomer.trim())) {
          existingMembers.add(pair.newcomer.trim());
        }
        if (!existingMembers.has(pair.evangelist.trim())) {
          existingMembers.add(pair.evangelist.trim());
        }
      });
      
      let membersArray = Array.from(existingMembers);
      
      // 입력된 멤버가 총원 N보다 적으면 Extra... 생성
      if(membersArray.length < N) {
        const shortage = N - membersArray.length;
        for(let i=1; i<=shortage; i++) {
          membersArray.push(`Extra${i}`);
        }
      }
      
      // 페어에 포함된 멤버들 추출
      const pairedMembers = new Set();
      validPairs.forEach(pair => {
        pairedMembers.add(pair.newcomer.trim());
        pairedMembers.add(pair.evangelist.trim());
      });
      
      // 리더들과 페어멤버들을 제외한 멤버 배열
      const freeMembersForPairing = membersArray.filter(member => 
        !validLeaders.includes(member) && !pairedMembers.has(member)
      );
      
      // 무작위 시도 횟수
      const maxIterations = 1000;
      let minOverlap = Number.MAX_VALUE;
      let bestCells = null;
      
      for(let i=0; i<maxIterations; i++){
        // 자유로운 멤버들만 섞기
        shuffle(freeMembersForPairing);
        
        // 셀 분배
        const newCells = Array(C).fill().map(() => []);
        
        // 1단계: 리더 배정 (각 셀에 한 명씩)
        for(let c=0; c<C && c<validLeaders.length; c++){
          newCells[c].push(validLeaders[c]);
        }
        
        // 2단계: 새신자-전도자 페어 배정 (같은 셀에)
        const pairAssignments = [];
        
        // 페어들을 무작위로 섞기
        const shuffledPairs = [...validPairs];
        shuffle(shuffledPairs);
        
        // 셀 인덱스들을 무작위로 섞기
        const cellIndices = Array.from({length: C}, (_, i) => i);
        shuffle(cellIndices);
        
        for(let pairIdx = 0; pairIdx < shuffledPairs.length; pairIdx++) {
          const pair = shuffledPairs[pairIdx];
          
          // 순환하면서 셀에 배정 (무작위로 섞인 순서대로)
          const targetCellIdx = cellIndices[pairIdx % C];
          
          newCells[targetCellIdx].push(pair.newcomer.trim(), pair.evangelist.trim());
          pairAssignments.push({
            cellIndex: targetCellIdx,
            pair: pair
          });
        }
        
        // 3단계: 나머지 멤버 분배
        const currentCellSizes = newCells.map(cell => cell.length);
        const targetTotalPerCell = Math.floor(membersArray.length / C);
        const extraMembers = membersArray.length % C;
        
        // 각 셀에 배정해야 할 추가 멤버 수 계산
        const needMoreMembers = [];
        for(let c = 0; c < C; c++) {
          const targetSize = targetTotalPerCell + (c < extraMembers ? 1 : 0);
          const needed = Math.max(0, targetSize - currentCellSizes[c]);
          needMoreMembers.push(needed);
        }
        
        // 자유 멤버들을 필요한 만큼 각 셀에 분배
        let memberIdx = 0;
        for(let c = 0; c < C && memberIdx < freeMembersForPairing.length; c++) {
          const needed = needMoreMembers[c];
          for(let j = 0; j < needed && memberIdx < freeMembersForPairing.length; j++) {
            newCells[c].push(freeMembersForPairing[memberIdx]);
            memberIdx++;
          }
        }
        
        // 교집합 계산
        let totalOverlap = 0;
        for(const oc of oldCells){
          for(const nc of newCells){
            const overlapCount = oc.filter(x => nc.includes(x)).length;
            totalOverlap += overlapCount;
          }
        }
        
        if(totalOverlap < minOverlap){
          minOverlap = totalOverlap;
          bestCells = newCells;
        }
        
        // UI 갱신(50회마다 한 번씩 잠깐 대기)
        if(i % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      if(!bestCells) {
        throw new Error("결과 계산에 실패했습니다. 다시 시도해 주세요.");
      }

      setResult({
        cells: bestCells,
        totalMembers: membersArray.length,
        minOverlap,
        cellCount: C,
        averageSize: (membersArray.length / C).toFixed(1),
        leaders: validLeaders,
        evangelistPairs: validPairs
      });
      
    } catch (error) {
      alert(error.message || "오류가 발생했습니다. 입력값을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <AdminBadge>
            <BadgeIcon>👑</BadgeIcon>
            <BadgeText>관리자</BadgeText>
          </AdminBadge>
          
          <TitleSection>
            <HeaderIcon>🔄</HeaderIcon>
            <Title>셀 재편성</Title>
            <Subtitle>청년부 셀 구성 최적화 도구</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatsIcon>📊</StatsIcon>
            <StatsText>스마트한 알고리즘으로 최적의 셀 구성을 제안합니다</StatsText>
          </StatsCard>
        </HeaderContent>
      </Header>

      <MainContent>
        <GuideSection>
          <GuideCard>
            <GuideTitle>📋 사용 안내</GuideTitle>
            <GuideList>
              <GuideItem>총원과 새 셀 갯수를 입력하세요.</GuideItem>
              <GuideItem>각 셀의 리더를 지정하면 각 리더는 무조건 다른 셀에 배치됩니다.</GuideItem>
              <GuideItem>새신자-전도자 페어를 지정하면 두 사람이 같은 셀에 배치됩니다.</GuideItem>
              <GuideItem>기존 셀 목록을 입력하세요. 각 줄은 하나의 셀을 의미하며, 셀원은 공백으로 구분합니다.</GuideItem>
              <GuideItem>새로 들어온 멤버가 있다면 공백으로 구분하여 입력하세요.</GuideItem>
              <GuideItem>'새 셀 배정' 버튼을 클릭하여 결과를 확인하세요.</GuideItem>
            </GuideList>
          </GuideCard>
        </GuideSection>

        <FormSection>
          <FormCard>
            <FormGroup>
              <Label>총원</Label>
              <Input
                type="number"
                placeholder="총 인원수 입력"
                min="1"
                value={formData.totalMembers}
                onChange={(e) => handleInputChange('totalMembers', e.target.value)}
              />
              <InputHint>전체 인원 수를 입력하세요.</InputHint>
            </FormGroup>

            <FormGroup>
              <Label>새로 만들 셀 수</Label>
              <Input
                type="number"
                placeholder="셀 갯수 입력"
                min="1"
                value={formData.cellCount}
                onChange={(e) => handleInputChange('cellCount', e.target.value)}
              />
              <InputHint>새로 구성할 셀의 개수를 입력하세요.</InputHint>
            </FormGroup>
            
            {cellLeaders.length > 0 && (
              <FormGroup>
                <Label>셀 리더 지정</Label>
                <InputHint>각 셀의 리더를 입력하세요. 리더들은 각각 다른 셀에 배치됩니다.</InputHint>
                <LeadersGrid>
                  {cellLeaders.map((leader, index) => (
                    <Input
                      key={index}
                      type="text"
                      placeholder={`셀${index + 1} 리더`}
                      value={leader}
                      onChange={(e) => handleLeaderChange(index, e.target.value)}
                    />
                  ))}
                </LeadersGrid>
              </FormGroup>
            )}

            <FormGroup>
              <Label>새신자-전도자 페어링</Label>
              <InputHint>새신자와 전도자를 같은 셀에 배치하고 싶다면 입력하세요.</InputHint>
              <PairingContainer>
                {evangelistPairs.map((pair, index) => (
                  <PairRow key={index}>
                    <PairInputGroup>
                      <PairInput
                        type="text"
                        placeholder="새신자 이름"
                        value={pair.newcomer}
                        onChange={(e) => updateEvangelistPair(index, 'newcomer', e.target.value)}
                      />
                      <PairSeparator>↔</PairSeparator>
                      <PairInput
                        type="text"
                        placeholder="전도자 이름"
                        value={pair.evangelist}
                        onChange={(e) => updateEvangelistPair(index, 'evangelist', e.target.value)}
                      />
                    </PairInputGroup>
                    <PairActionButtons>
                      <AddPairButton onClick={addEvangelistPair} type="button">
                        ➕
                      </AddPairButton>
                      {evangelistPairs.length > 1 && (
                        <RemovePairButton onClick={() => removeEvangelistPair(index)} type="button">
                          ❌
                        </RemovePairButton>
                      )}
                    </PairActionButtons>
                  </PairRow>
                ))}
              </PairingContainer>
            </FormGroup>

            <FormGroup>
              <Label>기존 셀 목록</Label>
              <TextArea
                rows="6"
                placeholder="A B C D E&#13;&#10;F G H I J&#13;&#10;K L M N O&#13;&#10;각 줄이 1개 셀"
                value={formData.oldCellsText}
                onChange={(e) => handleInputChange('oldCellsText', e.target.value)}
              />
              <InputHint>각 줄은 하나의 셀입니다. 각 줄에서 셀원은 공백으로 구분하세요.</InputHint>
            </FormGroup>
            
            <FormGroup>
              <Label>새로 들어온 멤버</Label>
              <Input
                type="text"
                placeholder="새 멤버들 (공백 구분)"
                value={formData.newMembers}
                onChange={(e) => handleInputChange('newMembers', e.target.value)}
              />
              <InputHint>새로 합류하는 멤버들을 공백으로 구분하여 입력하세요.</InputHint>
            </FormGroup>

            <SubmitButton onClick={createNewCells} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  계산 중...
                </>
              ) : (
                '새 셀 배정하기'
              )}
            </SubmitButton>
          </FormCard>
        </FormSection>

        {result && (
          <ResultSection>
            <ResultCard>
              <ResultTitle>🎉 셀 재편성 결과</ResultTitle>
              
              {result.cells.map((cell, idx) => (
                <CellResult key={idx}>
                  <CellName>새 셀{idx + 1}</CellName>
                  <CellMembers>
                    {cell.map((member, memberIdx) => {
                      const isLeader = result.leaders.includes(member);
                      const isPaired = result.evangelistPairs.some(pair => 
                        pair.newcomer.trim() === member || pair.evangelist.trim() === member
                      );
                      const pairInfo = result.evangelistPairs.find(pair => 
                        pair.newcomer.trim() === member || pair.evangelist.trim() === member
                      );
                      const isNewcomer = pairInfo && pairInfo.newcomer.trim() === member;
                      
                      return (
                        <MemberSpan 
                          key={memberIdx} 
                          $isLeader={isLeader}
                          $isPaired={isPaired}
                          $isNewcomer={isNewcomer}
                        >
                          {member}
                          {isPaired && (isNewcomer ? ' 🆕' : ' 👥')}
                        </MemberSpan>
                      );
                    })}
                  </CellMembers>
                </CellResult>
              ))}
              
              <StatBox>
                <StatItem>
                  <strong>총 인원 수</strong>: {result.totalMembers}명
                </StatItem>
                <StatItem>
                  <strong>최소 교집합 합계</strong>: {result.minOverlap}
                </StatItem>
                <StatItem>
                  <strong>셀당 평균 인원</strong>: {result.averageSize}명
                </StatItem>
                {result.evangelistPairs.length > 0 && (
                  <StatItem>
                    <strong>새신자-전도자 페어</strong>: {result.evangelistPairs.length}쌍
                  </StatItem>
                )}
              </StatBox>
              
              {result.evangelistPairs.length > 0 && (
                <PairInfoBox>
                  <PairInfoTitle>📝 페어링 정보</PairInfoTitle>
                  <PairInfoContent>
                    🆕 새신자 / 👥 전도자로 표시됩니다.
                    <br />
                    다음 페어들이 같은 셀에 배치되었습니다:
                    {result.evangelistPairs.map((pair, idx) => (
                      <PairInfoItem key={idx}>
                        <span style={{color: '#10b981', fontWeight: 'bold'}}>{pair.newcomer}</span>
                        {' ↔ '}
                        <span style={{color: '#f59e0b', fontWeight: 'bold'}}>{pair.evangelist}</span>
                      </PairInfoItem>
                    ))}
                  </PairInfoContent>
                </PairInfoBox>
              )}
            </ResultCard>
          </ResultSection>
        )}
      </MainContent>
    </Container>
  );
};

// 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.03) 0%, transparent 50%);
  }
`;

const Header = styled.header`
  background: ${colors.gradients.secondary};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  padding: ${spacing['4xl']} ${spacing['2xl']} ${spacing['3xl']};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing['3xl']} ${spacing.lg} ${spacing['2xl']};
  }
`;

const AdminBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.full};
  padding: ${spacing.sm} ${spacing.lg};
  margin-bottom: ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out;
`;

const BadgeIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const BadgeText = styled.span`
  color: white;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const TitleSection = styled.div`
  margin-bottom: ${spacing.xl};
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out 0.2s both;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const Title = styled.h1`
  color: white;
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const StatsCard = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg} ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
  
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const StatsIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const StatsText = styled.span`
  color: white;
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['3xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.md};
  }
`;

const GuideSection = styled.section`
  margin-bottom: ${spacing['3xl']};
`;

const GuideCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['2xl']};
  box-shadow: ${shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeInUp} 0.8s ease-out;
`;

const GuideTitle = styled.h2`
  color: ${colors.secondary[600]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
`;

const GuideList = styled.ol`
  padding-left: ${spacing.lg};
  line-height: 1.7;
`;

const GuideItem = styled.li`
  margin-bottom: ${spacing.sm};
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormSection = styled.section`
  margin-bottom: ${spacing['3xl']};
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['2xl']};
  box-shadow: ${shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${spacing.sm};
  font-weight: ${typography.fontWeight.semibold};
  font-size: ${typography.fontSize.base};
  color: ${colors.neutral[800]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  font-size: ${typography.fontSize.base};
  font-family: ${typography.fontFamily.body};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  background-color: ${colors.neutral[50]};
  color: ${colors.neutral[800]};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.secondary[500]};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    background-color: white;
  }
  
  &::placeholder {
    color: ${colors.neutral[500]};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  font-size: ${typography.fontSize.base};
  font-family: ${typography.fontFamily.body};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  background-color: ${colors.neutral[50]};
  color: ${colors.neutral[800]};
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: ${colors.secondary[500]};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    background-color: white;
  }
  
  &::placeholder {
    color: ${colors.neutral[500]};
  }
`;

const InputHint = styled.span`
  display: block;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  margin-top: ${spacing.xs};
`;

const LeadersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing.md};
  margin-top: ${spacing.sm};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${spacing.lg};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  font-family: ${typography.fontFamily.body};
  border: none;
  border-radius: ${borderRadius.xl};
  color: white;
  background: ${colors.gradients.secondary};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${shadows.xl};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s linear infinite;
`;

const ResultSection = styled.section`
  animation: ${fadeInUp} 0.5s ease-out;
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['2xl']};
  box-shadow: ${shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ResultTitle = styled.h2`
  color: ${colors.secondary[600]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
  text-align: center;
`;

const CellResult = styled.div`
  margin-bottom: ${spacing.lg};
  padding: ${spacing.lg};
  border-radius: ${borderRadius.lg};
  background-color: ${colors.neutral[50]};
  border: 1px solid ${colors.neutral[200]};
`;

const CellName = styled.div`
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.lg};
  margin-bottom: ${spacing.sm};
  color: ${colors.secondary[600]};
`;

const CellMembers = styled.div`
  line-height: 1.6;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
`;

const MemberSpan = styled.span`
  ${props => props.$isLeader && `
    font-weight: ${typography.fontWeight.bold};
    padding: ${spacing.xs} ${spacing.sm};
    background-color: rgba(139, 92, 246, 0.1);
    border-radius: ${borderRadius.md};
    border: 1px solid ${colors.secondary[200]};
  `}
  
  ${props => props.$isPaired && !props.$isLeader && `
    padding: ${spacing.xs} ${spacing.sm};
    border-radius: ${borderRadius.md};
    border: 1px solid ${props.$isNewcomer ? '#10b981' : '#f59e0b'};
    background-color: ${props.$isNewcomer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
  `}
`;

// 새신자-전도자 페어링 관련 스타일 컴포넌트
const PairingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  margin-top: ${spacing.sm};
`;

const PairRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  background-color: ${colors.neutral[50]};
`;

const PairInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  flex: 1;
`;

const PairInput = styled.input`
  flex: 1;
  padding: ${spacing.sm} ${spacing.md};
  font-size: ${typography.fontSize.sm};
  font-family: ${typography.fontFamily.body};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  background-color: white;
  color: ${colors.neutral[800]};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.secondary[500]};
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: ${colors.neutral[500]};
  }
`;

const PairSeparator = styled.span`
  font-size: ${typography.fontSize.lg};
  color: ${colors.secondary[500]};
  font-weight: ${typography.fontWeight.bold};
`;

const PairActionButtons = styled.div`
  display: flex;
  gap: ${spacing.xs};
`;

const AddPairButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  border: none;
  border-radius: ${borderRadius.md};
  background-color: ${colors.secondary[500]};
  color: white;
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${colors.secondary[600]};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const RemovePairButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  border: none;
  border-radius: ${borderRadius.md};
  background-color: #ef4444;
  color: white;
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StatBox = styled.div`
  margin-top: ${spacing.xl};
  padding: ${spacing.lg};
  background-color: rgba(139, 92, 246, 0.05);
  border-radius: ${borderRadius.lg};
  text-align: center;
  border: 1px solid ${colors.secondary[200]};
`;

const StatItem = styled.div`
  margin-bottom: ${spacing.sm};
  color: ${colors.neutral[700]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PairInfoBox = styled.div`
  margin-top: ${spacing.xl};
  padding: ${spacing.lg};
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: ${borderRadius.lg};
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const PairInfoTitle = styled.h3`
  color: ${colors.secondary[600]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
`;

const PairInfoContent = styled.div`
  color: ${colors.neutral[700]};
  line-height: 1.6;
`;

const PairInfoItem = styled.div`
  margin-top: ${spacing.sm};
  padding: ${spacing.sm};
  background-color: white;
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.neutral[200]};
`;

export default CellReorganization;