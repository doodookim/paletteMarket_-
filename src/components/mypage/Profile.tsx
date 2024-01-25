import React, { useEffect, useRef, useState } from 'react';
import {
  StMobileNav,
  StNicknameAndButton,
  StProfileButtonWrapper,
  StProfileContainer,
  StProfileContent,
  StProfileContentContainer,
  StProfileContentWrapper,
  StProfileImageWrapper
} from '../../styles/mypageStyle/ProfileStyle';
import { supabase } from '../../api/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getUserProfile,
  updateUserImage,
  updateUserNickname
} from '../../api/supabase/profile';
import { userId } from '../../util/getUserId';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userNickname, setUserNickname] = useState<string | undefined>();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [imagePath, setImagePath] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: () => getUserProfile(userId)
  });

  // profile 수정 버튼
  const clickEditHandler = () => {
    setIsEditing(true);
  };

  // profile 수정 취소
  const cancelEditHandler = () => {
    setIsEditing(false);
  };

  // nickname input onChange
  const onChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserNickname(e.target.value);
  };

  // auth에 있는 avatar_url 변경
  const updateAuthAvatarHandler = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_url: profileImage }
    });
  };

  // 사진 업로드 버튼 클릭
  const clickUploadProfileImage = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const { mutate: updateNickname } = useMutation(updateUserNickname, {
    onSuccess: () => {
      queryClient.invalidateQueries('userData');
    }
  });

  const { mutate: updateProfileImage } = useMutation(updateUserImage, {
    onSuccess: () => {
      queryClient.invalidateQueries('userData');
    }
  });

  const clickUpdateProfile = () => {
    if (userNickname && userId) {
      updateNickname({
        nickname: userNickname,
        id: userId
      });
    }

    if (profileImage && userId) {
      updateProfileImage({
        avatar_url: profileImage,
        id: userId
      });
    }
    updateAuthAvatarHandler();
    setIsEditing(false);
  };

  const getUrl = async () => {
    if (imagePath !== undefined) {
      const { data } = await supabase.storage
        .from('profiles')
        .getPublicUrl(imagePath);
      setProfileImage(data.publicUrl);
    }
  };

  useEffect(() => {
    getUrl();
  }, [imagePath]);

  const uploadProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let file = e.target.files[0];
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(userId + '/' + uuidv4(), file, {
          upsert: true
        });

      if (data) {
        setImagePath(data?.path);
      } else {
        console.log(error);
      }
    }
  };

  return (
    <StProfileContainer>
      <StMobileNav>
        <h2>마이페이지</h2>
        {isEditing ? (
          <StProfileButtonWrapper>
            <button onClick={cancelEditHandler}>취소</button>
            <button onClick={clickUpdateProfile}>저장</button>
          </StProfileButtonWrapper>
        ) : (
          <button onClick={clickEditHandler}>수정하기</button>
        )}
      </StMobileNav>

      {userData?.map((user) => {
        return (
          <StProfileContentContainer key={user.id}>
            <StProfileImageWrapper>
              <img
                src={!profileImage ? user.avatar_url : profileImage}
                alt="사용자 프로필 사진"
              />
              <input
                type="file"
                ref={fileInput}
                onChange={(e) => uploadProfileImage(e)}
              />
              {isEditing ? (
                <button onClick={clickUploadProfileImage}>사진 업로드</button>
              ) : (
                ''
              )}
            </StProfileImageWrapper>

            <StProfileContentWrapper>
              <StNicknameAndButton>
                {isEditing ? (
                  <input
                    defaultValue={
                      !user.nickname ? user.username : user.nickname
                    }
                    onChange={onChangeNickname}
                    placeholder="최대 8자"
                    maxLength={8}
                  />
                ) : (
                  <h2>{!user.nickname ? user.username : user.nickname}</h2>
                )}
                {isEditing ? (
                  <StProfileButtonWrapper>
                    <button onClick={cancelEditHandler}>취소</button>
                    <button onClick={clickUpdateProfile}>저장</button>
                  </StProfileButtonWrapper>
                ) : (
                  <button onClick={clickEditHandler}>수정하기</button>
                )}
              </StNicknameAndButton>

              <StProfileContent>
                <span>이름</span>
                <span>{user.username}</span>
                <span>이메일</span>
                <span>{user.email}</span>
              </StProfileContent>
            </StProfileContentWrapper>
          </StProfileContentContainer>
        );
      })}
    </StProfileContainer>
  );
};

export default Profile;
