import { expo } from "@better-auth/expo";

import { db } from "@base/db";
import * as schema from "@base/db/schema/auth";
import { customSession } from "better-auth/plugins";
import { env } from "@base/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import VerifyEmail from "@base/transactional/verifyEmail";
import ResetPassword from "@base/transactional/resetPassword";
import ChangeEmail from "@base/transactional/changeEmail";
import { waitUntil } from "cloudflare:workers";
const resend = new Resend(env.RESEND_API_KEY as string);
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN, "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendResetPassword: async (data, request) => {
			const { user, url } = data;
			await resend.emails.send({
				from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
				to: user.email,
				subject: "Reset your password",
				react: ResetPassword({
					username: user.name,
					resetUrl: url,
					userEmail: user.email,
				}),
			});
		},
	},

	emailVerification: {
		// sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
				to: user.email,
				subject: "Verify your email",
				react: VerifyEmail({ username: user.name, verifyUrl: url }),
			});
		},
	},

	// uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
	// session: {
	//   cookieCache: {
	//     enabled: true,
	//     maxAge: 60,
	//   },
	// },
	socialProviders: {
		github: {
			enabled: true,
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
		/* 	google:{
			enabled:true,
			clientId:env.GOOGLE_CLIENT_ID,
			clientSecret:env.GOOGLE_CLIENT_SECRET,
		} */
	},

	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,

user: {
  changeEmail: {
    enabled: true,
    updateEmailWithoutVerification: false, 
	async sendChangeEmailVerification(data, request) {
		const { user,newEmail, url } = data;
		console.log("sendChangeEmailVerification", data, request);
		await resend.emails.send({
			from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
			to: newEmail,
			subject: "Verify your email",
			react: VerifyEmail({ username: user.name, verifyUrl: url }),
		});
	},
	async sendChangeEmailConfirmation({ user, newEmail, url }) {
      await resend.emails.send({
        from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: "Approve email change",
        react: ChangeEmail({
          username: user.name,
          newEmail,
          changeEmailUrl: url,
        }),
      }) ;
      
    },
  },
		
		additionalFields: {
			onboardingCompleted: {
				type: "date",
				required: false,
				defaultValue: null,
				input: true,
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
		database: {
			generateId: false,
		},

		// uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
		// https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
		// crossSubDomainCookies: {
		//   enabled: true,
		//   domain: "<your-workers-subdomain>",
		// },
	},

	plugins: [
		expo(),
		customSession(async ({ user,session }) => {
			return {
				user: {
					...user,
					onboardingCompleted: (user as any).onboardingCompleted,
				},
				session: {
					...session,
				},
			};
		}),
	],
});
