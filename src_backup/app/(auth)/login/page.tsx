import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n';
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "ورود | نوجَست",
  description: "ورود به نوجَست و کشف محصولات نو",
}

export default async function LoginPage() {
  // Get locale from cookies on the server side
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  const locale = (localeCookie ? localeCookie.value : 'fa') as Locale;
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {locale === 'fa' ? 'ورود به حساب کاربری' : 'Sign In to your account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'fa' 
              ? 'برای ورود، ایمیل و رمز عبور خود را وارد کنید' 
              : 'Enter your email and password to sign in'
            }
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          {locale === 'fa' ? 'حساب کاربری ندارید؟' : 'Don\'t have an account?'}{' '}
          <Link href="/signup" className="hover:text-primary underline underline-offset-4">
            {locale === 'fa' ? 'ثبت نام کنید' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
} 