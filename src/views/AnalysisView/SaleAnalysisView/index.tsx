import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs';
import SaleAnalysisDetail from './SaleAnalysisDetail';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { AnalysisSaleResponseDto } from '../../../apis/response/analysis';
import ResponseDto from '../../../apis/response';
import { GET_SALE_ANALYSIS_URL, authorizationHeader } from '../../../constants/api';
import SelectDatetimeView from '../SelectDatetimeView';
import { useCookies } from 'react-cookie';
import useStore from '../../../stores/user.store';
import User from '../../../interfaces/User.interface';
import { useStoreStore } from '../../../stores';


export default function SaleAnalysisView() {


    const {store} = useStoreStore();

    const [saleAmount, setSaleAmount] = useState<number>();
    const [saleCount, setSaleCount] = useState<number>();
    const [avgSaleAmount, setAvgSaleAmount] = useState<number>();

    const [startedAt, setStartedAt] = useState<Dayjs | null>(dayjs('2023-05-10'));
    const [endedAt, setEndedAt] = useState<Dayjs | null>(dayjs('2023-05-10'));

    const [cookies] = useCookies();

    const accessToken = cookies.accessToken;
    
    let isLoad = false;

    //         Event Handler          //
    const getSaleAnalysis = () => {

        if (!accessToken) {
            alert('로그인이 필요합니다.')
            return;
        }

        axios.get(GET_SALE_ANALYSIS_URL(store?.storeId+'', startedAt?.format('YYYY-MM-DD') as string, endedAt?.format('YYYY-MM-DD') as string), authorizationHeader(accessToken))
            .then((response) => getSaleAnalysisResponseHandler(response))
            .catch((error) => getSaleAnalysisErrorHandler(error));
    }

    const handleDatetimeChange = (startedAt: Dayjs, endedAt: Dayjs) => {
        setStartedAt(startedAt);
        setEndedAt(endedAt);
      };

    //              Response Handler                //

    const getSaleAnalysisResponseHandler = (response: AxiosResponse<any, any>) => {
        const { result, message, data } = response.data as ResponseDto<AnalysisSaleResponseDto>
        if (!result) {
            alert(message);
            return;
        }
        if(data) setSaleAnalysisResponse(data);
    }

    //          Error Handler           //

    const getSaleAnalysisErrorHandler = (error: any) => {
        console.log(error.message);
    }

    //          function            //

    const setSaleAnalysisResponse = (data: AnalysisSaleResponseDto) => {
        const { saleAmount, saleCount, avgSaleAmount } = data;
        setSaleAmount(saleAmount);
        setSaleCount(saleCount);
        setAvgSaleAmount(avgSaleAmount);
    }


    //          Use Effect          //

    useEffect(() => {
        if (isLoad) return;
        console.log(startedAt?.format('DD/MM/YYYY'), endedAt?.format('DD/MM/YYYY'));
        isLoad = true;
        getSaleAnalysis();
    }, [startedAt, endedAt]);

    return (
        <Box>
            <Typography align='left' sx={{ fontSize: '3vh', p: '3vh' }}>매출 분석</Typography>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center' }}>
                <SelectDatetimeView startedAt={startedAt as Dayjs} endedAt={endedAt as Dayjs} onDatetimeChange={handleDatetimeChange}/>
            </Box>
            <SaleAnalysisDetail saleAmount={saleAmount as number} saleCount={saleCount as number} avgSaleAmount={avgSaleAmount as number} />
        </Box>

    )
}
