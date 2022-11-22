import path from "path";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { loadEnvFiles } from "./utils";
import webpack, { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import type { CompilerOptions } from "typescript";

export type RunMode = "production" | "development" | "none";

export function config(
  mode: RunMode = "production"
): WebpackConfiguration & { devServer: WebpackDevServerConfiguration } {
  const isDevelopment = mode === "development";

  loadEnvFiles(mode);

  const tsconfigFile = path.join(process.cwd(), "tsconfig.json");

  const alias: Record<string, string> = {};

  if (fs.existsSync(tsconfigFile)) {
    const tsconfig: {
      compilerOptions: CompilerOptions;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require(tsconfigFile);
    const aliases = Object.entries(tsconfig.compilerOptions.paths || {});
    for (const [key, [value]] of aliases) {
      alias[key.slice(0, key.length - 2)] = path.resolve(
        process.cwd(),
        value.slice(0, value.length - 2)
      );
    }
  }

  const plugins: WebpackConfiguration["plugins"] = [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), "public/index.html"), // to import index.html file inside index.js
    }),
    new MiniCssExtractPlugin({
      filename: "index.[fullhash].css",
      chunkFilename: "[id].[fullhash].bundle.css",
    }),
  ];

  if (isDevelopment) {
    plugins.push(new ReactRefreshWebpackPlugin());
  } else {
    let old = 0;
    plugins.push(
      new webpack.ProgressPlugin((percentage, message) => {
        if (Math.floor(percentage * 100) !== old) {
          // eslint-disable-next-line no-console
          console.log(`${message}: ${Math.floor(percentage * 100)}%`);
          old = Math.floor(percentage * 100);
        }
      })
    );
  }

  return {
    mode,
    resolve: {
      extensions: ["", ".js", ".jsx", ".json", ".ts", ".tsx"],
      alias,
    },
    // This can make build slower, faster, also affect to file size
    devtool: mode !== "production" ? "eval-source-map" : "source-map",
    entry: [
      path.resolve(process.cwd(), "src/index.tsx"),
      path.resolve(process.cwd(), "src/index.scss"),
    ],
    output: {
      publicPath: process.env.PUBLIC_URL || "/",
      path: path.join(process.cwd(), "/build"),
      filename: "index.[fullhash].js",
      chunkFilename: "[id].[fullhash].bundle.js",
    },
    plugins,
    devServer: {
      open: true,
      historyApiFallback: true,
      port: process.env.PORT,
      static: {
        directory: path.join(process.cwd(), "public"),
      },
      hot: true,
      liveReload: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|tsx|ts)$/, // .js and .jsx files
          exclude: /node_modules/, // excluding the node_modules folder
          use: {
            loader: "swc-loader",
            options: {
              jsc: {
                transform: {
                  react: {
                    development: isDevelopment,
                    refresh: isDevelopment,
                  },
                },
              },
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "resolve-url-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(jpe?g|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          type: "asset/resource",
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                prettier: false,
                svgo: false,
                svgoConfig: {
                  plugins: [
                    {
                      removeViewBox: false,
                    },
                  ],
                },
                titleProp: true,
                ref: true,
              },
            },
            {
              loader: "file-loader",
            },
          ],
        },
      ],
    },
  };
}
