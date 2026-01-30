import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, typography, spacing, borderRadius, shadows, media } from '../../styles/designSystem';

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
    for (let i = array.length - 1; i > 0; i--) {
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
      if (membersArray.length < N) {
        const shortage = N - membersArray.length;
        for (let i = 1; i <= shortage; i++) {
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

      for (let i = 0; i < maxIterations; i++) {
        // 자유로운 멤버들만 섞기
        shuffle(freeMembersForPairing);

        // 셀 분배
        const newCells = Array(C).fill().map(() => []);

        // 1단계: 리더 배정 (각 셀에 한 명씩)
        for (let c = 0; c < C && c < validLeaders.length; c++) {
          newCells[c].push(validLeaders[c]);
        }

        // 2단계: 새신자-전도자 페어 배정 (같은 셀에)
        const pairAssignments = [];

        // 페어들을 무작위로 섞기
        const shuffledPairs = [...validPairs];
        shuffle(shuffledPairs);

        // 셀 인덱스들을 무작위로 섞기
        const cellIndices = Array.from({ length: C }, (_, i) => i);
        shuffle(cellIndices);

        for (let pairIdx = 0; pairIdx < shuffledPairs.length; pairIdx++) {
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
        for (let c = 0; c < C; c++) {
          const targetSize = targetTotalPerCell + (c < extraMembers ? 1 : 0);
          const needed = Math.max(0, targetSize - currentCellSizes[c]);
          needMoreMembers.push(needed);
        }

        // 자유 멤버들을 필요한 만큼 각 셀에 분배
        let memberIdx = 0;
        for (let c = 0; c < C && memberIdx < freeMembersForPairing.length; c++) {
          const needed = needMoreMembers[c];
          for (let j = 0; j < needed && memberIdx < freeMembersForPairing.length; j++) {
            newCells[c].push(freeMembersForPairing[memberIdx]);
            memberIdx++;
          }
        }

        // 교집합 계산
        let totalOverlap = 0;
        for (const oc of oldCells) {
          for (const nc of newCells) {
            const overlapCount = oc.filter(x => nc.includes(x)).length;
            totalOverlap += overlapCount;
          }
        }

        if (totalOverlap < minOverlap) {
          minOverlap = totalOverlap;
          bestCells = newCells;
        }

        // UI 갱신(50회마다 한 번씩 잠깐 대기)
        if (i % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      if (!bestCells) {
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
      <MainContent>
        <HeaderSection>
          <Title>셀 편성 도우미</Title>
          <Stats>
            <StatText>최적화 알고리즘 기반</StatText>
          </Stats>
        </HeaderSection>

        <GuideSection>
          <GuideTitle>📋 사용 안내</GuideTitle>
          <GuideText>
            총원과 셀 수를 입력하고, 기존 셀 정보를 넣으면 최대한 겹치지 않게 새로운 셀을 편성합니다.<br />
            리더와 새신자/전도자 페어는 고정적으로 배치됩니다.
          </GuideText>
        </GuideSection>

        <FormSection>
          <Form>
            <FormRow>
              <InputGroup>
                <Label>총 인원</Label>
                <Input
                  type="number"
                  placeholder="예: 30"
                  min="1"
                  value={formData.totalMembers}
                  onChange={(e) => handleInputChange('totalMembers', e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Label>생성할 셀 수</Label>
                <Input
                  type="number"
                  placeholder="예: 5"
                  min="1"
                  value={formData.cellCount}
                  onChange={(e) => handleInputChange('cellCount', e.target.value)}
                />
              </InputGroup>
            </FormRow>

            {cellLeaders.length > 0 && (
              <InputGroup>
                <Label>셀 리더 지정 (각 리더는 서로 다른 셀로 배정됩니다)</Label>
                <Grid>
                  {cellLeaders.map((leader, index) => (
                    <Input
                      key={index}
                      type="text"
                      placeholder={`셀 ${index + 1} 리더`}
                      value={leader}
                      onChange={(e) => handleLeaderChange(index, e.target.value)}
                    />
                  ))}
                </Grid>
              </InputGroup>
            )}

            <InputGroup>
              <Label>새신자-전도자 매칭 (같은 셀 배정)</Label>
              <PairList>
                {evangelistPairs.map((pair, index) => (
                  <PairRow key={index}>
                    <Input
                      type="text"
                      placeholder="새신자"
                      value={pair.newcomer}
                      onChange={(e) => updateEvangelistPair(index, 'newcomer', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <PairSeparator>↔</PairSeparator>
                    <Input
                      type="text"
                      placeholder="전도자"
                      value={pair.evangelist}
                      onChange={(e) => updateEvangelistPair(index, 'evangelist', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {evangelistPairs.length > 1 && (
                      <RemoveButton type="button" onClick={() => removeEvangelistPair(index)}>×</RemoveButton>
                    )}
                  </PairRow>
                ))}
                <AddButton type="button" onClick={addEvangelistPair}>+ 매칭 추가</AddButton>
              </PairList>
            </InputGroup>

            <InputGroup>
              <Label>기존 셀 정보 (각 줄이 하나의 셀, 공백으로 이름 구분)</Label>
              <TextArea
                rows="6"
                placeholder="예: 홍길동 김철수 이영희&#13;&#10;박지성 손흥민"
                value={formData.oldCellsText}
                onChange={(e) => handleInputChange('oldCellsText', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <Label>신규 멤버 (공백으로 구분)</Label>
              <Input
                type="text"
                placeholder="이름 입력"
                value={formData.newMembers}
                onChange={(e) => handleInputChange('newMembers', e.target.value)}
              />
            </InputGroup>

            <SubmitButton onClick={createNewCells} disabled={isLoading}>
              {isLoading ? '계산 중...' : '새 셀 편성하기'}
            </SubmitButton>
          </Form>
        </FormSection>

        {result && (
          <ResultSection>
            <ResultHeader>
              <ResultTitle>편성 결과</ResultTitle>
              <ResultStats>
                평균 {result.averageSize}명 / 교집합 {result.minOverlap}
              </ResultStats>
            </ResultHeader>

            <ResultGrid>
              {result.cells.map((cell, idx) => (
                <CellCard key={idx}>
                  <CellNumber>셀 {idx + 1}</CellNumber>
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
                        <MemberBadge
                          key={memberIdx}
                          $isLeader={isLeader}
                          $isNewcomer={isNewcomer}
                          $isPaired={isPaired}
                        >
                          {member}
                          {isLeader && ' 👑'}
                          {isPaired && (isNewcomer ? ' 🆕' : ' 🤝')}
                        </MemberBadge>
                      );
                    })}
                  </CellMembers>
                </CellCard>
              ))}
            </ResultGrid>
          </ResultSection>
        )}
      </MainContent>
    </Container>
  );
};

// Minimal Styles
const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  padding: ${spacing.xl};
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: ${spacing.xl};
  border-bottom: 2px solid ${colors.neutral[100]};
  padding-bottom: ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const Stats = styled.div`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const StatText = styled.span``;

const GuideSection = styled.div`
  background: ${colors.neutral[50]};
  padding: ${spacing.lg};
  border-radius: ${borderRadius.lg};
  margin-bottom: ${spacing.xl};
  border: 1px solid ${colors.neutral[100]};
`;

const GuideTitle = styled.h3`
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  font-size: ${typography.fontSize.base};
`;

const GuideText = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.sm};
  line-height: 1.6;
`;

const FormSection = styled.div`
  margin-bottom: ${spacing['2xl']};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Label = styled.label`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[700]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.neutral[900]};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  background: white;
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: ${colors.neutral[900]};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${spacing.sm};
`;

const PairList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const PairRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const PairSeparator = styled.span`
  color: ${colors.neutral[400]};
`;

const RemoveButton = styled.button`
  color: ${colors.neutral[400]};
  background: none;
  border: none;
  font-size: ${typography.fontSize.lg};
  cursor: pointer;
  
  &:hover {
    color: ${colors.red[500]};
  }
`;

const AddButton = styled.button`
  align-self: flex-start;
  color: ${colors.neutral[600]};
  background: none;
  border: none;
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  padding: ${spacing.sm} 0;
  
  &:hover {
    color: ${colors.neutral[900]};
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: ${colors.neutral[900]};
  color: white;
  border: none;
  padding: ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.base};
  cursor: pointer;
  margin-top: ${spacing.md};
  
  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

const ResultSection = styled.div`
  border-top: 2px solid ${colors.neutral[100]};
  padding-top: ${spacing.xl};
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${spacing.lg};
`;

const ResultTitle = styled.h2`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const ResultStats = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${spacing.lg};
`;

const CellCard = styled.div`
  background: ${colors.neutral[50]};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  border: 1px solid ${colors.neutral[200]};
`;

const CellNumber = styled.h3`
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.md};
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[900]};
`;

const CellMembers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.xs};
`;

const MemberBadge = styled.span`
  background: ${props =>
    props.$isLeader ? colors.neutral[900] :
      props.$isNewcomer ? colors.neutral[200] :
        props.$isPaired ? colors.neutral[300] : 'white'
  };
  color: ${props => props.$isLeader ? 'white' : colors.neutral[900]};
  border: 1px solid ${props => props.$isLeader ? colors.neutral[900] : colors.neutral[300]};
  padding: 4px 8px;
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.sm};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export default CellReorganization;
