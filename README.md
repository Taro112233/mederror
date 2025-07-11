This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mederror"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"
```

### Setting up Vercel Blob

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Storage tab
4. Create a new Blob store
5. Copy the `BLOB_READ_WRITE_TOKEN` and add it to your `.env.local` file

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Security Notice

- **ต้องตั้งค่า environment variable `JWT_SECRET` ที่ปลอดภัยใน production**
- ห้าม deploy production โดยไม่มี JWT_SECRET (ระบบจะ throw error)
- JWT access token มีอายุ 2 ชั่วโมง (refresh token/revoke list: coming soon)
- ทุก endpoint ที่ต้องการ auth จะ verify JWT signature เสมอ
- มีการ validate input ด้วย zod ใน API สำคัญ (login, register)
- Cookie เก็บ JWT เป็น httpOnly, secure, sameSite=lax
