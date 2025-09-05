import { prisma } from '~/server/prisma';
import { publicProcedure, router } from '~/server/trpc';
import { z } from 'zod';
import argon2 from 'argon2';
import { generateToken } from '~/utils/jwt';


export const authRouter = router({
    login: publicProcedure.input(
        z.object({
            username: z.string().min(4).max(25), // Arbritrary limits to prevent abuse
            password: z.string().min(6).max(25)
        })
    ).mutation(
        async ({ input }) => {
            const user = await prisma.user.findUnique({
                where: {
                    username: input.username
                }
            });
            if (!user) {
                return ({
                    token: null,
                    err: 'User not found!'
                })
            }
            if (!(await argon2.verify(user.passwordHash, input.password))) {
                return ({
                    token: null,
                    err: 'Invalid password!'
                });
            }
            // Identity verification complete.
            
            const token = generateToken(
                {
                    sub: user.uuid,
                    user: user.username,
                    iat: Math.floor(Date.now() / 1000)
                }
            )

            return ({
                token: token,
                err: null,
            });
        }
    )
})