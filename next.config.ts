// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fhwzyozesipqlhbrwjtq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // Restricts to your public storage bucket
      },
    ],
  },
};

export default nextConfig;