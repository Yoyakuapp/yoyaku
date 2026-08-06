"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type CancellationPolicyTier = {
  hoursBefore: number;
  refundPercent: number;
};

type StoreInfo = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
  description: string | null;
  imageUrls: string[];
  websiteUrl: string | null;
  whatsappNumber: string | null;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  requiresDeposit: boolean;
  isPublished: boolean;
  slug: string;
  cancellationPolicy: CancellationPolicyTier[] | null;
  adminLocale: string;
};

type StripeConnectStatus = {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingCompletedAt: string | null;
};

export default function PaymentSettingsPage() {
  const { dictionary } = useLocale();
  const t = dictionary.admin.payment;

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(
    null
  );
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [agreedToStripeTerms, setAgreedToStripeTerms] = useState(false);

  useEffect(() => {
    async function loadStore() {
      const response = await fetch("/api/store", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage(t.loadError);
        setMessageIsError(true);
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as StoreInfo;

      setStore(data);
      setIsLoading(false);
    }

    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadStripeStatus() {
      const response = await fetch("/api/admin/stripe-connect", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as StripeConnectStatus;

      setStripeStatus(data);
    }

    loadStripeStatus();
  }, []);

  async function connectStripe() {
    if (
      isConnectingStripe ||
      (!stripeStatus?.chargesEnabled && !agreedToStripeTerms)
    ) {
      return;
    }

    setStripeError("");
    setIsConnectingStripe(true);

    const response = await fetch("/api/admin/stripe-connect", {
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (!response.ok || !data?.url) {
      setStripeError(data?.error ?? t.stripeConnectErrorGeneric);
      setIsConnectingStripe(false);
      return;
    }

    window.location.href = data.url;
  }

  function updateRequiresDeposit(value: boolean) {
    setStore((current) =>
      current
        ? {
            ...current,
            requiresDeposit: value,
          }
        : current
    );
  }

  function addCancellationTier() {
    setStore((current) =>
      current
        ? {
            ...current,
            cancellationPolicy: [
              ...(current.cancellationPolicy ?? []),
              { hoursBefore: 24, refundPercent: 100 },
            ],
          }
        : current
    );
  }

  function updateCancellationTier(
    index: number,
    field: keyof CancellationPolicyTier,
    value: number
  ) {
    setStore((current) => {
      if (!current) {
        return current;
      }

      const tiers = [...(current.cancellationPolicy ?? [])];
      tiers[index] = { ...tiers[index], [field]: value };

      return { ...current, cancellationPolicy: tiers };
    });
  }

  function removeCancellationTier(index: number) {
    setStore((current) => {
      if (!current) {
        return current;
      }

      const tiers = (current.cancellationPolicy ?? []).filter(
        (_, tierIndex) => tierIndex !== index
      );

      return { ...current, cancellationPolicy: tiers.length > 0 ? tiers : null };
    });
  }

  async function saveStore() {
    if (isSaving || !store) {
      return;
    }

    setMessage("");
    setMessageIsError(false);

    if (
      store.requiresDeposit &&
      (store.cancellationPolicy ?? []).length === 0
    ) {
      setMessage(t.depositRequiresCancellationPolicyError);
      setMessageIsError(true);
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/store", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(store),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setMessage(errorBody?.error ?? t.saveError);
      setMessageIsError(true);
      setIsSaving(false);
      return;
    }

    const data = (await response.json()) as StoreInfo;

    setStore(data);
    setMessage(t.saveSuccess);
    setMessageIsError(false);
    setIsSaving(false);
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">
            {dictionary.admin.common.backToMain}
          </Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-3xl font-bold">{t.pageTitle}</h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            {t.subtitle}
          </p>
        </Card>

        {isLoading || !store ? (
          <Card>
            <p className="text-center text-sm text-stone-500">{t.loading}</p>
          </Card>
        ) : (
          <>
            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 font-bold">
                  <Icon name="check-circle" className="h-4 w-4 text-stone-400" />
                  {t.stripeSectionHeading}
                </p>

                {stripeStatus?.chargesEnabled ? (
                  <Badge variant="success">{t.stripeConnectedBadge}</Badge>
                ) : stripeStatus?.connected ? (
                  <Badge variant="warning">{t.stripePendingBadge}</Badge>
                ) : (
                  <Badge variant="neutral">{t.stripeNotConnectedBadge}</Badge>
                )}
              </div>

              <p className="text-xs leading-5 text-stone-600">
                {t.stripeWhatIsIt}
              </p>

              <div className="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs leading-5 text-stone-600">
                  {t.stripeHowItWorks}
                </p>
                <p className="text-xs leading-5 text-stone-600">
                  {t.stripeOptionalNote}
                </p>
              </div>

              {!stripeStatus?.chargesEnabled ? (
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedToStripeTerms}
                    onChange={(e) => setAgreedToStripeTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                  />
                  <span className="text-sm text-stone-700">
                    {t.stripeAgreeCheckboxLabel}
                  </span>
                </label>
              ) : null}

              {stripeError ? (
                <p className="text-sm font-bold text-red-700">{stripeError}</p>
              ) : null}

              <Button
                variant={stripeStatus?.chargesEnabled ? "secondary" : "primary"}
                onClick={connectStripe}
                disabled={
                  isConnectingStripe ||
                  (!stripeStatus?.chargesEnabled && !agreedToStripeTerms)
                }
              >
                {isConnectingStripe
                  ? t.stripeConnectButtonPreparing
                  : stripeStatus?.connected
                    ? t.stripeConnectButtonContinue
                    : t.stripeConnectButtonStart}
              </Button>

              {!stripeStatus?.chargesEnabled && !agreedToStripeTerms ? (
                <p className="text-xs text-stone-500">
                  {t.stripeAgreeRequiredHint}
                </p>
              ) : null}
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">{t.depositSectionHeading}</p>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 p-3">
                  <input
                    type="radio"
                    name="requiresDeposit"
                    checked={!store.requiresDeposit}
                    onChange={() => updateRequiresDeposit(false)}
                    className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                  />
                  <span className="text-sm text-stone-700">
                    <span className="block font-bold">
                      {t.depositOptionOff}
                    </span>
                    <span className="mt-1 block text-xs text-stone-500">
                      {t.depositExplainOff}
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 p-3">
                  <input
                    type="radio"
                    name="requiresDeposit"
                    checked={store.requiresDeposit}
                    onChange={() => updateRequiresDeposit(true)}
                    disabled={!stripeStatus?.chargesEnabled}
                    className="mt-1 h-5 w-5 shrink-0 accent-green-800 disabled:opacity-40"
                  />
                  <span className="text-sm text-stone-700">
                    <span className="block font-bold">
                      {t.depositOptionOn}
                    </span>
                    <span className="mt-1 block text-xs text-stone-500">
                      {t.depositExplainOn}
                    </span>
                    {!stripeStatus?.chargesEnabled ? (
                      <span className="mt-1 block text-xs font-bold text-red-700">
                        {t.depositRequiresStripeHint}
                      </span>
                    ) : null}
                  </span>
                </label>
              </div>

              <p className="text-xs leading-5 text-stone-500">
                {t.depositNoNeedHint}
              </p>
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">{t.cancellationPolicyHeading}</p>

              <p className="text-xs leading-5 text-stone-500">
                {t.cancellationPolicyDescription}
              </p>

              {store.requiresDeposit ? (
                <p className="text-xs font-bold text-green-800">
                  {t.cancellationPolicyRequiredNote}
                </p>
              ) : null}

              {(store.cancellationPolicy ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(store.cancellationPolicy ?? []).map((tier, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-2xl border border-stone-200 p-3"
                    >
                      <input
                        type="number"
                        min={1}
                        max={720}
                        value={tier.hoursBefore}
                        onChange={(e) =>
                          updateCancellationTier(
                            index,
                            "hoursBefore",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-xl border p-2 text-center"
                      />
                      <span className="whitespace-nowrap text-sm text-stone-600">
                        {t.hoursBeforeSuffix}
                      </span>

                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={tier.refundPercent}
                        onChange={(e) =>
                          updateCancellationTier(
                            index,
                            "refundPercent",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-xl border p-2 text-center"
                      />
                      <span className="whitespace-nowrap text-sm text-stone-600">
                        {t.refundPercentSuffix}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeCancellationTier(index)}
                        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-700"
                        aria-label={t.removeTierAriaLabel}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={addCancellationTier}
                className="w-full rounded-2xl border border-dashed border-stone-300 py-3 text-center text-sm font-bold text-stone-600"
              >
                {t.addTierButton}
              </button>
            </Card>

            {message ? (
              <Card>
                <p
                  className={
                    messageIsError
                      ? "text-sm font-bold text-red-700"
                      : "text-sm font-bold text-green-800"
                  }
                >
                  {message}
                </p>
              </Card>
            ) : null}

            <Button onClick={saveStore} disabled={isSaving}>
              {isSaving ? t.saveButtonLoading : t.saveButton}
            </Button>
          </>
        )}
      </div>
    </AdminFrame>
  );
}


