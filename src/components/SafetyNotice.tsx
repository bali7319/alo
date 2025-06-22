import React from 'react';

const SafetyNotice = () => {
  return (
    <div className="bg-yellow-50 border-t border-b border-yellow-200 py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-sm text-yellow-800">
          <p className="mb-2">
            Siz de kendi güvenliğiniz ve diğer kullanıcıların daha sağlıklı alışveriş yapabilmeleri için, 
            satın almak istediğiniz ürünü teslim almadan ön ödeme yapmamaya, avans ya da kapora ödememeye özen gösteriniz. 
            İlan sahiplerinin ilanlarda belirttiği herhangi bir bilgi ya da görselin gerçeği yansıtmadığını düşünüyorsanız 
            veya ilan sahiplerinin hesap profillerindeki bilgilerin doğru olmadığını düşünüyorsanız, lütfen ilanı bildiriniz.
          </p>
          <p>
            ALO17.TR'de yer alan kullanıcıların oluşturduğu tüm içerik, görüş ve bilgilerin doğruluğu, eksiksiz ve değişmez olduğu, 
            yayınlanması ile ilgili yasal yükümlülükler içeriği oluşturan kullanıcıya aittir. Bu içeriğin, görüş ve bilgilerin yanlışlık, 
            eksiklik veya yasalarla düzenlenmiş kurallara aykırılığından ALO17.TR hiçbir şekilde sorumlu değildir. 
            Sorularınız için ilan sahibi ile irtibata geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyNotice; 
