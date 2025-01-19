import { secondaryAPI } from "@/configs";
import axios, { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    data: {
        accessToken?: string;
        refreshToken?: string;
        message?: string;
    }
};

export default async function refreshHandler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    try {
        const { refreshToken, accessToken } = req.body
        const refreshResponse = await axios.post(`${secondaryAPI}/api/auth/refresh`, {
            refreshToken: refreshToken
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        res.status(200).json({ data: refreshResponse.data });
    } catch (error) {
        if (error instanceof AxiosError) {
            res.status(500).json(error.response?.data);
        } else {
            res.status(500).json({ data: { message: 'Internal Server Error' } });
        }
    }
}