"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      expand={true}
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142.1 76.2% 36.3%)",
          "--success-text": "hsl(355.7 100% 97.3%)",
          "--success-border": "hsl(142.1 76.2% 36.3%)",
          "--error-bg": "hsl(0 84.2% 60.2%)",
          "--error-text": "hsl(355.7 100% 97.3%)",
          "--error-border": "hsl(0 84.2% 60.2%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
