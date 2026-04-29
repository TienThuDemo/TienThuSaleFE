import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { loginSchema } from '../auth.schemas';
import type { LoginFormValues } from '../auth.schemas';
import { useLoginMutation } from '../auth.api';
import { useAuthStore, selectIsAuthenticated } from '../auth.store';
import AuthLayout from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import SubmitButton from '../components/SubmitButton';
import { showToast } from '../../../utils/toastService';
import { extractApiErrorMessage } from '../../../common/api/apiServices';
import { AUTH_ROUTES, POST_LOGIN_REDIRECT } from '../auth.constants';

interface LocationState {
  from?: { pathname: string };
}

const LOGIN_DEFAULT_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const fromPath =
    (location.state as LocationState | null)?.from?.pathname ?? POST_LOGIN_REDIRECT;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, navigate, fromPath]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      setSession({ user: result.user, tokens: result.tokens });
      showToast('Đăng nhập thành công.', 'success');
      navigate(fromPath, { replace: true });
    } catch (error) {
      const message = extractApiErrorMessage(
        error as Parameters<typeof extractApiErrorMessage>[0],
        'Email hoặc mật khẩu không đúng.',
      );
      showToast(message, 'error');
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link
            to={AUTH_ROUTES.REGISTER}
            className="font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ban@congty.vn"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <SubmitButton loading={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
