import { Module, Global } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

/**
 * Global module — import once in AppModule,
 * BlockchainService available everywhere via DI.
 */
@Global()
@Module({
    providers: [BlockchainService],
    exports: [BlockchainService],
})
export class BlockchainModule { }
