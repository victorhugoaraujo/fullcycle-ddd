import EventHandlerInterface from "../../@shared/event-handler.interface";
import CustomerCreatedEvent from "../customer-created.event";

export default class EnviaConsoleLogHandler implements EventHandlerInterface<CustomerCreatedEvent> {
  handle(event: CustomerCreatedEvent): void {
    const { eventData } = event
    console.log(`Endereço do client: ${eventData.id}, ${eventData.name} alterado para: ${eventData.address}.`)
  }
}
