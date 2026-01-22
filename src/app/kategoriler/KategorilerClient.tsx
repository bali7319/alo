'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import { categories as categoryTree, type Category } from '@/lib/categories';

function countDescendants(node: Category | undefined): number {
  if (!node?.subcategories?.length) return 0;
  return node.subcategories.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
}

function getDirectSubCount(node: Category): number {
  return node.subcategories?.length ?? 0;
}

type SubLink = { name: string; href: string };

function buildSubLinks(category: Category): SubLink[] {
  const result: SubLink[] = [];
  for (const sub of category.subcategories ?? []) {
    result.push({ name: sub.name, href: `/kategori/${category.slug}/${sub.slug}` });
  }
  return result;
}

function normalize(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesCategory(category: Category, q: string): { match: boolean; matchedSubs: SubLink[] } {
  const catName = normalize(category.name);
  const matchedSubs: SubLink[] = [];

  if (catName.includes(q) || category.slug.includes(q)) {
    // If category matches, show a few sub-links for navigation.
    const subs = buildSubLinks(category);
    return { match: true, matchedSubs: subs.slice(0, 8) };
  }

  // If category doesn't match, check direct subcategories.
  for (const sub of category.subcategories ?? []) {
    const subName = normalize(sub.name);
    if (subName.includes(q) || sub.slug.includes(q)) {
      matchedSubs.push({ name: sub.name, href: `/kategori/${category.slug}/${sub.slug}` });
      continue;
    }
    // Check one more level (sub-subcategories); if matches, surface the parent subcategory.
    for (const sub2 of sub.subcategories ?? []) {
      const sub2Name = normalize(sub2.name);
      if (sub2Name.includes(q) || sub2.slug.includes(q)) {
        matchedSubs.push({ name: sub.name, href: `/kategori/${category.slug}/${sub.slug}` });
        break;
      }
    }
  }

  // Dedupe
  const deduped = Array.from(new Map(matchedSubs.map((x) => [x.href, x])).values());
  return { match: deduped.length > 0, matchedSubs: deduped.slice(0, 8) };
}

export function KategorilerClient() {
  const [q, setQ] = useState('');
  const query = normalize(q);

  const stats = useMemo(() => {
    const totalCategories = categoryTree.length;
    const directSubs = categoryTree.reduce((acc, c) => acc + getDirectSubCount(c), 0);
    const allDesc = categoryTree.reduce((acc, c) => acc + countDescendants(c), 0);
    return { totalCategories, directSubs, allDesc };
  }, []);

  const filtered = useMemo(() => {
    if (!query) {
      return categoryTree.map((c) => ({ category: c, matchedSubs: [] as SubLink[] }));
    }
    return categoryTree
      .map((c) => {
        const res = matchesCategory(c, query);
        return { category: c, matchedSubs: res.matchedSubs, match: res.match };
      })
      .filter((x) => x.match)
      .map(({ category, matchedSubs }) => ({ category, matchedSubs }));
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Kategoriler</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Çanakkale’ye özel ilanları kategori kategori keşfedin. Arama kutusuyla hızlıca istediğiniz alana gidin.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kategori veya alt kategori ara… (örn: Temizlik, Telefon, Garson)"
            className="w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
          <span>
            <strong className="text-gray-900">{stats.totalCategories}</strong> ana kategori
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            <strong className="text-gray-900">{stats.directSubs}</strong> alt kategori
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            <strong className="text-gray-900">{stats.allDesc}</strong> toplam kategori
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-700 font-medium">Sonuç bulunamadı.</p>
          <p className="text-gray-600 mt-1">Farklı bir arama terimi deneyin veya tüm kategorileri görüntüleyin.</p>
          <button
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => setQ('')}
          >
            Aramayı temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(({ category, matchedSubs }) => {
            const directCount = getDirectSubCount(category);
            const exampleSubs = matchedSubs.length
              ? matchedSubs
              : buildSubLinks(category).slice(0, 4);
            const hiddenCount = Math.max(0, (category.subcategories?.length ?? 0) - exampleSubs.length);

            return (
              <div
                key={category.slug}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <Link href={`/kategori/${category.slug}`} className="block p-5 group">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                      {category.icon || '📌'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {category.name}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {directCount > 0 ? `${directCount} alt kategori` : 'Alt kategori yok'}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="px-5 pb-5">
                  {exampleSubs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exampleSubs.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          {s.name}
                        </Link>
                      ))}
                      {hiddenCount > 0 && !matchedSubs.length && (
                        <Link
                          href={`/kategori/${category.slug}`}
                          className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          +{hiddenCount} daha
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Bu kategoride alt kategori bulunmuyor.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2 text-center">
        <p className="text-gray-600 mb-4">Aradığınız kategoriyi bulamadınız mı?</p>
        <Link
          href="/ilanlar"
          className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Tüm İlanları Görüntüle
        </Link>
      </div>
    </div>
  );
}

