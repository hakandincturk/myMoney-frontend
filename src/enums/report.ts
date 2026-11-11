// Report Period Kind - Dönemin kesinlik seviyesi
export enum PeriodKind {
  ACTUAL = 'ACTUAL',       // Geçmiş ay, rakamlar kesinleşti
  PARTIAL = 'PARTIAL',     // İçinde bulunulan ay, kısmen gerçekleşti
  PROJECTED = 'PROJECTED', // Gelecek ay, yalnızca planlı taksitlerden hesaplandı
}

// Report Flow Type - Rapor akış yönü
export enum ReportFlowType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

// Tag Sum Mode - Çok etiketli işlemlerde tutarın nasıl sayılacağı
export enum TagSumMode {
  DISTRIBUTED = 'DISTRIBUTED',   // Tutar etiketlere bölünür, toplam = ay toplamı
  DOUBLE_COUNT = 'DOUBLE_COUNT', // Her etikete tam tutar yazılır, toplam ay toplamını aşar
}

// Recurring Kind - Tekrar eden harcamanın türü
export enum RecurringKind {
  INSTALLMENT = 'INSTALLMENT', // Çok taksitli tek işlem
  REPEATED = 'REPEATED',       // Aynı isimle tekrar eden ayrı işlemler
}
