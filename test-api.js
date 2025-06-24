async function testFavoriteAPI() {
  const baseUrl = 'http://localhost:3000';
  const listingId = 'cmc3iipnt0001qjy49f3b1ugx'; // Test ilanı ID'si

  try {
    console.log('1. Favori durumu kontrol ediliyor...');
    const statusResponse = await fetch(`${baseUrl}/api/listings/${listingId}/favorite`);
    const statusData = await statusResponse.json();
    console.log('Favori durumu:', statusData);

    console.log('\n2. Favori ekleme test ediliyor...');
    const addResponse = await fetch(`${baseUrl}/api/listings/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listingId }),
    });
    
    console.log('Response status:', addResponse.status);
    const addData = await addResponse.json();
    console.log('Response data:', addData);

    console.log('\n3. Favori durumu tekrar kontrol ediliyor...');
    const statusResponse2 = await fetch(`${baseUrl}/api/listings/${listingId}/favorite`);
    const statusData2 = await statusResponse2.json();
    console.log('Favori durumu:', statusData2);

  } catch (error) {
    console.error('API test hatası:', error);
  }
}

testFavoriteAPI(); 