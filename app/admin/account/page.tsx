"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Account = {
  email: string;
  name: string;
};

export default function AdminAccountPage() {
  const { dictionary } = useLocale();
  const t = dictionary.admin.account;

  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState("");
  const hasLoadedRef = useRef(false);

  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    (async () => {
      try {
        const response = await fetch("/api/account");

        if (!response.ok) {
          setLoadError(t.loadError);
          return;
        }

        const data = (await response.json()) as Account;
        setAccount(data);
        setNewEmail(data.email);
      } catch {
        setLoadError(t.loadError);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingEmail) {
      return;
    }

    setEmailError("");
    setEmailSuccess("");
    setIsSavingEmail(true);

    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "email",
          currentPassword: currentPasswordForEmail,
          newEmail,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setEmailError(data?.error ?? t.emailChangeError);
        return;
      }

      setEmailSuccess(data?.message ?? t.emailChangeSuccess);
      setAccount((current) =>
        current ? { ...current, email: newEmail.toLowerCase() } : current
      );
      setCurrentPasswordForEmail("");
    } catch {
      setEmailError(t.emailChangeError);
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function handleSavePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingPassword) {
      return;
    }

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 12) {
      setPasswordError(t.newPasswordTooShortError);
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError(t.newPasswordMismatchError);
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          currentPassword,
          newPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setPasswordError(data?.error ?? t.passwordChangeError);
        return;
      }

      setPasswordSuccess(data?.message ?? t.passwordChangeSuccess);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch {
      setPasswordError(t.passwordChangeError);
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{dictionary.admin.common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold tracking-widest text-green-800">
            Yoyakus
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>
          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>

          {loadError ? (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {loadError}
            </div>
          ) : account ? (
            <p className="mt-3 text-sm text-stone-600">
              {t.currentEmailLabel}
              <span className="font-bold">{account.email}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-stone-500">{t.loading}</p>
          )}
        </Card>

        <form onSubmit={handleSaveEmail}>
          <Card className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900">
              {t.emailSectionHeading}
            </h2>

            <div>
              <label
                htmlFor="account-new-email"
                className="block text-sm font-bold text-stone-800"
              >
                {t.newEmailLabel}
              </label>
              <input
                id="account-new-email"
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
            </div>

            <div>
              <label
                htmlFor="account-current-password-for-email"
                className="block text-sm font-bold text-stone-800"
              >
                {t.currentPasswordForEmailLabel}
              </label>
              <input
                id="account-current-password-for-email"
                type="password"
                autoComplete="current-password"
                value={currentPasswordForEmail}
                onChange={(event) =>
                  setCurrentPasswordForEmail(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
            </div>

            {emailError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {emailError}
              </div>
            ) : null}

            {emailSuccess ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                {emailSuccess}
              </div>
            ) : null}

            <Button type="submit" disabled={isSavingEmail}>
              {isSavingEmail ? t.emailChangeButtonLoading : t.emailChangeButton}
            </Button>
          </Card>
        </form>

        <form onSubmit={handleSavePassword}>
          <Card className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900">
              {t.passwordSectionHeading}
            </h2>

            <div>
              <label
                htmlFor="account-current-password"
                className="block text-sm font-bold text-stone-800"
              >
                {t.currentPasswordLabel}
              </label>
              <input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
            </div>

            <div>
              <label
                htmlFor="account-new-password"
                className="block text-sm font-bold text-stone-800"
              >
                {t.newPasswordLabel}
              </label>
              <input
                id="account-new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
              <p className="mt-1 text-xs text-stone-400">{t.newPasswordHint}</p>
            </div>

            <div>
              <label
                htmlFor="account-new-password-confirm"
                className="block text-sm font-bold text-stone-800"
              >
                {t.newPasswordConfirmLabel}
              </label>
              <input
                id="account-new-password-confirm"
                type="password"
                autoComplete="new-password"
                value={newPasswordConfirm}
                onChange={(event) =>
                  setNewPasswordConfirm(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
            </div>

            {passwordError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {passwordError}
              </div>
            ) : null}

            {passwordSuccess ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                {passwordSuccess}
              </div>
            ) : null}

            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword
                ? t.passwordChangeButtonLoading
                : t.passwordChangeButton}
            </Button>
          </Card>
        </form>
      </div>
    </AdminFrame>
  );
}

