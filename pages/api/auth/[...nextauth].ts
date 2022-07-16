import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { db, dbUsers } from '../../../database';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Credentials({
      name: 'Custom Login',
      credentials: {
        email: {label: 'Email', type: 'email', placeholder: 'example@mail.com'},
        password: {label: 'Password', type: 'password', placeholder: '******'}
      },
      async authorize(credentials) {
        console.log({credentials});

        return await dbUsers.checkUserCredentials(credentials!.email, credentials!.password);
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  // Custom pages
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register'
  },
  // Session configurations
  session: {
    maxAge: 2592000, // 30 days
    strategy: 'jwt',
    updateAge: 86400
  },

  // Callbacks
  callbacks: {
    async jwt({token, account, user}) {
      // console.log({token, account, user});
      if (account) {
        token.accessToken = account.access_token;

        switch (account.type) {
          case 'credentials':
            token.user = user;
            break;

          case 'oauth':
            token.user = await dbUsers.OAuthToDbUser(user?.email || '', user?.name || '');
            break;
        }
      }

      return token;
    },
    async session({session, token, user}) {
      // console.log({session, token, user});
      session.accessToken = token.accessToken;
      session.user = token.user as any;

      return session;
    }
  }
})