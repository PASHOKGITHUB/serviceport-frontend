import { BaseEntity } from './common';
import { ProductDetails } from './service';

export interface Customer extends BaseEntity {
  customerId: string;
  customerName: string;
  phone: string;
  location: string;
  serviceId: {
    _id: string;
    serviceId: string;
    action: string;
    productDetails: ProductDetails[];
  };
  branchId: {
    _id: string;
    branchName: string;
    location: string;
  };
  address: string;
  serviceStatus: string;
}