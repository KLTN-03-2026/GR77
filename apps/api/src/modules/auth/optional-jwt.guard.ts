import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalJwtAuthGuard
 *
 * Same as JwtAuthGuard but does NOT throw 401 when
 * the Authorization header is missing or invalid.
 *
 * If the token is valid  → req.user is populated
 * If the token is absent → req.user stays undefined
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    // If auth fails, just return null instead of throwing
    return user || null;
  }
}
