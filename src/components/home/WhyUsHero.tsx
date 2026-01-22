import React from 'react';

export function WhyUsHero() {
  return (
    <section aria-labelledby="why-us-hero-title" className="w-full bg-slate-50 border-y">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            id="why-us-hero-title"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
          >
            Çanakkale’nin İlan Sitesinde Neden Olmalısınız?
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600">
            Emlak ve vasıta karmaşasından uzak, sadece şehre ve ihtiyaca özel fırsatlar.
          </p>
        </div>
      </div>
    </section>
  );
}

