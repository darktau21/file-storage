import type { RefreshPayload } from './dto/refresh.dto';
import type { SigninPayload } from './dto/signin.dto';
import type { SignupPayload } from './dto/signup.dto';

import { catchAsync } from '../lib/catchAsync';
import { HttpException } from '../lib/httpException';
import { HttpStatus } from '../lib/httpStatus';
import { authService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';
import { UserDto } from './dto/user.dto';

export function getAuthController() {
    const signUp = catchAsync(async (req, res) => {
        const payload = req.body as SignupPayload;

        const user = await authService.signUp(payload.id, payload.password);

        if (!user) {
            throw new HttpException(
                HttpStatus.CONFLICT,
                `User with id ${payload.id} already exists`
            );
        }

        return res.status(HttpStatus.CREATED).json(UserDto.parse(user));
    });

    const signIn = catchAsync(async (req, res) => {
        const payload = req.body as SigninPayload;
        const tokens = await authService.signIn(payload.id, payload.password);
        if (!tokens) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                `Wrong id or password`
            );
        }

        res.json(TokensDto.parse(tokens));
    });

    const refresh = catchAsync(async (req, res) => {
        const payload = req.body as RefreshPayload;
        const tokens = await authService.refresh(payload.refreshToken);

        if (!tokens) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                `Invalid refresh token`
            );
        }

        res.status(HttpStatus.CREATED).json(TokensDto.parse(tokens));
    });

    const getInfo = catchAsync(async (req, res) => {
        const payload = req.userId as string;
        const user = await authService.getInfo(payload);

        if (!user) {
            throw new HttpException(
                HttpStatus.NOT_FOUND,
                `User with id ${payload} not found`
            );
        }

        res.json(UserDto.parse(user));
    });

    const logout = catchAsync(async (req, res) => {
        const payload = req.body as RefreshPayload;
        await authService.logout(payload.refreshToken);

        res.status(HttpStatus.NO_CONTENT).send();
    });

    return {
        getInfo,
        logout,
        refresh,
        signIn,
        signUp,
    };
}
