import React from 'react';

export default function SSSPage() {
  const faqs = [
    {
      question: "Siparişim ne zaman elime ulaşır?",
      answer: "Siparişleriniz genellikle 2-4 iş günü içerisinde kargoya verilir ve 1-3 iş günü içerisinde teslim edilir."
    },
    {
      question: "İade politikası nedir?",
      answer: "Ürünlerimizi 14 gün içerisinde iade edebilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir."
    },
    {
      question: "Ödeme seçenekleri nelerdir?",
      answer: "Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz mevcuttur."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sıkça Sorulan Sorular</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 
