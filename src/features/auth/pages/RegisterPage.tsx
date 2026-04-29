import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { registerSchema } from '../auth.schemas';
import type { RegisterFormValues } from '../auth.schemas';
import { useRegisterMutation } from '../auth.api';
import { useAuthStore, selectIsAuthenticated } from '../auth.store';
import AuthLayout from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import SubmitButton from '../components/SubmitButton';
import { showToast } from '../../../utils/toastService';
import { extractApiErrorMessage } from '../../../common/api/apiServices';
import { AUTH_ROUTES, POST_LOGIN_REDIRECT } from '../auth.constants';

const REGISTER_DEFAULT_VALUES: RegisterFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phoneNumber: '',
};

const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const [registerAccount, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: REGISTER_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(POST_LOGIN_REDIRECT, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await registerAccount({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        name: trimOrUndefined(values.name),
        phoneNumber: trimOrUndefined(values.phoneNumber),
      }).unwrap();
      setSession({ user: result.user, tokens: result.tokens });
      showToast('Đăng ký thành công. Chào mừng bạn đến với Tiến Thu!', 'success');
      navigate(POST_LOGIN_REDIRECT, { replace: true });
    } catch (error) {
      const message = extractApiErrorMessage(
        error as Parameters<typeof extractApiErrorMessage>[0],
        'Đăng ký thất bại. Vui lòng thử lại.',
      );
      showToast(message, 'error');
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Bắt đầu quản lý đơn hàng và hợp đồng chỉ trong vài phút."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link
            to={AUTH_ROUTES.LOGIN}
            className="font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Họ và tên"
          type="text"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          icon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
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
          label="Số điện thoại"
          type="tel"
          autoComplete="tel"
          placeholder="0901234567 (không bắt buộc)"
          icon={<Phone className="w-4 h-4" />}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <FormField
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          icon={<Lock className="w-4 h-4" />}
          hint="Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <SubmitButton loading={isLoading} className="mt-2">
          {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản và đăng nhập'}
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
