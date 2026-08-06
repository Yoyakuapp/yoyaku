"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MAX_STORE_IMAGES, MAX_STORE_IMAGE_BYTES } from "@/lib/storeImages";
import type { Locale } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
  cancellationPolicy: { hoursBefore: number; refundPercent: number }[] | null;
  adminLocale: Locale;
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
              <p className="font-bold">{t.paymentLinkHeading}</p>

              <p className="text-xs leading-5 text-stone-500">
                {t.paymentLinkDescription}
              </p>

              <Link href="/admin/payment" className="block">
                <Button variant="secondary">{t.paymentLinkButton}</Button>
              </Link>
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

