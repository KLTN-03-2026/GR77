
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('API Key length:', process.env.POLYGONSCAN_API_KEY?.length || 0);
console.log('API Key exists:', !!process.env.POLYGONSCAN_API_KEY);
