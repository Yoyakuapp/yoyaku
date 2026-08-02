"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { MAX_STORE_IMAGES, MAX_STORE_IMAGE_BYTES } from "@/lib/storeImages";
import type { Locale } from "@/lib/i18n/locales";
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
  adminLocale: Locale;
};

type StripeConnectStatus = {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingCompletedAt: string | null;
};

export default function StoreAdminPage() {
  const { dictionary } = useLocale();
  const t = dictionary.admin.store;

  const fieldsBeforeAddress: [string, keyof StoreInfo][] = [
    [t.storeNameLabel, "name"],
    [t.phoneLabel, "phone"],
    [t.emailLabel, "email"],
  ];

  const fieldsAfterAddress: [string, keyof StoreInfo][] = [
    [t.whatsappLabel, "whatsappNumber"],
    [t.websiteLabel, "websiteUrl"],
  ];

  const bookingMethodFields: [string, keyof StoreInfo][] = [
    [t.bookingMethodPhone, "allowPhoneBooking"],
    [t.bookingMethodWhatsapp, "allowWhatsappBooking"],
    [t.bookingMethodYoyaku, "allowYoyakuBooking"],
  ];

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(
    null
  );
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeError, setStripeError] = useState("");

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
    if (isConnectingStripe) {
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

  function updateTextField(key: keyof StoreInfo, value: string) {
    setStore((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    );
  }

  function updateBooleanField(key: keyof StoreInfo, value: boolean) {
    setStore((current) =>
      current
        ? {
            ...current,
            [key]: value,
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

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !store) {
      return;
    }

    if (store.imageUrls.length >= MAX_STORE_IMAGES) {
      setImageError(t.imageTooManyError(MAX_STORE_IMAGES));
      return;
    }

    if (file.size > MAX_STORE_IMAGE_BYTES) {
      setImageError(t.imageTooLargeError);
      return;
    }

    setImageError("");
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/store/images", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as {
      imageUrls?: string[];
      error?: string;
    } | null;

    if (!response.ok || !data?.imageUrls) {
      setImageError(data?.error ?? t.imageUploadError);
      setIsUploadingImage(false);
      return;
    }

    const uploadedImageUrls = data.imageUrls;

    setStore((current) =>
      current
        ? {
            ...current,
            imageUrls: uploadedImageUrls,
          }
        : current
    );
    setIsUploadingImage(false);
  }

  async function handleImageDelete(url: string) {
    setImageError("");

    const response = await fetch(
      `/api/admin/store/images?url=${encodeURIComponent(url)}`,
      {
        method: "DELETE",
      }
    );

    const data = (await response.json().catch(() => null)) as {
      imageUrls?: string[];
      error?: string;
    } | null;

    if (!response.ok || !data?.imageUrls) {
      setImageError(data?.error ?? t.imageDeleteError);
      return;
    }

    const remainingImageUrls = data.imageUrls;

    setStore((current) =>
      current
        ? {
            ...current,
            imageUrls: remainingImageUrls,
          }
        : current
    );
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
        </Card>

        {isLoading || !store ? (
          <Card>
            <p className="text-center text-sm text-stone-500">{t.loading}</p>
          </Card>
        ) : (
          <>
            <Card className="space-y-3">
              <p className="font-bold">{t.publishStatusHeading}</p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={store.isPublished}
                  onChange={(e) =>
                    updateBooleanField("isPublished", e.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                />
                <span className="text-sm text-stone-700">
                  {t.publishCheckboxLabel}
                  <span className="mt-1 block text-xs text-stone-500">
                    {t.publicUrlLabel(store.slug)}
                  </span>
                </span>
              </label>
            </Card>

            <Card>
              <p className="mb-2 font-bold">
                {t.photosHeading(MAX_STORE_IMAGES)}
              </p>

              <p className="mb-3 text-xs text-stone-500">
                {t.photosDescription}
              </p>

              {store.imageUrls.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {store.imageUrls.map((url) => (
                    <div key={url} className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-28 w-28 rounded-2xl object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleImageDelete(url)}
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white"
                        aria-label={t.deleteImageAriaLabel}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {imageError ? (
                <p className="mt-2 text-sm font-bold text-red-700">
                  {imageError}
                </p>
              ) : null}

              {store.imageUrls.length < MAX_STORE_IMAGES ? (
                <label className="mt-3 block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />

                  <div className="w-full cursor-pointer rounded-2xl border border-dashed border-stone-300 py-3 text-center text-sm font-bold text-stone-600">
                    {isUploadingImage ? t.uploadingPhoto : t.addPhotoButton}
                  </div>
                </label>
              ) : null}
            </Card>

            {fieldsBeforeAddress.map(([label, key]) => (
              <Card key={key}>
                <p className="mb-2 font-bold">{label}</p>

                <input
                  className="w-full rounded-2xl border p-3"
                  value={(store[key] as string | null) ?? ""}
                  onChange={(e) => updateTextField(key, e.target.value)}
                />
              </Card>
            ))}

            <Card>
              <p className="mb-2 font-bold">{t.countryLabel}</p>

              <select
                className="w-full rounded-2xl border p-3"
                value={store.country}
                onChange={(e) => updateTextField("country", e.target.value)}
              >
                {!t.countryOptions.some(([code]) => code === store.country) ? (
                  <option value={store.country}>{store.country}</option>
                ) : null}

                {t.countryOptions.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </Card>

            <Card>
              <p className="mb-2 font-bold">{t.addressLabel}</p>

              <input
                className="w-full rounded-2xl border p-3"
                placeholder={t.addressPlaceholder}
                value={store.address ?? ""}
                onChange={(e) => updateTextField("address", e.target.value)}
              />
            </Card>

            {fieldsAfterAddress.map(([label, key]) => (
              <Card key={key}>
                <p className="mb-2 font-bold">{label}</p>

                <input
                  className="w-full rounded-2xl border p-3"
                  placeholder={
                    key === "websiteUrl" ? t.websitePlaceholder : undefined
                  }
                  value={(store[key] as string | null) ?? ""}
                  onChange={(e) => updateTextField(key, e.target.value)}
                />
              </Card>
            ))}

            <Card>
              <p className="mb-2 font-bold">{t.descriptionLabel}</p>

              <textarea
                rows={4}
                className="w-full rounded-2xl border p-3"
                value={store.description ?? ""}
                onChange={(e) =>
                  updateTextField("description", e.target.value)
                }
              />
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">{t.bookingMethodHeading}</p>

              {bookingMethodFields.map(([label, key]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    type="checkbox"
                    checked={store[key] as boolean}
                    onChange={(e) =>
                      updateBooleanField(key, e.target.checked)
                    }
                    className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                  />
                  <span className="text-sm text-stone-700">{label}</span>
                </label>
              ))}

              <p className="text-xs text-stone-500">{t.bookingMethodHint}</p>
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">{t.cancellationPolicyHeading}</p>

              <p className="text-xs leading-5 text-stone-500">
                {t.cancellationPolicyDescription}
              </p>

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

            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 font-bold">
                  <Icon name="check-circle" className="h-4 w-4 text-stone-400" />
                  {t.stripeHeading}
                </p>

                {stripeStatus?.chargesEnabled ? (
                  <Badge variant="success">{t.stripeConnectedBadge}</Badge>
                ) : stripeStatus?.connected ? (
                  <Badge variant="warning">{t.stripePendingBadge}</Badge>
                ) : (
                  <Badge variant="neutral">{t.stripeNotConnectedBadge}</Badge>
                )}
              </div>

              <p className="text-xs leading-5 text-stone-500">
                {t.stripeDescription}
              </p>

              <div className="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs leading-5 text-stone-600">
                  {t.stripeTrustNote1}
                </p>
                <p className="text-xs leading-5 text-stone-600">
                  {t.stripeTrustNote2}
                </p>
              </div>

              {stripeError ? (
                <p className="text-sm font-bold text-red-700">{stripeError}</p>
              ) : null}

              <Button
                variant={stripeStatus?.chargesEnabled ? "secondary" : "primary"}
                onClick={connectStripe}
                disabled={isConnectingStripe}
              >
                {isConnectingStripe
                  ? t.stripeConnectButtonPreparing
                  : stripeStatus?.connected
                    ? t.stripeConnectButtonContinue
                    : t.stripeConnectButtonStart}
              </Button>
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">{t.depositHeading}</p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={store.requiresDeposit}
                  onChange={(e) =>
                    updateBooleanField("requiresDeposit", e.target.checked)
                  }
                  disabled={!stripeStatus?.chargesEnabled}
                  className="mt-1 h-5 w-5 shrink-0 accent-green-800 disabled:opacity-40"
                />
                <span className="text-sm text-stone-700">
                  {t.depositCheckboxLabel}
                  <span className="mt-1 block text-xs text-stone-500">
                    {stripeStatus?.chargesEnabled
                      ? t.depositHintEnabled
                      : t.depositHintDisabled}
                  </span>
                </span>
              </label>
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
