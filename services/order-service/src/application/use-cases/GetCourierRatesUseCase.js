export const DEFAULT_COURIERS = [
  {
    id: 'jne-reg',
    courier: 'JNE',
    service: 'Reguler',
    cost: 15000,
    etd: '2-3 hari',
    description: 'Layanan pengiriman reguler terpercaya ke seluruh Indonesia',
  },
  {
    id: 'jne-yes',
    courier: 'JNE',
    service: 'YES',
    cost: 25000,
    etd: '1 hari',
    description: 'Layanan kilat esok hari sampai ke kota-kota besar',
  },
  {
    id: 'sicepat-reg',
    courier: 'SiCepat',
    service: 'Reguler',
    cost: 14000,
    etd: '2-3 hari',
    description: 'Pengiriman cepat dengan tarif hemat dan terjangkau',
  },
  {
    id: 'sicepat-best',
    courier: 'SiCepat',
    service: 'BEST',
    cost: 22000,
    etd: '1 hari',
    description: 'Pengiriman satu hari kerja sampai tujuan',
  },
  {
    id: 'gosend-instant',
    courier: 'GoSend',
    service: 'Instant',
    cost: 35000,
    etd: '2-3 jam',
    description: 'Pengiriman instan kilat langsung tiba dalam beberapa jam',
  },
  {
    id: 'gosend-sameday',
    courier: 'GoSend',
    service: 'SameDay',
    cost: 20000,
    etd: '6-8 jam',
    description: 'Pengiriman sampai pada hari yang sama untuk area lokal',
  },
  {
    id: 'jnt-ez',
    courier: 'J&T',
    service: 'EZ',
    cost: 16000,
    etd: '2-3 hari',
    description: 'Layanan reguler ekspres menjangkau seluruh nusantara',
  },
  {
    id: 'jnt-super',
    courier: 'J&T',
    service: 'Super',
    cost: 26000,
    etd: '1 hari',
    description: 'Layanan prioritas cepat sampai dengan garansi tepat waktu',
  },
];

export class GetCourierRatesUseCase {
  constructor() {}

  async execute({ courier = null } = {}) {
    if (courier && typeof courier === 'string' && courier.trim().length > 0) {
      const lowerCourier = courier.trim().toLowerCase();
      return DEFAULT_COURIERS.filter(c => c.courier.toLowerCase() === lowerCourier);
    }
    return DEFAULT_COURIERS;
  }
}
