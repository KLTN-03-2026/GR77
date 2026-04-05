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
        const fileExt = extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = `${fileName}`;

        // Fallback to local upload if Supabase is not configured
        if (!this.supabase) {
            const fs = require('fs');
            const path = require('path');
            
            const uploadDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const localFilePath = path.join(uploadDir, fileName);
            fs.writeFileSync(localFilePath, file.buffer);
            
            // Return local URL (assumes API is running on localhost:3001)
            const apiUrl = this.configService.get('API_URL') || '(http://localhost:3001)';
            // Wait, apiUrl is likely not set, usually they return the relative path or absolute
            return `http://localhost:3001/uploads/${fileName}`;
        }

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
