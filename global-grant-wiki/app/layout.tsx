import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Global Grant Wiki — гранты, стажировки и феллоушипы для молодёжи',
    template: '%s · Global Grant Wiki',
  },
  description:
    'Агрегатор актуальных грантов, стажировок, феллоушипов, хакатонов, research-программ и буткемпов. Мгновенный поиск, живые дедлайны, без регистрации.',
  keywords: ['гранты', 'стажировки', 'феллоушипы', 'хакатоны', 'study abroad', 'scholarships'],
  openGraph: {
    title: 'Global Grant Wiki',
    description: 'Найди свою возможность за 30 секунд.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0e1a' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" /* Dark Mode по умолчанию, как требует ТЗ */
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
