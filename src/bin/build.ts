import { ArgumentsCamelCase, BuilderCallback } from "yargs";
import Webpack from "webpack";
import { config } from "../webpack-config";

export const command = "build" as const;
export const description = "Build production";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const builder: BuilderCallback<unknown, unknown> = () => {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = async (args: ArgumentsCamelCase<unknown>) => {
  const configuration = config("production");
  const compiler = Webpack(configuration);
  await new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(1);
      }
    });
  });
};
