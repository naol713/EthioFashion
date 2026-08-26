import type { ReactElement } from 'react';

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }): ReactElement {
  return <div style={{ fontFamily: 'Arial, sans-serif', color: '#0a0a0a' }}><h1>Reset your password</h1><p>Use the button below to choose a new password.</p><a href={resetUrl} style={{ background: '#0a0a0a', color: '#fff', padding: '12px 18px', borderRadius: 6 }}>Reset password</a><p>This link expires in one hour.</p></div>;
}