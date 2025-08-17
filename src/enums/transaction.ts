// Transaction Types - İşlem Türleri
export enum TransactionType {
  DEBT = 'DEBT',           // Borç oluşturma
  CREDIT = 'CREDIT',       // Alacak oluşturma
  PAYMENT = 'PAYMENT',     // Ödeme yapma
  COLLECTION = 'COLLECTION' // Tahsilat yapma
}

// Transaction Status - İşlem Durumları
export enum TransactionStatus {
  PENDING = 'PENDING',     // Henüz ödeme
  PARTIAL = 'PARTIAL',     // Kısmi ödeme yapılmış
  PAID = 'PAID'            // Tamamı ödenmiş
}
