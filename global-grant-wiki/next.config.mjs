/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Разрешаем external-логотипы организаторов + Supabase Storage
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // TODO (Prod): сузить до allow-list доменов организаторов
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'date-fns'],
  },
};

export default nextConfig;
