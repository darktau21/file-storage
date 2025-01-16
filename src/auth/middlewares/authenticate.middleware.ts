import { catchAsync } from '../../lib/catchAsync';
import { HttpException } from '../../lib/httpException';
import { HttpStatus } from '../../lib/httpStatus';
import { tokensService } from '../tokens.service';

export const authenticate = catchAsync(async (req, _res, next) => {
    const [authType, accessToken] = (req.headers.authorization || '').split(
        ' '
    );

    if (authType !== 'Bearer') {
        throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid auth type');
    }

    const tokenData = await tokensService.verifyAccessToken(accessToken);

    if (!tokenData) {
        throw new HttpException(
            HttpStatus.UNAUTHORIZED,
            'Invalid access token'
        );
    }

    req.userId = tokenData.sub;

    next();
});
