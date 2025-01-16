import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { type SelectUser, users } from '../db/entities/users';
import { tokensService } from './tokens.service';

class AuthService {
    async getInfo(id: string) {
        const [user] = await db
            .selectDistinct()
            .from(users)
            .where(eq(users.id, id));

        if (!user) {
            return null;
        }

        return user;
    }

    async logout(refreshToken: string) {
        await tokensService.deleteRefreshToken(refreshToken);
    }

    async refresh(refreshToken: string) {
        const refreshTokenData =
            await tokensService.verifyRefreshToken(refreshToken);
        if (!refreshTokenData) {
            return null;
        }

        const newRefreshToken = await tokensService.generateRefreshToken(
            refreshTokenData.userId
        );
        const newAccessToken = await tokensService.signAccessToken(
            refreshTokenData.userId
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async signIn(id: string, password: string) {
        const [user] = await db
            .selectDistinct()
            .from(users)
            .where(eq(users.id, id));

        const compareResult = await bcrypt.compare(password, user?.password);

        if (!compareResult) {
            return null;
        }

        const refreshToken = await tokensService.generateRefreshToken(id);
        const accessToken = await tokensService.signAccessToken(id);

        return { accessToken, refreshToken, userId: id };
    }

    async signUp(id: string, password: string): Promise<null | SelectUser> {
        const [user] = await db
            .selectDistinct({ id: users.id })
            .from(users)
            .where(eq(users.id, id));

        if (user) {
            return null;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await db.insert(users).values({ id, password: passwordHash });
        const [createdUser] = await db
            .selectDistinct()
            .from(users)
            .where(eq(users.id, id));

        return createdUser;
    }
}

export const authService = new AuthService();
