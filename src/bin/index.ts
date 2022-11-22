#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as startScript from "./start";
import * as buildScript from "./build";

yargs(hideBin(process.argv))
  .command(
    startScript.command,
    startScript.description,
    startScript.builder,
    startScript.handler
  )
  .command(
    buildScript.command,
    buildScript.description,
    buildScript.builder,
    buildScript.handler
  )
  .demandCommand(1)
  .parse();
