import NextAuth from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Exportăm handlerul NextAuth ca handler pentru rutele API
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };