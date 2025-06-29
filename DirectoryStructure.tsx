// Directory structure:
// └── taro112233-mederror/
//     ├── README.md
//     ├── components.json
//     ├── eslint.config.mjs
//     ├── next.config.ts
//     ├── package.json
//     ├── pnpm-lock.yaml
//     ├── postcss.config.mjs
//     ├── tsconfig.json
//     ├── prisma/
//     │   ├── schema.prisma
//     │   └── seed.ts
//     ├── public/
//     │   └── uploads/
//     └── src/
//         ├── middleware.ts
//         ├── app/
//         │   ├── globals.css
//         │   ├── layout.tsx
//         │   ├── (mainLayout)/
//         │   │   ├── layout.tsx
//         │   │   └── page.tsx
//         │   ├── api/
//         │   │   ├── dashboard/
//         │   │   │   └── route.ts
//         │   │   ├── errorType/
//         │   │   │   └── route.ts
//         │   │   ├── login/
//         │   │   │   └── route.ts
//         │   │   ├── logout/
//         │   │   │   └── route.ts
//         │   │   ├── mederror/
//         │   │   │   └── route.ts
//         │   │   ├── onboarding/
//         │   │   │   └── route.ts
//         │   │   ├── organizations/
//         │   │   │   └── route.ts
//         │   │   ├── register/
//         │   │   │   └── route.ts
//         │   │   ├── security/
//         │   │   │   ├── check-access/
//         │   │   │   │   └── route.ts
//         │   │   │   ├── logout/
//         │   │   │   │   └── route.ts
//         │   │   │   └── verify-password/
//         │   │   │       └── route.ts
//         │   │   ├── severity/
//         │   │   │   └── route.ts
//         │   │   ├── subErrorType/
//         │   │   │   └── route.ts
//         │   │   ├── unit/
//         │   │   │   └── route.ts
//         │   │   └── users/
//         │   │       ├── route.ts
//         │   │       ├── [id]/
//         │   │       │   └── route.ts
//         │   │       └── me/
//         │   │           └── route.ts
//         │   ├── dashboard/
//         │   │   ├── layout.tsx
//         │   │   └── page.tsx
//         │   ├── login/
//         │   │   └── page.tsx
//         │   ├── management/
//         │   │   ├── layout.tsx
//         │   │   ├── page.tsx
//         │   │   ├── developer/
//         │   │   │   └── page.tsx
//         │   │   ├── my-records/
//         │   │   │   └── page.tsx
//         │   │   ├── records/
//         │   │   │   └── page.tsx
//         │   │   ├── settings/
//         │   │   │   ├── page.tsx
//         │   │   │   ├── notifications/
//         │   │   │   │   └── page.tsx
//         │   │   │   ├── profile/
//         │   │   │   │   └── page.tsx
//         │   │   │   └── security/
//         │   │   │       ├── page.tsx
//         │   │   │       ├── 2fa/
//         │   │   │       │   ├── page.tsx
//         │   │   │       │   └── TwoFactorAuthForm.tsx
//         │   │   │       ├── change-password/
//         │   │   │       │   ├── ChangePasswordForm.tsx
//         │   │   │       │   └── page.tsx
//         │   │   │       └── verify/
//         │   │   │           └── page.tsx
//         │   │   └── user/
//         │   │       └── page.tsx
//         │   ├── onboarding/
//         │   │   └── page.tsx
//         │   ├── pending-approval/
//         │   │   └── page.tsx
//         │   ├── register/
//         │   │   └── page.tsx
//         │   ├── report/
//         │   │   ├── layout.tsx
//         │   │   └── new/
//         │   │       └── page.tsx
//         │   └── select-organization/
//         │       └── page.tsx
//         ├── components/
//         │   ├── CardButton.tsx
//         │   ├── DashboardCharts.tsx
//         │   ├── GlobalSidebar.tsx
//         │   ├── button/
//         │   │   └── LogoutButton.tsx
//         │   ├── forms/
//         │   │   ├── ApproveUserTable.tsx
//         │   │   ├── LoginCredentialForm.tsx
//         │   │   ├── LoginForm.tsx
//         │   │   ├── MedErrorForm.tsx
//         │   │   ├── OnboardingForm.tsx
//         │   │   ├── OrganizationSelectForm.tsx
//         │   │   ├── RegisterCredentialForm.tsx
//         │   │   ├── RegisterForm.tsx
//         │   │   └── SelectOrgForm.tsx
//         │   └── ui/
//         │       ├── accordion.tsx
//         │       ├── alert-dialog.tsx
//         │       ├── alert.tsx
//         │       ├── aspect-ratio.tsx
//         │       ├── avatar.tsx
//         │       ├── badge.tsx
//         │       ├── breadcrumb.tsx
//         │       ├── button.tsx
//         │       ├── calendar.tsx
//         │       ├── card.tsx
//         │       ├── carousel.tsx
//         │       ├── chart.tsx
//         │       ├── checkbox.tsx
//         │       ├── collapsible.tsx
//         │       ├── command.tsx
//         │       ├── context-menu.tsx
//         │       ├── dialog.tsx
//         │       ├── drawer.tsx
//         │       ├── dropdown-menu.tsx
//         │       ├── form.tsx
//         │       ├── hover-card.tsx
//         │       ├── input-otp.tsx
//         │       ├── input.tsx
//         │       ├── label.tsx
//         │       ├── menubar.tsx
//         │       ├── navigation-menu.tsx
//         │       ├── pagination.tsx
//         │       ├── popover.tsx
//         │       ├── progress.tsx
//         │       ├── radio-group.tsx
//         │       ├── resizable.tsx
//         │       ├── scroll-area.tsx
//         │       ├── select.tsx
//         │       ├── separator.tsx
//         │       ├── sheet.tsx
//         │       ├── sidebar.tsx
//         │       ├── skeleton.tsx
//         │       ├── slider.tsx
//         │       ├── sonner.tsx
//         │       ├── switch.tsx
//         │       ├── table.tsx
//         │       ├── tabs.tsx
//         │       ├── textarea.tsx
//         │       ├── toggle-group.tsx
//         │       ├── toggle.tsx
//         │       └── tooltip.tsx
//         ├── hooks/
//         │   ├── use-file-upload.ts
//         │   └── use-mobile.ts
//         └── lib/
//             ├── utils.ts
//             └── zodSchemas.ts