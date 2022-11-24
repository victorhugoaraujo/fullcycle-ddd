import { Sequelize } from "sequelize-typescript"
import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import CustomerModel from "../db/sequelize/model/customer.model";
import CustomerRepository from "./customer.repository";

describe("Customer repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory",
      logging: false,
      sync: { force: true }
    });

    sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a customer", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('c1', "Customer 1");
    const address = new Address("Street 1", 1, "zip 1", "City 1")
    customer.Address = address;

    await customerRepository.create(customer);

    const customerModel = await CustomerModel.findOne({ where: { id: "c1" } })

    expect(customerModel.toJSON()).toStrictEqual({
      id: "c1",
      name: "Customer 1",
      active: customer.isActive(),
      rewardPoints: customer.rewardPoints,
      street: address.street,
      number: address.number,
      zipcode: address.zip,
      city: address.city,
    });
  });

  it("should update a customer", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Rua", 1, "123", "São Paulo");
    customer.Address = address;

    await customerRepository.create(customer);

    customer.changeName("Customer 2");
    await customerRepository.update(customer);

    const customerModel = await CustomerModel.findOne({ where: { id: customer.id } });

    expect(customerModel.toJSON()).toStrictEqual({
      id: "1",
      name: "Customer 2",
      active: customer.isActive(),
      rewardPoints: customer.rewardPoints,
      street: address.street,
      number: address.number,
      zipcode: address.zip,
      city: address.city,
    })
  })

  it("should find a customer", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("c1", "Customer 1");
    const address = new Address("Street 1", 1, "zip 1", "City 1")
    customer.Address = address;

    await customerRepository.create(customer);

    const customerModel = await CustomerModel.findOne({ where: { id: customer.id } });

    expect(customerModel.toJSON()).toStrictEqual({
      id: "c1",
      name: "Customer 1",
      active: customer.isActive(),
      rewardPoints: customer.rewardPoints,
      street: address.street,
      number: address.number,
      zipcode: address.zip,
      city: address.city,
    });
  });

  it("should throw error when customer it not found", async () => {
    const customerRepository = new CustomerRepository();
    expect(async () => {
      await customerRepository.find("123321");
    }).rejects.toThrow("Customer not found")
  });

  it("should find all customers", async () => {
    const customerRepository = new CustomerRepository();
    const customer1 = new Customer("c1", "Customer 1");
    const address1 = new Address("Street 1", 1, "zip 1", "City 1")
    customer1.Address = address1;
    customer1.addRewardPoints(10);
    customer1.activate();


    const customer2 = new Customer("c2", "Customer 2");
    const address2 = new Address("Street 2", 1, "zip 2", "City 2")
    customer2.Address = address2;
    customer2.addRewardPoints(20);
    customer2.activate();

    await customerRepository.create(customer1);
    await customerRepository.create(customer2);

    const foundCustomers = await customerRepository.findAll();

    expect(foundCustomers).toHaveLength(2);
    expect(foundCustomers).toContainEqual(customer1);
    expect(foundCustomers).toContainEqual(customer2);
  })
})