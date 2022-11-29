import { Sequelize } from "sequelize-typescript"
import Address from "../../customer/value-object/address";
import CustomerModel from "../../../infrastructure/db/sequelize/model/customer.model";
import OrderItemModel from "../../../infrastructure/db/sequelize/model/order-item.model";
import OrderModel from "../../../infrastructure/db/sequelize/model/order.model";
import ProductModel from "../../../infrastructure/db/sequelize/model/product.model";
import OrderRepository from "./order.repository";
import ProductRepository from "../../product/repository/product.repository";
import Product from "../../product/entity/product";
import OrderItem from "../entity/orderitem";
import Order from "../entity/order";
import CustomerRepository from "../../customer/repository/customer.repository";
import Customer from "../../customer/entity/customer";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true }
    });

    sequelize.addModels([CustomerModel, OrderModel, OrderItemModel, ProductModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");

    const address = new Address("Street 1", 1, "zipcode 1", "City 1");
    customer.changeAddress(address);

    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);

    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.id,
      product.name,
      product.price,
      2
    );
    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();

    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    })

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          product_id: orderItem.productId,
          quantity: orderItem.quantity,
          order_id: "123",
        },
      ],
    })
  });
  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("c1", "Customer 1");

    const address = new Address("Street 1", 1, "zipcode 1", "City 1");
    customer.changeAddress(address);

    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("p1", "Product 1", 100);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.id,
      product.name,
      product.price,
      2
    );

    let order = new Order("123", "c1", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    let orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });
    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "c1",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          product_id: orderItem.productId,
          quantity: orderItem.quantity,
          order_id: "123",
        },
      ],
    });

    const product2 = new Product("p2", "Product2", 200);
    await productRepository.create(product2);

    const orderItem2 = new OrderItem(
      "2",
      product.id,
      product.name,
      product.price,
      4
    );
    order = new Order("123", "c1", [orderItem, orderItem2]);
    await orderRepository.update(order);

    orderModel = await OrderModel.findOne(
      {
        where: {
          id: order.id,
        },
        include: ["items"]
      }
    )
    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "c1",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          product_id: orderItem.productId,
          quantity: orderItem.quantity,
          order_id: "123",
        },
        {
          id: orderItem2.id,
          name: orderItem2.name,
          price: orderItem2.price,
          product_id: orderItem2.productId,
          quantity: orderItem2.quantity,
          order_id: "123",
        },
      ],
    })
  });

  it("should find an order", async () => {

    const customerRepository = new CustomerRepository();
    const customer = new Customer("c1", "Customer 1");

    const address = new Address("Street 1", 1, "zipcode 1", "City 1");

    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("p1", "Product 1", 10);

    await productRepository.create(product);

    const orderItem = new OrderItem(
      "oi1",
      product.id,
      product.name,
      product.price,
      3
    );
    const orderRepository = new OrderRepository();
    const order = new Order("o1", "c1", [orderItem]);
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          order_id: order.id,
          product_id: orderItem.productId,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity
        }
      ]
    })

    const foundOrder = await orderRepository.find(order.id)

    expect(order).toStrictEqual(foundOrder)
  });

  it("should throw error when order is not found", async () => {
    const orderRepository = new OrderRepository();
    expect(async () => {
      await orderRepository.find('321');
    }).rejects.toThrow("Order not found")
  })

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("c1", "Customer 1");
    const address = new Address("Street 1", 1, "zipcode 1", "City 1");

    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("p1", "Product 1", 10);

    await productRepository.create(product);

    const orderItem = new OrderItem(
      "oi1",
      product.id,
      product.name,
      product.price,
      3
    );

    const orderRepository = new OrderRepository();
    const order = new Order("o1", "c1", [orderItem]);
    await orderRepository.create(order);

    const orderItem2 = new OrderItem(
      "oi2",
      product.id,
      product.name,
      product.price,
      2
    );

    const order2 = new Order("o2", "c1", [orderItem2]);
    await orderRepository.create(order2);

    const foundOrders = await orderRepository.findAll();

    expect(foundOrders).toHaveLength(2);
    expect(foundOrders).toContainEqual(order);
    expect(foundOrders).toContainEqual(order2);
  })
});
