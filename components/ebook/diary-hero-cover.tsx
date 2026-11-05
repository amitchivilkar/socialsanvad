"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  AI_DIARY_VERSION_SLUGS,
  parseAiDiaryVersion,
  type AiDiaryVersionKey,
  type Ebook,
} from "@/lib/ebooks";

function versionKeyForSlug(slug: string): AiDiaryVersionKey {
  if (slug === AI_DIARY_VERSION_SLUGS["2"]) return "2";
  if (slug === AI_DIARY_VERSION_SLUGS.bundle) return "bundle";
  return "1";
}

type Props = {
  versions: Ebook[];
};

export function DiaryHeroCover({ versions }: Props) {
  const searchParams = useSearchParams();
  const key = parseAiDiaryVersion(searchParams.get("v"));
  const ebook =
    versions.find((e) => versionKeyForSlug(e.slug) === key) ?? versions[0];

  return (
    <div className="relative aspect-[2/3] w-full max-w-[260px] lg:max-w-[300px]">
      <div
        className="absolute inset-0"
        style={{
          filter:
            "drop-shadow(0 28px 40px rgba(0,0,0,0.3)) drop-shadow(0 10px 16px rgba(0,0,0,0.16))",
        }}
      >
        <Image
          key={ebook.cover}
          src={ebook.cover}
          alt={ebook.title}
          fill
          priority
          fetchPriority="high"
          className="object-contain object-center"
          sizes="(max-width: 1024px) 260px, 300px"
        />
      </div>
    </div>
  );
}
