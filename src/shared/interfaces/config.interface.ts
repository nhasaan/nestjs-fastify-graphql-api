export interface AppConfig {
  env: string;
  port: number;
  logLevel: string;
}

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export interface DatabaseConfig {
  mongodb: {
    uri: string;
    options: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
    };
  };
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    password: string;
    db: number;
  };
}

export interface GraphqlConfig {
  playground: boolean;
  introspection: boolean;
  debug: boolean;
}
