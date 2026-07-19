import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateServiceMenuDeposit,
  getServiceMenuBookingPrice,
  getServiceMenuForBooking,
  ServiceMenuError,
} from "../lib/serviceMenus";

const activeMenu = {
  id: "menu-active",
  storeId: "store-a",
  name: "タイ古式マッサージ 60分",
  category: null,
  description: "",
  durationMinutes: 60,
  price: 9000,
  depositAmount: null,
  depositRate: 15,
  currency: "JPY",
  isActive: true,
  displayOrder: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

test("service menu deposit uses fixed amount when configured", () => {
  assert.equal(
    calculateServiceMenuDeposit({
      price: 12000,
      depositAmount: 3000,
      depositRate: 15,
    }),
    3000
  );
});

test("service menu booking price is derived from database menu values", () => {
  assert.deepEqual(getServiceMenuBookingPrice(activeMenu), {
    totalPrice: 9000,
    deposit: 1350,
  });
});

test("service menu lookup rejects inactive menu reservations", async () => {
  const db = {
    serviceMenu: {
      findFirst: async () => ({
        ...activeMenu,
        isActive: false,
      }),
    },
  };

  await assert.rejects(
    () =>
      getServiceMenuForBooking(db as never, {
        storeId: "store-a",
        menuId: "menu-inactive",
      }),
    (error: unknown) =>
      error instanceof ServiceMenuError && error.code === "MENU_INACTIVE"
  );
});
