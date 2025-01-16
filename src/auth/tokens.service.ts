import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import jwt from 'jsonwebtoken';

import { Env } from '../config';
import { db } from '../db';
import { refreshTokens } from '../db/entities/refreshTokens';

type TokenPayload = {
    exp: number;
    iat: number;
    jti: string;
    sub: string; // userID
};

class TokensService {
    private readonly accessPrivateKey: Buffer;
    private readonly accessPublicKey: Buffer;

    constructor() {
        this.accessPrivateKey = fs.readFileSync(Env.ACCESS_PRIVATE_KEY_PATH);
        this.accessPublicKey = fs.readFileSync(Env.ACCESS_PUBLIC_KEY_PATH);
    }

    async deleteRefreshToken(token: string) {
        await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    }

    async generateRefreshToken(userId: string) {
        const token = crypto.randomUUID();
        await db.insert(refreshTokens).values({ token, userId });
        return token;
    }

    signAccessToken(userId: string) {
        const jti = crypto.randomUUID();
        return this.sign(
            { jti, sub: userId },
            Env.ACCESS_TOKEN_EXP_TIME,
            this.accessPrivateKey
        );
    }

    async verifyAccessToken(token: string) {
        try {
            const res = await this.verify(token, this.accessPublicKey);
            return res;
        } catch {
            return null;
        }
    }

    async verifyRefreshToken(token: string) {
        const [tokenRecord] = await db
            .select()
            .from(refreshTokens)
            .where(eq(refreshTokens.token, token));
        await db.delete(refreshTokens).where(eq(refreshTokens.token, token));

        if (!tokenRecord) {
            return null;
        }

        const tokenAge = Date.now() - new Date(tokenRecord.createdAt).getTime();
        const maxAge = Env.REFRESH_TOKEN_EXP_TIME * 1000;

        if (tokenAge > maxAge) {
            return null;
        }

        return tokenRecord;
    }

    private sign<T extends Omit<TokenPayload, 'exp' | 'iat'>>(
        payload: T,
        expiresIn: number,
        key: Buffer
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                key,
                { algorithm: 'RS256', expiresIn: `${expiresIn}s` },
                (err, token) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(token as string);
                    }
                }
            );
        });
    }

    private verify<T extends TokenPayload>(
        token: string,
        key: Buffer
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, key, (err, payload) => {
                if (err || !payload) {
                    reject(err || new Error('Token payload is undefined'));
                } else {
                    resolve(payload as T);
                }
            });
        });
    }
}

export const tokensService = new TokensService();
