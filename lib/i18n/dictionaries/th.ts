import type { Dictionary } from "./types";

const th: Dictionary = {
  languagePicker: {
    title: "คุณใช้ภาษาอะไร?",
    description: "กรุณาเลือกภาษาที่คุณต้องการดู",
    buttonLabel: "เลือกภาษา",
  },
  bookingMenu: {
    when: {
      now: "ตอนนี้",
      today: "วันนี้",
      later: "ภายหลัง",
    },
    storeOwnerLink: "เข้าสู่ระบบสำหรับเจ้าของร้าน",
    bookingDetails: "รายละเอียดการจอง",
    bookingDate: "วันที่จอง",
    menuHeading: "คุณต้องการเมนูใด?",
    durationHeading: "ใช้เวลากี่นาที?",
    durationLabel: (minutes) => `${minutes} นาที`,
    peopleHeading: "กี่ท่าน?",
    peopleCount: (count) => `${count} ท่าน`,
    menuError: "ไม่สามารถโหลดเมนูได้",
    availabilityCta: "ดูเวลาที่ว่าง",
    uncategorizedLabel: "อื่นๆ",
  },
  signup: {
    title: "ลงทะเบียนร้านค้า",
    subtitle:
      "กรอกข้อมูลด้านล่าง แล้วหน้าจัดการร้านของคุณจะพร้อมใช้งานทันที",
    storeNameLabel: "ชื่อร้าน",
    storeNamePlaceholder: "นวดซากุระ",
    slugLabel: "รหัสสำหรับ URL",
    slugHint: "ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และเครื่องหมายขีดกลางเท่านั้น",
    ownerNameLabel: "ชื่อของคุณ",
    ownerNamePlaceholder: "สมชาย ใจดี",
    emailLabel: "อีเมล",
    emailHint: "ใช้สำหรับเข้าสู่ระบบ",
    passwordLabel: "รหัสผ่าน",
    passwordHint: "อย่างน้อย 12 ตัวอักษร",
    passwordConfirmLabel: "ยืนยันรหัสผ่าน",
    submitButton: "ลงทะเบียนและเริ่มใช้งาน",
    submitButtonLoading: "กำลังลงทะเบียน...",
    errorStoreNameRequired: "กรุณากรอกชื่อร้าน",
    errorSlugInvalid:
      "รหัสสำหรับ URL ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และเครื่องหมายขีดกลางเท่านั้น",
    errorOwnerNameRequired: "กรุณากรอกชื่อของคุณ",
    errorEmailInvalid: "กรุณากรอกอีเมลให้ถูกต้อง",
    errorPasswordTooShort: "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร",
    errorPasswordMismatch: "รหัสผ่านไม่ตรงกัน",
    errorGeneric: "ลงทะเบียนไม่สำเร็จ",
  },
  admin: {
    common: {
      storeTopPageLink: "หน้าเว็บสาธารณะของร้านคุณ",
    },
    dashboard: {
      pageTitle: "จัดการร้านค้า",
      todayStatusHeading: "สถานะวันนี้",
      todaysBookingsLabel: "การจองวันนี้",
      availableSlotsLabel: "ช่วงเวลาว่าง",
      workingStaffLabel: "พนักงานที่ปฏิบัติงาน",
      viewTodayCta: "ดูตารางวันนี้ →",
      bookingsListButton: "รายการจอง",
      scheduleButton: "ตารางเวลา",
      staffButton: "พนักงาน",
      menuButton: "เมนู",
      storeButton: "ข้อมูลร้าน",
      salesButton: "ยอดขาย",
      customersButton: "ลูกค้า",
      networkButton: "เครือข่ายร้านค้า",
    },
  },
};

export default th;
