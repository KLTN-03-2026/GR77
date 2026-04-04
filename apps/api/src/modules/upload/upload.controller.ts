import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    HttpStatus,
    HttpCode,
    Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import * as express from 'express';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: express.Request) {
        if (!file) {
            throw new Error('File is required!');
        }

        const publicUrl = await this.uploadService.uploadFile(file);

        return {
            url: publicUrl,
            filename: file.originalname,
        };
    }
}
