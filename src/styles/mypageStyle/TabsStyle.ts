import styled from 'styled-components';

export const StTabsContainer = styled.ul`
  width: 100%;
  display: flex;
  cursor: pointer;
  border-radius: 0.8rem;
  margin: 5rem auto;
  gap: 3.5rem;
  white-space: nowrap;

  @media screen and (max-width: 1024px) {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    overflow-x: scroll;
    padding: 1rem;
    &::-webkit-scrollbar {
      display: none; /* 스크롤 막대 숨기기 */
    }
  }
`;

interface TabProps {
  activeTab: boolean;
}
export const StTab = styled.li<TabProps>`
  cursor: pointer;
  font-weight: 'bold';

  color: ${(props) => (props.activeTab ? 'var(--opc-100)' : 'var(--black)')};
`;
