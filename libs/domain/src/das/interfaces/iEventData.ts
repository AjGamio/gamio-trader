export interface EventData {
  Item1: string;
  Item2: {
    Message: string;
    CommandType: number;
    CorrelationId: string;
    Parameters: string[];
  };
}

export interface DASEventData {
  Identifier: string;
  Channel: string;
  Events: EventData[];
  TimeStamp: Date;
}

export enum ProcessingStatus {
  Active = 'ACTIVE',
  Processing = 'PROCESSING',
  Queued = 'QUEUED',
  Blocked = 'BLOCKED',
  Empty = 'EMPTY',
}

export enum MessageType {
  Info = 'INFO',
  Error = 'ERROR',
  Success = 'SUCCESS',
  Warning = 'WARNING',
}

export interface BotEventData {
  botId: string;
  status: ProcessingStatus;
  message: string;
  botName: string;
  messageType: MessageType;
  TimeStamp: string;
  Channel: string;
}
