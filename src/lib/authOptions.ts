import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from './mongodbClient';
import User from '../models/User';
import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Check .env credentials first
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@in.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        
        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          // Return admin user object
          await dbConnect();
          let user = await User.findOne({ email: adminEmail, role: 'admin' });
          if (!user) {
            // Create admin user if doesn't exist
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            user = await User.create({
              name: process.env.ADMIN_NAME || 'Admin',
              email: adminEmail,
              password: hashedPassword,
              role: 'admin',
              emailVerified: new Date(),
              disabled: false,
            });
          }
          return user;
        }
        
        // Fallback to database check
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        if (user.role !== 'admin') return null; // Only allow admin login
        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/(auth)/login',
    error: '/(auth)/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 