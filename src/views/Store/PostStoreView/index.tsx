import { Box, Fab, IconButton, Input, Typography } from '@mui/material'
import React, { ChangeEvent, Dispatch, useEffect, useRef, useState } from 'react'
import { useCookies } from 'react-cookie';
import { PostStoreResponseDto } from '../../../apis/response/store';
import axios, { AxiosResponse } from 'axios';
import { PostStoreRequestDto } from '../../../apis/request/store';
import ResponseDto from '../../../apis/response';
import { FILE_UPLOAD_URL, POST_STORE_URL, authorizationHeader, mutipartHeader } from '../../../constants/api';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../../stores';
import { Navigation } from '../../../constants/navigationEnum';

export default function PostStoreView() {

    const {setNavigation} = useNavigationStore();

    const navigator = useNavigate();

    const [cookies] = useCookies();

    const accessToken = cookies.accessToken;

    const imageRef = useRef<HTMLInputElement | null>(null);

    const [postStore, setPostStore] = useState<PostStoreResponseDto | null>(null);
    const [storeCloseTime, setStoreCloseTime] = useState<string>('');
    const [storeImgUrl, setStoreImgUrl] = useState<string>('');
    const [storeLogoUrl, setStoreLogoUrl] = useState<string>('');
    const [storeName, setStoreName] = useState<string>('');
    const [storeOpenTime, setStoreOpenTime] = useState<string>('');


    //          Event Handler          //


    const onPostStore = () => {
        if (!accessToken) {
            alert('로그인이 필요합니다.');
            return;
        }
        const data: PostStoreRequestDto = {
            storeCloseTime: parseInt(storeCloseTime),
            storeImgUrl,
            storeLogoUrl,
            storeName,
            storeOpenTime: parseInt(storeOpenTime)
        };

        axios.post(POST_STORE_URL, data, authorizationHeader(accessToken))
            .then((response) => postStoreResponseHandler(response))
            .catch((error) => postStoreErrorHandler(error));
    }

    const storeImageUploadChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const data = new FormData();
        data.append('file', event.target.files[0]);

        axios.post(FILE_UPLOAD_URL, data, mutipartHeader())
            .then((response) => storeImageUploadResponseHandler(response))
            .catch((error) => storeImageUplloadErrorHandler(error));
    }

    const storeLogoUploadChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const data = new FormData();
        data.append('file', event.target.files[0]);

        axios.post(FILE_UPLOAD_URL, data, mutipartHeader())
            .then((response) => storeLogoUploadResponseHandler(response))
            .catch((error) => storeLogoUploadErrorHandler(error));
    }

    const onWriteHandler = () => {
        if (!storeName.trim() || !storeOpenTime.trim() || !storeCloseTime.trim()) {
            alert('모든 내용을 입력해주세요.');
            return;
        }
        onPostStore();
        setNavigation(Navigation.Store);
    }

    const onStoreNameChangeHandler = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const value = event.target.value;
        setStoreName(value);
    }

    const onImageUploadButtonHandler = () => {
        if (!imageRef.current) return;
        imageRef.current.click();
    }

    //          Response Handler          //

    const postStoreResponseHandler = (response: AxiosResponse<any, any>) => {
        const { result, message, data } = response.data as ResponseDto<PostStoreResponseDto>;
        if (!result || !data) {
            alert(message);
            return;
        }
        setPostStore(data);
    }

    const storeImageUploadResponseHandler = (response: AxiosResponse<any, any>) => {
        const imageUrl = response.data as string;
        if (!imageUrl) return;
        setStoreImgUrl(imageUrl);
    }

    const storeLogoUploadResponseHandler = (response: AxiosResponse<any, any>) => {
        const imageUrl = response.data as string;
        if (!imageUrl) return;
        setStoreLogoUrl(imageUrl);
    }

    //          Error Handler          //

    const postStoreErrorHandler = (error: any) => {
        console.log(error.message);
    }

    const storeImageUplloadErrorHandler = (error: any) => {
        console.log(error.message);
    }

    const storeLogoUploadErrorHandler = (error: any) => {
        console.log(error.message);
    }

    //          Use Effect          //
    useEffect(() => {
        if (!accessToken) {
            alert('로그인이 필요한 작업입니다.');
            navigator('/auth');
        }
    }, []);

    return (
        <Box sx={{ display: 'flex', height: '100%' }}>
            <Box>
                <Typography>점포명</Typography>
                <Input placeholder='점포명을 입력하세요.' onChange={(event) => setStoreName(event.target.value)} />
                <Typography>오픈 시간</Typography>
                <Input placeholder='오픈 시간을 입력하세요.' onChange={(event) => setStoreOpenTime(event.target.value)} />
                <Typography>마감 시간</Typography>
                <Input placeholder='마감 시간을 입력하세요.' onChange={(event) => setStoreCloseTime(event.target.value)} />
                <Typography>점포 이미지</Typography>
                <IconButton onClick={() => onImageUploadButtonHandler()}>
                    <ImageOutlinedIcon />
                    <input ref={imageRef} hidden type='file' accept='image/*' onChange={(event) => storeImageUploadChangeHandler(event)} />
                </IconButton>
                <Box sx={{ width: '100%' }} component='img' src={storeImgUrl} />
                <Typography>점포 로고 이미지</Typography>
                <IconButton onClick={() => onImageUploadButtonHandler()}>
                    <ImageOutlinedIcon />
                    <input ref={imageRef} hidden type='file' accept='image/*' onChange={(event) => storeLogoUploadChangeHandler(event)} />
                </IconButton>
                <Box sx={{ width: '100%' }} component='img' src={storeLogoUrl} />
            </Box>
            <IconButton onClick={()=>setNavigation(Navigation.Store)}>
                <Typography>뒤로가기</Typography>
            </IconButton>
            <Fab sx={{ position: 'fixed', bottom: '200px', right: '248px', backgroundColor: '#999999' }} onClick={onWriteHandler}>
                <AddBusinessIcon />
            </Fab>
        </Box>
    )
}
