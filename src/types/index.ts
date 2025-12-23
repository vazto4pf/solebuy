export interface Bundle {
  id: string;
  name: string;
  dataAmount: string;
  validity: string;
  price: number;
}

export interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
  bundles: Bundle[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  productName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}
