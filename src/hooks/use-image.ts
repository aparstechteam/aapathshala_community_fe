import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { handleError } from './error-handle';
import { secondaryAPI } from '@/configs';

export function useCloudflareImage() {
  const [progress, setProgress] = useState(0);

  const getUploadUrl = async (
    fileName: string,
    fileType: string,
    fileSize: number
  ) => {
    try {
      const response = await axios.post(`${secondaryAPI}/api/utils/file/upload`, { fileName, fileType, fileSize },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        }
      );
      return response.data;
    } catch (error) {
      handleError(error as AxiosError, () => getUploadUrl(fileName, fileType, fileSize))
    }
  };

  const uploadImage = async (file: File, folder: string = '') => {
    try {
      const fileName = `${folder}${file?.name.split('.')[0]}_${Math.floor(Math.random() * 1000)}_${Date.now()}`;

      const { uploadUrl, imageUrl } = await getUploadUrl(
        fileName,
        file?.type,
        file?.size
      );

      await axios.put(uploadUrl, file, {
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || 0;
          setProgress(Math.round((loaded * 100) / total));
        },
      });

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const deleteImage = async (imageUrl: string) => {
    try {
      await axios.delete(`${secondaryAPI}/api/utils/file/delete`, {
        data: { url: imageUrl },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      handleError(error as AxiosError, () => deleteImage(imageUrl))
    }
  };

  return {
    progress,
    uploadImage,
    deleteImage,
  };
}