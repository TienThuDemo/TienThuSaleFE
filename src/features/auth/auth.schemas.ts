import { z } from 'zod';
import {
  NAME_MAX_LENGTH,
  PASSWORD_DIGIT_REGEX,
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_SPECIAL_REGEX,
  PASSWORD_UPPERCASE_REGEX,
  VIETNAM_PHONE_REGEX,
} from './auth.constants';

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`)
  .max(PASSWORD_MAX_LENGTH, `Mật khẩu không được vượt quá ${PASSWORD_MAX_LENGTH} ký tự`)
  .refine((value) => value === value.trim(), {
    message: 'Mật khẩu không được bắt đầu hoặc kết thúc bằng khoảng trắng',
  })
  .refine((value) => PASSWORD_LOWERCASE_REGEX.test(value), {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái thường',
  })
  .refine((value) => PASSWORD_UPPERCASE_REGEX.test(value), {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái hoa',
  })
  .refine((value) => PASSWORD_DIGIT_REGEX.test(value), {
    message: 'Mật khẩu phải chứa ít nhất một chữ số',
  })
  .refine((value) => PASSWORD_SPECIAL_REGEX.test(value), {
    message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
  });

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu').max(PASSWORD_MAX_LENGTH),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    name: z
      .string()
      .trim()
      .max(NAME_MAX_LENGTH, `Tên không được vượt quá ${NAME_MAX_LENGTH} ký tự`)
      .optional()
      .or(z.literal('')),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => value === '' || VIETNAM_PHONE_REGEX.test(value), {
        message: 'Số điện thoại Việt Nam không hợp lệ',
      })
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })
  .refine(
    (data) => {
      const localPart = data.email.split('@')[0]?.toLowerCase() ?? '';
      const password = data.password.toLowerCase();
      return localPart.length === 0 || !password.includes(localPart);
    },
    {
      path: ['password'],
      message: 'Mật khẩu không được chứa phần local của email',
    },
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;
