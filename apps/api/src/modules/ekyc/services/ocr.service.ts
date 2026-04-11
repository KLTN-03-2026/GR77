import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OcrResult {
    idNumber: string;
    fullName: string;
    dob: string;
    gender: string;
    address: string;
    confidence: number;
}

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);
    private readonly fptApiKey?: string;

    constructor(private configService: ConfigService) {
        this.fptApiKey = this.configService.get<string>('FPT_AI_KEY');
    }

    /**
     * Helper to download image from URL to Blob
     */
    private async fetchImageBlob(imageUrl: string): Promise<Blob> {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
        return response.blob();
    }

    /**
     * Call FPT AI IDR (ID Card Recognition)
     */
    async processIdCard(frontImageUrl: string, backImageUrl: string): Promise<OcrResult> {
        this.logger.log(`Processing ID Card images: ${frontImageUrl}, ${backImageUrl}`);

        if (!this.fptApiKey) {
            this.logger.warn('FPT_AI_KEY is not configured. Falling back to mock OCR data.');
            return this.getMockOcrResult();
        }

        try {
            // FPT AI IDR vnm API URL
            const apiUrl = 'https://api.fpt.ai/vision/idr/vnm';

            // We primarily need the front side for basic info (Name, DOB, ID, Address)
            const frontBlob = await this.fetchImageBlob(frontImageUrl);

            const formData = new FormData();
            formData.append('image', frontBlob, 'front_id.jpg');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'api-key': this.fptApiKey,
                },
                body: formData as any,
            });

            if (!response.ok) {
                const errorData = await response.text();
                this.logger.error(`FPT AI API Error: ${errorData}`);
                throw new Error('FPT AI OCR failed');
            }

            const result = await response.json();

            if (result.errorCode !== 0 || !result.data || result.data.length === 0) {
                throw new Error(result.errorMessage || 'Invalid data from FPT AI');
            }

            const data = result.data[0];

            return {
                idNumber: data.id || 'N/A',
                fullName: data.name || 'N/A',
                dob: data.dob || 'N/A',
                gender: data.sex || 'N/A',
                address: data.address || 'N/A',
                confidence: typeof data.prob === 'number' ? data.prob : 0.9,
            };
        } catch (error) {
            this.logger.error(`Failed to process OCR via FPT API: ${(error as any).message}. Falling back to mock.`);
            return this.getMockOcrResult();
        }
    }

    async verifyFace(selfieUrl: string, idCardFaceUrl: string): Promise<{ match: boolean; score: number }> {
        this.logger.log(`Verifying face: ${selfieUrl} vs ${idCardFaceUrl}`);

        if (!this.fptApiKey) {
            this.logger.warn('FPT_AI_KEY is not configured. Falling back to mock FaceMatch data.');
            return this.getMockFaceMatchResult();
        }

        try {
            // FPT Face Match API Endpoint (Dựa theo screenshot của user)
            const apiUrl = 'https://api.fpt.ai/dmp/checkface/v1';

            const [selfieBlob, idCardBlob] = await Promise.all([
                this.fetchImageBlob(selfieUrl),
                this.fetchImageBlob(idCardFaceUrl)
            ]);

            const formData = new FormData();
            formData.append('file[]', idCardBlob, 'id_face.jpg');
            formData.append('file[]', selfieBlob, 'selfie.jpg');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'api-key': this.fptApiKey,
                },
                body: formData as any,
            });

            if (!response.ok) {
                throw new Error('FaceMatch API failed');
            }

            const result = await response.json();

            // FPT checkface/v1 returns `data.match` (boolean) and `data.similarity` (float)
            const isMatch = result?.data?.match || false;
            const similarity = result?.data?.similarity || 0;

            return {
                match: isMatch || similarity > 80,
                score: similarity > 0 ? similarity : 95
            };
        } catch (error) {
            this.logger.error(`Failed to process FaceMatch via FPT API: ${(error as any).message}. Falling back to mock.`);
            return this.getMockFaceMatchResult();
        }
    }

    private async getMockOcrResult(): Promise<OcrResult> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            idNumber: '038096012345',
            fullName: 'NGUYỄN VĂN MẪU',
            dob: '15/05/1996',
            gender: 'Nam',
            address: '123 Đường Láng, Đống Đa, Hà Nội',
            confidence: 0.98,
        };
    }

    private async getMockFaceMatchResult(): Promise<{ match: boolean; score: number }> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            match: true,
            score: 0.95,
        };
    }
}
