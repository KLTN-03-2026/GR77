import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class UploadService {
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_KEY');
        this.bucketName = this.configService.get('SUPABASE_BUCKET') || 'kindlink';

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!this.supabase) {
            throw new Error('Supabase credentials not configured');
        }

        const fileExt = extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new Error(`Supabase storage error: ${error.message}`);
        }

        const { data: publicData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    }
}
