import { Config } from "remotion";
import { enableTailwind } from "@remotion/tailwind";
 
Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});