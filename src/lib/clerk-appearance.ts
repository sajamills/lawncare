import type { ComponentProps } from "react";
import type { SignIn } from "@clerk/nextjs";

// Shared Clerk appearance config for the SignIn and SignUp pages, built entirely from
// Clerk's documented `variables` + `elements` appearance API (no global CSS targeting
// generated `cl-*` class names). Colors map 1:1 to the LawnGuide design tokens defined
// in globals.css so the auth card matches the rest of the dark-green theme.
//
// Root cause of the original low-contrast bug: only `colorBackground` and `colorPrimary`
// were overridden (to a dark green) while `colorText`/`colorTextSecondary`/etc. were left
// at Clerk's light-theme defaults (near-black), so headings/labels/footer/divider text
// rendered nearly invisible against the dark card.
export const clerkAppearance: ComponentProps<typeof SignIn>["appearance"] = {
  variables: {
    colorPrimary: "var(--color-primary)",
    colorPrimaryForeground: "var(--color-background)",
    colorBackground: "var(--color-surface)",
    colorForeground: "var(--color-text-primary)",
    colorMuted: "var(--color-surface-alt)",
    colorMutedForeground: "var(--color-text-muted)",
    colorInput: "var(--color-surface-alt)",
    colorInputForeground: "var(--color-text-primary)",
    colorBorder: "var(--color-border)",
    colorRing: "var(--color-primary)",
    colorDanger: "var(--color-urgent)",
    colorWarning: "var(--color-warning-text)",
    colorSuccess: "var(--color-primary)",
    colorNeutral: "var(--color-text-muted)",
    colorShadow: "rgba(0, 0, 0, 0.4)",
    colorModalBackdrop: "rgba(0, 0, 0, 0.6)",
    borderRadius: "0.75rem",
  },
  elements: {
    card: {
      backgroundColor: "var(--color-surface)",
      borderColor: "var(--color-border)",
      borderWidth: "1px",
      borderStyle: "solid",
      boxShadow: "none",
    },
    headerTitle: {
      color: "var(--color-text-primary)",
    },
    headerSubtitle: {
      color: "var(--color-text-muted)",
    },
    socialButtonsBlockButton: {
      backgroundColor: "var(--color-surface-alt)",
      borderColor: "var(--color-border)",
      borderWidth: "1px",
      color: "var(--color-text-primary)",
      "&:hover": {
        backgroundColor: "var(--color-border)",
      },
      "&:focus-visible": {
        outline: "2px solid var(--color-primary)",
        outlineOffset: "2px",
      },
    },
    socialButtonsBlockButtonText: {
      color: "var(--color-text-primary)",
    },
    dividerLine: {
      backgroundColor: "var(--color-border)",
    },
    dividerText: {
      color: "var(--color-text-muted)",
    },
    formFieldLabel: {
      color: "var(--color-text-primary)",
    },
    formFieldInput: {
      backgroundColor: "var(--color-surface-alt)",
      borderColor: "var(--color-border)",
      color: "var(--color-text-primary)",
      "&:focus": {
        borderColor: "var(--color-primary)",
      },
      "&[disabled]": {
        opacity: 0.6,
      },
      "&::placeholder": {
        color: "var(--color-text-muted)",
      },
    },
    formFieldHintText: {
      color: "var(--color-text-muted)",
    },
    formFieldErrorText: {
      color: "var(--color-urgent)",
    },
    formFieldSuccessText: {
      color: "var(--color-primary)",
    },
    formFieldAction: {
      color: "var(--color-primary)",
    },
    formButtonPrimary: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-background)",
      "&:hover": {
        backgroundColor: "var(--color-primary)",
        opacity: 0.9,
      },
      "&:focus-visible": {
        outline: "2px solid var(--color-primary)",
        outlineOffset: "2px",
      },
      "&[disabled]": {
        opacity: 0.5,
      },
    },
    footerActionText: {
      color: "var(--color-text-muted)",
    },
    footerActionLink: {
      color: "var(--color-primary)",
      "&:hover": {
        color: "var(--color-primary)",
      },
    },
    identityPreviewText: {
      color: "var(--color-text-primary)",
    },
    identityPreviewEditButton: {
      color: "var(--color-primary)",
    },
    otpCodeFieldInput: {
      backgroundColor: "var(--color-surface-alt)",
      borderColor: "var(--color-border)",
      color: "var(--color-text-primary)",
    },
    badge: {
      backgroundColor: "var(--color-warning-bg)",
      color: "var(--color-warning-text)",
    },
    alertText: {
      color: "var(--color-text-primary)",
    },
    formResendCodeLink: {
      color: "var(--color-primary)",
    },
  },
};
