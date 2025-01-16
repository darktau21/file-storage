import type { z } from 'zod';

import { SignupDto } from './signup.dto';

// Extend if needed
// SignupDto.extend({
//  ...other props
// })
export const SigninDto = SignupDto;
export type SigninPayload = z.infer<typeof SigninDto>;
