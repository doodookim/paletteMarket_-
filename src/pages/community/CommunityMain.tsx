import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import CategorySelector from '../../components/community/CategorySeletor';
import CommunityList from '../../components/community/CommunityList';
import CommunityMainCount from '../../components/community/CommunityMainCount';
import SkeletonCommunityCard from '../../components/skeleton/SkeletonCommunityCard';
import * as St from '../../styles/community/CommunityMainStyle';
import { fetchPosts } from './commuQuery';
import { Post } from './model';

const CommunityMain: React.FC = () => {
  const [selectCategory, setSelectCategory] = useState<string>('전체');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const { ref, inView } = useInView();

  const {
    data,
    isError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(
    ['posts_infinite', selectCategory],
    ({ pageParam = 1 }) => fetchPosts(selectCategory, pageParam, 6),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length < 6) return undefined;
        return pages.length + 1;
      }
    }
  );
  console.log(data);
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  const handleWriteButtonClick = () => {
    if (!userId) {
      const confirmLogin = window.confirm(
        '글쓰기는 로그인 후에 가능합니다. 로그인 하시겠습니까?'
      );
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }
    navigate('/community_write');
  };

  const posts: Post[] = data?.pages?.flat() || [];

  return (
    <St.Container>
      <St.Post_container>
        <CommunityMainCount selectCategory={selectCategory} />
        <St.FeatureBar>
          <CategorySelector
            selectCategory={selectCategory}
            setSelectCategory={setSelectCategory}
          />
          <St.WriteBtn onClick={handleWriteButtonClick}>
            <St.WriteIcon /> 글쓰기
          </St.WriteBtn>
        </St.FeatureBar>
        {isLoading ? (
          <SkeletonCommunityCard cards={6} /> // 초기 로딩 중에 보여줄 카드 수 조정 가능
        ) : (
          <CommunityList posts={posts} />
        )}
        {hasNextPage && !isFetchingNextPage && <div ref={ref}></div>}
        {isFetchingNextPage && <SkeletonCommunityCard cards={4} />}
      </St.Post_container>
    </St.Container>
  );
};

export default React.memo(CommunityMain);
