import OrderItem from "./orderitem";

export default class Order {
  _id: string;
  _customerId: String;
  _items: OrderItem[];

  constructor(id: string, customerId: string, items: OrderItem[]) {
    this._id = id;
    this._customerId = customerId;
    this._items = items;
  }
}