import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.middleware';
import { getAuthController } from './auth.controller';
import { RefreshDto } from './dto/refresh.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { authenticate } from './middlewares/authenticate.middleware';

export function getAuthRouter() {
    const router = Router();
    const controller = getAuthController();

    router.post('/signin', validateBody(SigninDto), controller.signIn);
    router.post('/signup', validateBody(SignupDto), controller.signUp);
    router.post(
        '/signin/new_token',
        validateBody(RefreshDto),
        controller.refresh
    );
    router.get('/info', authenticate, controller.getInfo);
    router.post('/logout', authenticate, controller.logout);

    return router;
}
