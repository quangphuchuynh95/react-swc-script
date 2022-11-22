import { ArgumentsCamelCase, BuilderCallback } from "yargs";
import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { config } from "../webpack-config";

export const command = "start" as const;
export const description = "Start dev server";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const builder: BuilderCallback<unknown, unknown> = () => {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = async (args: ArgumentsCamelCase<unknown>) => {
  const configuration = config("development");
  const compiler = Webpack(configuration);
  const server = new WebpackDevServer(configuration.devServer, compiler);

  const runServer = async () => {
    console.log("Starting server...");
    await server.start();
  };

  await runServer();
};
