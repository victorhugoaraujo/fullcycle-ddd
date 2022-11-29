import CustomerCreatedEvent from "./customer-created.event";
import EnviaConsoleLogHandler from "./handler/EnviaConsoleLogHandler.handler";
import EnviaConsoleLog1Handler from "./handler/EnviaConsoleLog1Handler.handler";
import EnviaConsoleLog2Handler from "./handler/EnviaConsoleLog2Handler.handler";
import Address from "../value-object/address";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";

describe("Customer events test", () => {
  it("Should dispatch an event handler when customer is created", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();

    const spyEventHandler = jest.spyOn(eventHandler, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(2)
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toMatchObject([eventHandler, eventHandler2]);

    const customer = new CustomerCreatedEvent({
      id: 'c1',
      name: "Customer 1"
    });

    eventDispatcher.notify(customer);

    expect(spyEventHandler).toHaveBeenCalled()
    expect(spyEventHandler2).toHaveBeenCalled()
  });
  it("Should dispatch an event handler when customer's address changed", async () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();

    const spyEventHandler = jest.spyOn(eventHandler, "handle");
    eventDispatcher.register("CustomerCreatedEvent", eventHandler);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(1)
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandler);

    const customer = new Customer("c1", "Customer 1");
    const newAddress = new Address("Street 2", 2, "zip 2", "City 2");

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: customer.id,
      name: customer.name,
      address: newAddress
    })

    eventDispatcher.notify(customerCreatedEvent)
    expect(spyEventHandler).toHaveBeenCalled();
  })
})
