import React from 'react';
import styled from 'styled-components';
import { Community, UsedItem } from '../usedtypes';
import { supabase } from '../../api/supabase/supabaseClient';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import Carousel from '../../components/mainpage/Carousel';
import { count } from 'console';
import { NullLiteral } from 'typescript';
type UsedItemsCountData = {
  count: number | null;
  data: {
    length: number;
  } | null;
};
// 중고게시물 및 커뮤니티 게시물 + 사진 받아오는 로직
export const fetchData = async (): Promise<{
  usedItems: UsedItem[];
  communityItems: Community[];
}> => {
  try {
    const { data: usedItemsData, error: usedItemsError } = await supabase
      .from('used_item__board')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: communityItemsData, error: communityItemsError } =
      await supabase
        .from('community')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

    if (usedItemsError || communityItemsError) {
      console.error(
        '데이터 베이스에 요청을 실패하였습니다:',
        usedItemsError || communityItemsError
      );
      return { usedItems: [], communityItems: [] };
    }

    const usedItemsWithImages = await Promise.all(
      usedItemsData.map(async (item) => {
        const pathToImage = `pictures/${item.image_Url}.png`;
        const { data } = await supabase.storage
          .from('picture')
          .getPublicUrl(pathToImage);
        return { ...item, data };
      })
    );

    const communityItemsWithImages = await Promise.all(
      communityItemsData.map(async (item) => {
        const pathToImage = `pictures/${item.image_Url}.png`;
        const { data } = supabase.storage
          .from('community_picture')
          .getPublicUrl(pathToImage);
        return { ...item, data };
      })
    );

    return {
      usedItems: usedItemsWithImages || [],
      communityItems: communityItemsWithImages || []
    };
  } catch (error) {
    console.error('수파베이스에 요청 중 실패:', error);
    throw error;
  }
};

const Home = () => {
  // 전체 데이터 개수를 가져오는 쿼리
  const {
    data: usedItemsCountData,
    isLoading: usedItemsCountLoading,
    isError: usedItemsCountError
  } = useQuery<UsedItemsCountData>('usedItemsCount', async () => {
    const count = await supabase.from('used_item__board').select('*');
    return count;
  });

  const {
    data: { usedItems = [], communityItems = [] } = {},
    isLoading,
    isError
  } = useQuery('data', fetchData);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>데이터 불러오기를 실패했습니다.</div>;
  }

  const carouselImages: string[] = [
    process.env.PUBLIC_URL + '/assets/carousel1.png',
    process.env.PUBLIC_URL + '/assets/carousel2.png',
    process.env.PUBLIC_URL + '/assets/carousel3.png'
  ];

  return (
    <HomeContainer>
      <Carousel images={carouselImages} />
      <HomeSection>
        <div className="one">
          <div>
            {<span>{usedItemsCountData?.data?.length}개</span>}의 상품이
            거래되고 있어요!
          </div>
          <LinktoProducts to="/products">전체보기</LinktoProducts>
        </div>

        <SupabaseListContainer>
          {usedItems.map((item) => (
            <SupabaseList key={item.id}>
              {item.image_Url && <img src={item.image_Url} alt="Item" />}

              <h1>{item.quality}</h1>
              <h3>{item.title}</h3>
              <p>{item.price},000원</p>
            </SupabaseList>
          ))}
        </SupabaseListContainer>
      </HomeSection>

      <ComunityContainer>
        <Communitytitle>
          <h2>작업자들의 커뮤니티에 함께해볼까요?</h2>
          <CommunityLink to="/community">전체보기</CommunityLink>
        </Communitytitle>
        <ComunityWrapper>
          {communityItems.map((item) => (
            <ComunityList key={item.post_id}>
              <div>
                {item.image_Url && (
                  <img src={item.image_Url} alt="Community Post" />
                )}
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            </ComunityList>
          ))}
        </ComunityWrapper>
      </ComunityContainer>
    </HomeContainer>
  );
};

const HomeContainer = styled.section`
  border-top: 1px solid #000;
  /* display: flex; */
  flex-direction: column;
`;

const HomeSection = styled.div`
  margin: 0 100px;
  margin-top: 40px;

  span {
    font-weight: bold;
  }
  .one {
    display: flex;
    justify-content: space-between;
    margin: 0 10px;
  }

  h2 {
    text-align: left;
    margin-top: 20px;
    margin-left: 10px;
  }
`;
const LinktoProducts = styled(Link)`
  text-decoration: none;
  color: #000;
  cursor: pointer;
  font-weight: bold;
`;

const SupabaseListContainer = styled.ul`
  width: 100%;
  height: 325px;
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
`;
const SupabaseList = styled.li`
  flex: 1 0 calc(20% - 20px);
  width: 208px;
  height: 325px;
  padding: 10px;
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    height: 208px;
    object-fit: cover;
    border-style: none;
  }
  h1 {
    width: 90px;
    padding: 8px;
    color: #656464;
    text-align: center;
    background-color: rgba(255, 122, 0, 0.1);
    border-radius: 3px;
    margin-top: 10px;
    font-weight: bold;
  }
  h3 {
    font-size: 16px;
    margin-top: 30px;
  }

  p {
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
    text-align: left;
  }
`;
const ComunityContainer = styled.div`
  width: 1110;
  height: 760px;
  display: flex;
  flex-wrap: wrap;
  margin: 0 100px;
  margin-top: 40px;
`;

const Communitytitle = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 80px;
`;
const CommunityLink = styled(Link)`
  text-decoration: none;
  color: #000;
  cursor: pointer;
  font-weight: bold;
`;

const ComunityWrapper = styled.ul`
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const ComunityList = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 120px;
  border: 1px solid #ccc;
  margin-top: 20px;
  background-color: #d9d9d9;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    /* border-radius: 50%; */
    margin-left: 20px;
  }

  div {
    flex: 1;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    color: #555;
  }
`;

export default Home;
