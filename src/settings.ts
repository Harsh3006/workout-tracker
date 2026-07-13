class Settings {
  readonly nodeEnv: string;

  readonly database: Readonly<{
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
    ssl: boolean;
    minConnections: number;
    maxConnections: number;
  }>;

  readonly jwt: Readonly<{
    secret: string;
  }>;

  constructor() {
    this.nodeEnv = process.env.NODE_ENV ?? "development";

    this.database = {
      name: process.env.DATABASE_NAME!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      host: process.env.DATABASE_HOST!,
      port: Number(process.env.DATABASE_PORT!),
      ssl: process.env.DATABASE_SSL === "true",
      minConnections: parseInt(process.env.DATABASE_MIN_CONNECTIONS ?? "2", 10),
      maxConnections: parseInt(
        process.env.DATABASE_MAX_CONNECTIONS ?? "10",
        10
      ),
    };

    this.jwt = {
      secret: process.env.JWT_SECRET!,
    };
  }
}

const settings = new Settings();
export default settings;
