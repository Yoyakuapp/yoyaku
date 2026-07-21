import { createHash } from "crypto";

import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/prisma";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";

const MODEL = "claude-haiku-4-5";

function hashSourceText(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

let cachedClient: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  cachedClient = apiKey ? new Anthropic({ apiKey }) : null;

  return cachedClient;
}

async function callTranslationApi(
  client: Anthropic,
  text: string,
  targetLocale: Locale
): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system:
        "You translate short menu text for a massage/relaxation salon booking app. Reply with ONLY the translated text on a single line. No quotes, no explanation, no romanization, nothing else.",
      messages: [
        {
          role: "user",
          content: `Translate the following text into ${LOCALE_LABELS[targetLocale]} (locale: ${targetLocale}). Keep numbers and units natural for that language.\n\nText: ${text}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") {
      return null;
    }

    const translated = textBlock.text.trim();

    return translated || null;
  } catch {
    return null;
  }
}

export async function translateText(
  sourceText: string,
  targetLocale: Locale
): Promise<string> {
  const trimmed = sourceText.trim();

  if (!trimmed) {
    return sourceText;
  }

  const sourceTextHash = hashSourceText(trimmed);

  const cached = await prisma.translationCache.findUnique({
    where: {
      sourceTextHash_targetLocale: {
        sourceTextHash,
        targetLocale,
      },
    },
  });

  if (cached) {
    return cached.translatedText;
  }

  const client = getClient();

  if (!client) {
    return sourceText;
  }

  const translated = await callTranslationApi(client, trimmed, targetLocale);

  if (!translated) {
    return sourceText;
  }

  await prisma.translationCache
    .upsert({
      where: {
        sourceTextHash_targetLocale: {
          sourceTextHash,
          targetLocale,
        },
      },
      update: {
        translatedText: translated,
      },
      create: {
        sourceTextHash,
        sourceText: trimmed,
        targetLocale,
        translatedText: translated,
      },
    })
    .catch(() => null);

  return translated;
}
