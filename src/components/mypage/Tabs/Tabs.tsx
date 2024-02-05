import { useState } from 'react';
import { StTab, StTabsContainer } from '../../../styles/mypageStyle/TabsStyle';
import MyPageItemList from '../Items/MyPageItemList';
import MyPageCommunityPostList from '../Commnity/MyPageCommunityPostList';
import { useAppSelector } from '../../../redux/reduxHooks/reduxBase';

const Tabs = () => {
  const count = useAppSelector((state) => state.itemAndPost);

  const tabMenuArray = [
    // { label: '내 물품', value: count.myItems },
    // { label: '구매한 물품', value: count.purchasedItems },
    // { label: '찜한 물품', value: count.favItems },
    // { label: '내가 쓴 글', value: count.myPosts },
    // { label: '추천한 글', value: count.favPosts }
    { label: '내 물품' },
    { label: '구매한 물품' },
    { label: '찜한 물품' },
    { label: '내가 쓴 글' },
    { label: '추천한 글' }
  ];

  const [tab, setTab] = useState<number>(0);
  const clickTabHandler = (index: number) => {
    setTab(index);
  };

  return (
    <>
      <StTabsContainer>
        {tabMenuArray.map((menu, index) => {
          return (
            <StTab
              key={index}
              onClick={() => clickTabHandler(index)}
              active={tab === index}
            >
              {`${menu.label} `}
            </StTab>
          );
        })}
      </StTabsContainer>

      {tab >= 3 ? (
        <MyPageCommunityPostList activeTab={tab} />
      ) : (
        <MyPageItemList activeTab={tab} />
      )}
    </>
  );
};

export default Tabs;
