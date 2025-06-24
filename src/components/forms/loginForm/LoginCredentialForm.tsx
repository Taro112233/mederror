/* eslint-disable @typescript-eslint/no-explicit-any */
export default function LoginCredentialForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (username: string, password: string) => void;
  onBack: () => void;
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const username = (e.target as any).username.value;
        const password = (e.target as any).password.value;
        onSubmit(username, password);
      }}
    >
      <label>Username</label>
      <input name="username" required />
      <label>Password</label>
      <input name="password" type="password" required />
      <button type="button" onClick={onBack}>ย้อนกลับ</button>
      <button type="submit">เข้าสู่ระบบ</button>
    </form>
  );
}
