/* eslint-disable react/no-unstable-nested-components */
'use client';

import Link from 'next/link';
import React, { useMemo } from 'react';
import { categories } from '@/lib/categories';

type KeywordRule = { label: string; href: string; patterns: RegExp[] };

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isProbablyUrl(s: string) {
  return /^(https?:\/\/|www\.)/i.test(s);
}

function normalizeUrl(raw: string) {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  return raw;
}

function stripTrailingPunct(url: string) {
  // common punctuation that users paste after URLs
  const m = url.match(/^(.*?)([)\],.!?:;]+)?$/);
  return { clean: m?.[1] ?? url, trailing: m?.[2] ?? '' };
}

function isExternal(href: string) {
  // Treat absolute URLs not pointing to alo17.tr as external.
  try {
    const u = new URL(href);
    return u.hostname !== 'alo17.tr' && u.hostname !== 'www.alo17.tr';
  } catch {
    return false;
  }
}

function buildCategoryRules(): KeywordRule[] {
  // Build rules for top-level categories only (safe & low-noise).
  return categories.map((c) => {
    const name = c.name.trim();
    const slug = c.slug.trim();
    const escapedName = escapeRegExp(name);
    const escapedSlug = escapeRegExp(slug.replace(/-/g, ' '));

    // Word-ish boundaries for Turkish text: whitespace / start / common punctuation
    const boundaryL = '(^|[\\s(\\[{"\'.,;:!؟…])';
    const boundaryR = '($|[\\s)\\]}",\'.,;:!؟…])';

    return {
      label: name,
      href: `/kategori/${slug}`,
      patterns: [
        new RegExp(`${boundaryL}(${escapedName})${boundaryR}`, 'giu'),
        // allow "ev ve bahçe" match even if user writes slug-like
        new RegExp(`${boundaryL}(${escapedSlug})${boundaryR}`, 'giu'),
      ],
    };
  });
}

function linkifyKeywords(
  text: string,
  rules: KeywordRule[],
  makeNode: (matchedText: string, href: string, key: string) => React.ReactNode
) {
  // Find earliest match among rules; if tie, prefer longer match.
  let best: { start: number; end: number; matched: string; href: string } | null = null;
  for (const rule of rules) {
    for (const re of rule.patterns) {
      re.lastIndex = 0;
      const m = re.exec(text);
      if (!m) continue;
      const matchText = m[2] ?? m[1] ?? m[0];
      const start = m.index + (m[1]?.length ?? 0);
      const end = start + matchText.length;
      if (!best || start < best.start || (start === best.start && end - start > best.end - best.start)) {
        best = { start, end, matched: matchText, href: rule.href };
      }
    }
  }
  if (!best) return [text];

  const before = text.slice(0, best.start);
  const middle = text.slice(best.start, best.end);
  const after = text.slice(best.end);
  return [
    before,
    makeNode(middle, best.href, `${best.href}-${best.start}`),
    ...linkifyKeywords(after, rules, makeNode),
  ].filter((x) => x !== '');
}

export function AutoLinkText({
  text,
  className,
  listingId,
  source = 'text',
  enableInternalLinking = true,
  enableLinkTracking = false,
}: {
  text: string;
  className?: string;
  listingId?: string;
  source?: string;
  enableInternalLinking?: boolean;
  enableLinkTracking?: boolean;
}) {
  // Always on (as agreed): external links are nofollow/ugc.
  const enableExternalNofollow = true;

  const categoryRules = useMemo(() => (enableInternalLinking ? buildCategoryRules() : []), [enableInternalLinking]);

  const onOutboundClick = (href: string) => {
    if (!enableLinkTracking) return;
    try {
      const payload = {
        href,
        listingId: listingId ?? null,
        source,
        ts: Date.now(),
      };
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track/link', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/track/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
      }
    } catch {
      // no-op
    }
  };

  const parts = useMemo(() => {
    const raw = String(text ?? '');
    if (!raw) return [];
    // Split URLs and keep them as tokens
    const tokens = raw.split(/(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi);
    return tokens.filter((t) => t !== '');
  }, [text]);

  const nodes = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      const token = parts[i];
      if (isProbablyUrl(token)) {
        const { clean, trailing } = stripTrailingPunct(token);
        const href = normalizeUrl(clean);
        const external = isExternal(href);
        const rel = enableExternalNofollow && external ? 'nofollow ugc noopener noreferrer' : 'noopener noreferrer';
        out.push(
          <a
            key={`url-${i}-${href}`}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? rel : undefined}
            className="text-blue-600 hover:text-blue-800 underline underline-offset-4 break-words"
            onClick={() => (external ? onOutboundClick(href) : undefined)}
          >
            {clean}
          </a>
        );
        if (trailing) out.push(trailing);
        continue;
      }

      if (enableInternalLinking && categoryRules.length) {
        const linked = linkifyKeywords(token, categoryRules, (matchedText, href, key) => (
          <Link key={`kw-${key}`} href={href} className="text-alo-orange hover:underline underline-offset-4">
            {matchedText}
          </Link>
        ));
        out.push(...linked);
      } else {
        out.push(token);
      }
    }
    return out;
  }, [parts, categoryRules, enableExternalNofollow, enableInternalLinking, enableLinkTracking, listingId, source]);

  return <span className={className}>{nodes}</span>;
}

