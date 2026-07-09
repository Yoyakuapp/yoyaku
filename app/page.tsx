"use client";

import { useState } from "react";

type Step = "start" | "date" | "details" | "availability" | "confirm" | "profile";
type ViewMode = "simple" | "table";

export default function Home() {
  const [step, setStep] = useState<Step>("start");
  const [when, setWhen] = useState("今すぐ");
  const [date, setDate] = useState("2026-07-09");
  const [duration, setDuration] = useState("60分");
  const [people, setPeople] = useState("1人");
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [profileName, setProfileName] = useState("");

  const staff = ["AIKO", "EMI", "YUNA"];

  const staffProfiles: Record<string, string> = {
    AIKO: "深い圧の施術が得意です。肩・首まわりのケアにおすすめです。",
    EMI: "リラックス系の施術が得意です。初めての方にもおすすめです。",
    YUNA: "ストレッチを取り入れた施術が得意です。全身を整えたい方におすすめです。",
  };

  const times = Array.from({ length: 21 }, (_, i) => {
    const totalMinutes = 10 * 60 + i * 30;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  const availability: Record<string, string[]> = {};
  times.forEach((time, index) => {
    if (index % 5 === 0) availability[time] = ["AIKO", "EMI"];
    else if (index % 4 === 0) availability[time] = ["EMI", "YUNA"];
    else if (index % 3 === 0) availability[time] = ["AIKO", "YUNA"];
    else availability[time] = ["AIKO", "EMI", "YUNA"];
  });

  function peopleCount() {
    return Number(people.replace("人", ""));
  }

  function durationSlots() {
    if (duration === "30分") return 1;
    if (duration === "60分") return 2;
    if (duration === "90分") return 3;
    return 4;
  }

  function canBook(time: string, name: string) {
    const startIndex = times.indexOf(time);
    const slotsNeeded = durationSlots();
    if (startIndex === -1) return false;
    if (startIndex + slotsNeeded > times.length) return false;

    for (let i = 0; i < slotsNeeded; i++) {
      const checkTime = times[startIndex + i];
      if (!availability[checkTime]?.includes(name)) return false;
    }
    return true;
  }

  function getCombinations(items: string[], count: number): string[][] {
    if (count === 1) return items.map((item) => [item]);
    if (count > items.length) return [];
    const result: string[][] = [];

    function combine(start: number, current: string[]) {
      if (current.length === count) {
        result.push(current);
        return;
      }
      for (let i = start; i < items.length; i++) {
        combine(i + 1, [...current, items[i]]);
      }
    }

    combine(0, []);
    return result;
  }

  function bookableCombinations(time: string) {
    const bookableStaff = staff.filter((name) => canBook(time, name));
    return getCombinations(bookableStaff, peopleCount());
  }

  function chooseSlot(time: string, names: string[]) {
    setSelectedTime(time);
    setSelectedStaff(names);
    setStep("confirm");
  }

  function openProfile(name: string) {
    setProfileName(name);
    setStep("profile");
  }

  return (
    <main className="min-h-screen bg-[#f3f0ea] flex items-center justify-center p-4">
      <section className="w-full max-w-sm overflow-hidden rounded-[36px] bg-white shadow-2xl">
        <div className="relative h-[190px] bg-gradient-to-br from-[#2b241d] via-[#5f4b36] to-[#c9ad7f] text-white">
          <div className="absolute inset-0 bg-black/35"></div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
            <div className="text-3xl text-[#d8b86a]">✦</div>
            <h1 className="mt-2 font-serif text-5xl">Sakura</h1>
            <p className="font-serif text-2xl text-[#d8b86a]">Thai Massage</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span>★ 4.8</span>
              <span>● 営業中 10:00-20:00</span>
            </div>
          </div>
        </div>

        <div className="-mt-7 relative z-20 rounded-t-[36px] bg-white px-6 pb-7 pt-8">
          {step === "start" && (
            <>
              <h2 className="text-center text-3xl font-bold text-[#21472d]">いつ予約しますか？</h2>
              <div className="mt-7 space-y-3">
                {["今すぐ", "今日", "後日"].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      setWhen(label);
                      if (label === "後日") setStep("date");
                      else {
                        setViewMode(label === "今すぐ" ? "simple" : "table");
                        setStep("details");
                      }
                    }}
                    className={
                      label === "今すぐ"
                        ? "w-full rounded-3xl bg-[#21472d] px-5 py-4 text-left text-white shadow-md"
                        : "w-full rounded-3xl border border-stone-200 bg-white px-5 py-4 text-left text-[#21472d] shadow-sm"
                    }
                  >
                    <p className="text-xl font-bold">{label}</p>
                    <p className="mt-1 text-sm opacity-70">
                      {label === "今すぐ" ? "直近の空き時間を探す" : label === "今日" ? "本日の空き時間を探す" : "日付を選んで探す"}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "date" && (
            <>
              <button onClick={() => setStep("start")} className="mb-4 text-sm text-stone-500">← 戻る</button>
              <h2 className="text-center text-3xl font-bold text-[#21472d]">日付を選ぶ</h2>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-7 w-full rounded-3xl border border-stone-200 px-5 py-5 text-lg font-bold text-[#21472d]"
              />
              <button onClick={() => setStep("details")} className="mt-8 w-full rounded-3xl bg-[#21472d] py-5 text-xl font-bold text-white">次へ</button>
            </>
          )}

          {step === "details" && (
            <>
              <button onClick={() => setStep(when === "後日" ? "date" : "start")} className="mb-4 text-sm text-stone-500">← 戻る</button>
              <p className="text-center text-sm text-stone-500">{when === "後日" ? date : when} の予約</p>
              <h2 className="mt-1 text-center text-3xl font-bold text-[#21472d]">予約内容</h2>

              <p className="mt-6 mb-3 font-bold text-[#21472d]">何分受けますか？</p>
              <div className="grid grid-cols-4 gap-2">
                {["30分", "60分", "90分", "120分"].map((item) => (
                  <button key={item} onClick={() => setDuration(item)}
                    className={duration === item ? "rounded-2xl bg-[#21472d] py-4 text-sm font-bold text-white" : "rounded-2xl border border-stone-200 py-4 text-sm font-bold text-[#21472d]"}>
                    {item}
                  </button>
                ))}
              </div>

              <p className="mt-6 mb-3 font-bold text-[#21472d]">何人で受けますか？</p>
              <div className="grid grid-cols-4 gap-2">
                {["1人", "2人", "3人", "4人"].map((item) => (
                  <button key={item} onClick={() => setPeople(item)}
                    className={people === item ? "rounded-2xl bg-[#21472d] py-4 text-sm font-bold text-white" : "rounded-2xl border border-stone-200 py-4 text-sm font-bold text-[#21472d]"}>
                    {item}
                  </button>
                ))}
              </div>

              <button onClick={() => setStep("availability")} className="mt-8 w-full rounded-3xl bg-[#21472d] py-5 text-xl font-bold text-white">空き時間を探す</button>
            </>
          )}

          {step === "availability" && (
            <>
              <button onClick={() => setStep("details")} className="mb-4 text-sm text-stone-500">← 戻る</button>
              <p className="text-center text-sm text-stone-500">{when === "後日" ? date : when}・{duration}・{people}</p>
              <h2 className="mt-1 text-center text-2xl font-bold text-[#21472d]">予約できる時間</h2>

              {when !== "今すぐ" && (
                <div className="mt-5 grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
                  <button onClick={() => setViewMode("simple")} className={viewMode === "simple" ? "rounded-xl bg-white py-2 font-bold text-[#21472d] shadow-sm" : "py-2 font-bold text-stone-500"}>シンプル</button>
                  <button onClick={() => setViewMode("table")} className={viewMode === "table" ? "rounded-xl bg-white py-2 font-bold text-[#21472d] shadow-sm" : "py-2 font-bold text-stone-500"}>表</button>
                </div>
              )}

              {viewMode === "simple" && (
                <div className="mt-6 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {times.map((time) => {
                    const combinations = bookableCombinations(time);
                    if (combinations.length === 0) return null;
                    return (
                      <div key={time} className="rounded-3xl border border-stone-200 p-4">
                        <p className="mb-3 text-xl font-bold text-[#21472d]">{time}</p>
                        <div className="space-y-2">
                          {combinations.map((names) => (
                            <button key={names.join("-")} onClick={() => chooseSlot(time, names)} className="w-full rounded-2xl bg-[#21472d] px-4 py-3 text-left text-sm font-bold text-white">
                              {names.join(" + ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === "table" && (
                <div className="mt-6 max-h-[390px] overflow-auto rounded-3xl border border-stone-200">
                  <div className="grid grid-cols-4 bg-[#f7f5f0] text-center text-sm font-bold text-[#21472d] sticky top-0">
                    <div className="py-3">時間</div>
                    {staff.map((name) => (
                      <button key={name} onClick={() => openProfile(name)} className="py-3 underline underline-offset-4">
                        {name}
                      </button>
                    ))}
                  </div>

                  {times.map((time) => (
                    <div key={time} className="grid grid-cols-4 border-t border-stone-200 text-center">
                      <div className="py-4 text-sm font-bold text-stone-500">{time}</div>
                      {staff.map((name) => {
                        const ok = canBook(time, name);
                        return (
                          <button key={name} disabled={!ok} onClick={() => chooseSlot(time, [name])}
                            className={ok ? "m-2 rounded-2xl bg-[#21472d] py-3 text-white font-bold" : "m-2 rounded-2xl bg-stone-100 py-3 text-stone-300"}>
                            {ok ? "○" : "×"}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === "profile" && (
            <>
              <button onClick={() => setStep("availability")} className="mb-4 text-sm text-stone-500">← 戻る</button>
              <h2 className="text-center text-3xl font-bold text-[#21472d]">{profileName}</h2>
              <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#21472d] text-3xl font-bold text-white">
                {profileName.slice(0, 1)}
              </div>
              <p className="mt-6 rounded-3xl bg-[#f7f5f0] p-5 text-[#3b3029]">
                {staffProfiles[profileName]}
              </p>
            </>
          )}

          {step === "confirm" && (
            <>
              <button onClick={() => setStep("availability")} className="mb-4 text-sm text-stone-500">← 戻る</button>
              <h2 className="text-center text-3xl font-bold text-[#21472d]">予約内容の確認</h2>

              <div className="mt-7 rounded-3xl bg-[#f7f5f0] p-5 text-[#3b3029]">
                <p className="text-sm text-stone-500">店舗</p>
                <p className="mb-4 text-xl font-bold">Sakura Thai Massage</p>
                <p className="text-sm text-stone-500">日時</p>
                <p className="mb-4 text-xl font-bold">{when === "後日" ? date : when} {selectedTime}</p>
                <p className="text-sm text-stone-500">スタッフ</p>
                <p className="mb-4 text-xl font-bold">{selectedStaff.join(" + ")}</p>
                <p className="text-sm text-stone-500">コース</p>
                <p className="mb-4 text-xl font-bold">{duration}</p>
                <p className="text-sm text-stone-500">人数</p>
                <p className="text-xl font-bold">{people}</p>
              </div>

              <button className="mt-7 w-full rounded-3xl bg-[#21472d] py-5 text-xl font-bold text-white">予約者情報へ進む</button>
            </>
          )}

          <p className="mt-6 text-center text-stone-500">
            Powered by <span className="font-bold text-[#21472d]">Yoyaku</span>
          </p>
        </div>
      </section>
    </main>
  );
}