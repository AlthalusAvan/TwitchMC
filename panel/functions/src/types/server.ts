export interface MCServer {
  code?: string;
  name: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  playersManaged: number;
  status: "Awaiting Verification" | "Verified";
  user: string;
  uuids: string[];
  gracePeriod?: number; // In days
  usersSeen?: {
    [uuid: string]: number;
  };
}
